// Constants for socket event names
const SOCKET_EVENTS = {
    // Chat events
    SEND_MESSAGE: "send_message",
    RECEIVE_MESSAGE: "receive_message",
    MESSAGES_LOADED: "messages_loaded",

    // Room events
    CREATE_CHAT_ROOM: "create_chat_room",
    GET_USER_ROOMS: "get_user_rooms",
    LEAVE_ROOM: "leave_room",

    // User events
    USER_ONLINE: "user_online",
    USER_OFFLINE: "user_offline",
    USER_SEARCH: "user_search",
    USER_SET_ACTIVE_ROOM: "user_set_active_room",

    // Authentication events
    USER_SIGNUP: "user_signup",
    USER_LOGIN: "user_login",
    USER_LOGOUT: "user_logout",
    USER_REFRESH_TOKEN: "user_refresh_token",

    // System events
    ERROR: "error",
    CONNECT: "connect",
    DISCONNECT: "disconnect",
};

export default SOCKET_EVENTS;
