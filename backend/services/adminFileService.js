import fs from 'fs';
import path from 'path';

export const getAllLogFileNames = async (logDir = 'logs') => {
    // Checks if the dir exists
    if (!fs.existsSync(logDir)) {
        return [];
    }

    // Reads everything thats in the directory then filters out the rest and only sends the daily log files
    const files = await fs.promises.readdir(logDir);
    return files.filter(file => file.startsWith('socket-') && file.endsWith('.log'));
};

export const getLogFileContentByDate = async (date, logDir = 'logs') => {
    const fileName = `socket-${date}.log`;
    const filePath = path.join(logDir, fileName);
    // Checks if the file path exists
    if (!fs.existsSync(filePath)) {
        return [];
    }
    // Reads the valid file and splits each line and returns an array  of every log
    const content = await fs.promises.readFile(filePath, 'utf8');
    return content.split('\n').filter(line => line.trim() !== '');
};
