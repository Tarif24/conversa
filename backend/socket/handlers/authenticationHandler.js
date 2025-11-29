import EVENTS from '../../../constants/socketEvents.js';
import {
    signup,
    login,
    logout,
    refreshToken,
    getAllUserRooms,
} from '../../controllers/authenticationController.js';

class AuthenticationHandler {
    constructor(io, connectionManager) {
        this.io = io;
        this.connectionManager = connectionManager;
    }

    handleConnection(socket) {
        socket.on(EVENTS.USER_SIGNUP, (user, callback) =>
            this.handleSignup(socket, user, callback)
        );
        socket.on(EVENTS.USER_LOGIN, (user, callback) => this.handleLogin(socket, user, callback));
        socket.on(EVENTS.USER_LOGOUT, (user, callback) =>
            this.handleLogout(socket, user, callback)
        );
        socket.on(EVENTS.USER_REFRESH_TOKEN, (tokenData, callback) =>
            this.handleRefreshToken(socket, tokenData, callback)
        );
    }

    async handleSignup(socket, user, callback) {
        try {
            const emailFixed = user.email.trim().toLowerCase();

            console.log('Handel signup for user email: ', emailFixed);

            const result = await signup({ ...user, email: emailFixed });

            if (result.success) {
                this.connectionManager.addUserIDToConnection(socket, result.user._id.toString());

                socket.userId = result.user._id.toString();
                socket.userEmail = result.user.email;
            }

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for signup event');
            }
        } catch (error) {
            console.error('Handle Signup error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_SIGNUP,
                message: 'Server error',
            });
        }
    }

    async handleLogin(socket, user, callback) {
        try {
            const emailFixed = user.email.trim().toLowerCase();

            console.log('Handel login for user email: ', emailFixed);

            const result = await login({ ...user, email: emailFixed });

            if (!result.success) {
                if (callback) {
                    callback(result);
                } else {
                    console.log('No callback provided for login event');
                }
                return;
            }

            const justCameOnline = this.connectionManager.addUserIDToConnection(
                socket,
                result.user._id.toString(),
                result.user.username
            );

            const userId = result.user._id.toString();
            const username = result.user.username;

            socket.userId = userId;
            socket.userEmail = result.user.email;

            if (justCameOnline) {
                const userRooms = await getAllUserRooms(userId);

                userRooms.rooms.forEach(room => {
                    this.io.to(room._id.toString()).emit(EVENTS.USER_STATUS_UPDATE, {
                        userId: userId,
                        username: username,
                        status: 'online',
                    });
                });
            }

            // Join all existing user rooms on login
            for (const room of result.user.rooms) {
                socket.join(room);
            }

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for login event');
            }
        } catch (error) {
            console.error('Handle Login error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_LOGIN,
                message: 'Server error',
            });
        }
    }

    async handleLogout(socket, user, callback) {
        try {
            console.log('Handel logout for user email: ', socket.userEmail);

            const result = await logout(user.refreshToken, socket.userId);

            const connectionResult = this.connectionManager.forceUserOffline(socket.userId);

            if (connectionResult.wentOffline) {
                const userRooms = await getAllUserRooms(result.userId);

                userRooms.rooms.forEach(room => {
                    this.io.to(room._id.toString()).emit(EVENTS.USER_STATUS_UPDATE, {
                        userId: result.userId,
                        status: 'offline',
                    });
                });
            }

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for logout event');
            }
        } catch (error) {
            console.error('Handle Logout error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_LOGOUT,
                message: 'Server error',
            });
        }
    }

    async handleRefreshToken(socket, tokenData, callback) {
        try {
            console.log('Handle refresh token for: ', socket.userId);

            const { token } = tokenData;

            if (!token) {
                return callback({
                    success: false,
                    message: 'Refresh token required',
                });
            }

            const result = await refreshToken(tokenData);

            if (callback) {
                callback(result);
            } else {
                console.log('No callback provided for refresh token event');
            }
        } catch (error) {
            console.error('Handle Refresh Token error:', error);
            socket.emit(EVENTS.ERROR, {
                event: EVENTS.USER_REFRESH_TOKEN,
                message: 'Server error',
            });
        }
    }
}

export default AuthenticationHandler;
