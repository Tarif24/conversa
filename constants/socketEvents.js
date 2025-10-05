// Constants for socket event names
const SOCKET_EVENTS = {
    // Chat events
    JOIN_ROOM: "join_room",
    LEAVE_ROOM: "leave_room",
    SEND_MESSAGE: "send_message",
    RECEIVE_MESSAGE: "receive_message",
    MESSAGES_LOADED: "messages_loaded",

    // User events
    USER_ONLINE: "user_online",
    USER_OFFLINE: "user_offline",
    USER_SEARCH: "user_search",

    // Authentication events
    USER_SIGNUP: "user_signup",
    USER_LOGIN: "user_login",
    USER_LOGOUT: "user_logout",
    USER_REFRESH_TOKEN: "user_refresh_token",

    // Room events
    ROOM_JOINED: "room_joined",
    USER_JOINED_ROOM: "user_joined",
    USER_LEFT_ROOM: "user_left",

    // System events
    ERROR: "error",
    CONNECT: "connect",
    DISCONNECT: "disconnect",
};

export default SOCKET_EVENTS;
