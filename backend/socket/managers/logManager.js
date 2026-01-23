import fs from 'fs';
import path from 'path';

class Logger {
    constructor(logDir = 'logs') {
        console.log('cwd', process.cwd());
        this.logDir = logDir;
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    getLogFilePath() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `socket-${date}.log`);
    }

    log(level, event, data = {}) {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] [${level}] ${event}: ${JSON.stringify(data)}`;

        // Write to file
        fs.appendFileSync(this.getLogFilePath(), message + '\n', 'utf8');

        // Also console log
        //console.log(message);
    }

    connection(socketId, userId, event) {
        this.log('INFO', event, { socketId, userId });
    }

    message(socketId, userId, roomId) {
        this.log('INFO', 'MESSAGE', { socketId, userId, roomId });
    }

    rateLimit(socketId, userId) {
        this.log('WARN', 'RATE_LIMIT', { socketId, userId });
    }

    error(data = {}) {
        this.log('ERROR', 'ERROR', {
            ...data,
        });
    }

    rotateOldLogs(daysToKeep = 30) {
        const files = fs.readdirSync(this.logDir);
        const now = Date.now();
        const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

        files.forEach(file => {
            const filePath = path.join(this.logDir, file);
            const stats = fs.statSync(filePath);
            const age = now - stats.mtimeMs;

            if (age > maxAge) {
                fs.unlinkSync(filePath);
                console.log(`[CLEANUP] Deleted old log: ${file}`);
            }
        });
    }
}

export default Logger;
