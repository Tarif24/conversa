import EVENTS from '../../../constants/socketEvents.js';
import {
    adminLogin,
    getAllAdminData,
    getAdminLogForDay,
} from '../../controllers/adminController.js';

class AdminHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        // Log monitoring, Active user management, System alerts, Analytics dashboard, System metrics and health
        socket.on(EVENTS.ADMIN_LOGIN, (user, callback) =>
            this.handleAdminLogin(socket, user, callback)
        );
        socket.on(EVENTS.GET_ALL_ADMIN_DATA, (data, callback) =>
            this.handleGetAllAdminData(socket, data, callback)
        );
        socket.on(EVENTS.GET_ADMIN_LOG_FOR_DAY, (data, callback) =>
            this.handleGetAdminLogForDay(socket, data, callback)
        );
    }

    async handleAdminLogin(socket, user, callback) {
        try {
            const result = await adminLogin(user);

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for admin login event');
            }
        } catch (error) {
            console.error('handleAdminLogin error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.ADMIN_LOGIN,
                message: 'Server error',
            });
        }
    }

    async handleGetAllAdminData(socket, data, callback) {
        try {
            const result = await getAllAdminData(data);

            const updatedResult = {
                ...result,
                activeUsers: this.connectionManager.getActiveUserCount(),
            };

            if (callback) {
                callback(updatedResult);
            } else {
                console.log('No callback provided for Get All Admin Data event');
            }
        } catch (error) {
            console.error('handleGetAllAdminData error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_ALL_ADMIN_DATA,
                message: 'Server error',
            });
        }
    }

    async handleGetAdminLogForDay(socket, data, callback) {
        try {
            const result = await getAdminLogForDay(data.day);

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for Get Admin Log For Day event');
            }
        } catch (error) {
            console.error('handleGetAdminLogForDay error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.GET_ADMIN_LOG_FOR_DAY,
                message: 'Server error',
            });
        }
    }
}

export default AdminHandler;
