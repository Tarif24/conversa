// Constants for socket event names
const SOCKET_EVENTS = {
    // Chat events
    SEND_MESSAGE: 'send_message',
    EDIT_MESSAGE: 'edit_message',
    DELETE_MESSAGE: 'delete_message',
    RECEIVE_MESSAGE: 'receive_message',
    MESSAGES_LOADED: 'messages_loaded',
    MARK_AS_READ: 'mark_as_read',
    USER_READ_UPDATE: 'user_read_update',

    // Room events
    CREATE_CHAT_ROOM: 'create_chat_room',
    GET_MESSAGES_FOR_ROOM: 'get_messages_for_room',
    GET_USER_ROOMS: 'get_user_rooms',
    ROOM_REFRESH: 'room_refresh',
    SET_ACTIVE_ROOM: 'set_active_room',
    LEAVE_ROOM: 'leave_room',
    TYPING_START: 'typing_start',
    TYPING_STOP: 'typing_stop',
    TYPING_UPDATE: 'typing_update',
    GET_UNREAD_COUNT: 'get_unread_count',
    GET_UNREAD_COUNTS: 'get_unread_counts',
    USER_UNREAD_UPDATE: 'user_unread_update',
    UNREAD_COUNT_INCREMENT: 'unread_count_increment',

    // User events
    USER_ONLINE: 'user_online',
    USER_OFFLINE: 'user_offline',
    USER_STATUS_UPDATE: 'user_status_update',
    USER_SEARCH: 'user_search',
    USER_SET_ACTIVE_ROOM: 'user_set_active_room',
    GET_USERNAME: 'get_username',
    USER_RECONNECT: 'user_reconnect',

    // Authentication events
    USER_SIGNUP: 'user_signup',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_REFRESH_TOKEN: 'user_refresh_token',

    // System events
    ERROR: 'error',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
};

export default SOCKET_EVENTS;
