import fs from 'fs';
import path from 'path';

export const getAllLogFileNames = async (logDir = 'logs') => {
    if (!fs.existsSync(logDir)) {
        return [];
    }
    const files = await fs.readdir(logDir);
    return files.filter(file => file.startsWith('socket-') && file.endsWith('.log'));
};

export const getLogFileContentByDate = async (date, logDir = 'logs') => {
    const fileName = `socket-${date}.log`;
    const filePath = path.join(logDir, fileName);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content.split('\n').filter(line => line.trim() !== '');
};
