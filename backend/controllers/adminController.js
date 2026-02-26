import { generateAdminToken } from '../services/authenticationService.js';
import { getLogFileContentByDate, getAllLogFileNames } from '../services/adminFileService.js';
import {
    getTotalUserCount,
    getTotalRoomCount,
    getTotalMessageCount,
    deleteAllDBData,
} from '../services/databaseService.js';

export const adminLogin = async user => {
    try {
        // Checks username and password with the ones in the env
        if (
            user.username === process.env.ADMIN_USERNAME &&
            user.password === process.env.ADMIN_PASSWORD
        ) {
            const adminUser = {
                _id: user.username,
            };
            const token = generateAdminToken(adminUser);
            return { success: true, token: token };
        } else {
            return { success: false, message: 'Invalid admin credentials' };
        }
    } catch (error) {
        console.error('Controller Admin Login error:', error);
        const message = 'Failed to Login Admin user: ' + error;
        return { success: false, message: message };
    }
};

export const getAllAdminData = async data => {
    try {
        const logFileNames = await getAllLogFileNames();
        const totalUsers = await getTotalUserCount();
        const totalRooms = await getTotalRoomCount();
        const totalMessages = await getTotalMessageCount();

        return {
            success: true,
            logs: logFileNames,
            totalUsers: totalUsers,
            totalRooms: totalRooms,
            totalMessages: totalMessages,
        };
    } catch (error) {
        console.error('Controller getAllAdminData error:', error);
        const message = 'Failed to getAllAdminData user: ' + error;
        return { success: false, message: message };
    }
};

export const getAdminLogForDay = async day => {
    try {
        const logContent = await getLogFileContentByDate(day);

        if (logContent.length === 0) {
            return { success: false, message: 'No log file found for the specified day' };
        }

        return { success: true, log: logContent };
    } catch (error) {
        console.error('Controller getAdminLogForDay error:', error);
        const message = 'Failed to getAdminLogForDay user: ' + error;
        return { success: false, message: message };
    }
};

export const deleteAllData = async () => {
    try {
        await deleteAllDBData();
        return { success: true, message: 'All data deleted successfully' };
    } catch (error) {
        console.error('Controller deleteAllData error:', error);
        const message = 'Failed to deleteAllData user: ' + error;
        return { success: false, message: message };
    }
};
