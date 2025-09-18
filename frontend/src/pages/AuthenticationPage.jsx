import React from "react";
import {
    useSocketIO,
    useSocketIOEvent,
    useSocketIOState,
} from "../hooks/useSocketIO";

const AuthenticationPage = () => {
    // Get connection status and send function
    const { isConnected, send, joinRoom, leaveRoom } = useSocketIO();

    return (
        <div>
            <h1>AUTHENTICATION PAGE</h1>
        </div>
    );
};

export default AuthenticationPage;
