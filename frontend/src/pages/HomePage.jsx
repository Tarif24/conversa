import React, { useEffect, useState } from "react";
import {
    useSocketIO,
    useSocketIOEvent,
    useSocketIOState,
} from "../hooks/useSocketIO";
import EVENTS from "../../../constants/socketEvents";
import MessagingInterface from "../components/MessagingInterface";
import ChatsSidebar from "../components/ChatsSidebar";
import CreateChat from "../components/CreateChat";

const HomePage = () => {
    const {
        isConnected,
        connectionState,
        user,
        sendProtected,
        sendRefresh,
        sendLastEmitted,
    } = useSocketIO();

    const [isCreateChatActive, setIsCreateChatActive] = useState(false);
    const [activeRoom, setActiveRoom] = useState(null);

    const roomClicked = (room) => {
        setActiveRoom(room);
    };

    // Listen for incoming messages
    useSocketIOEvent(EVENTS.ERROR, (error) => {
        if (error.message.includes("Invalid or expired token")) {
            sendRefresh((response) => {
                if (response.success) {
                    sendLastEmitted();
                } else {
                    console.error("Token refresh failed:", response.message);
                }
            });
        }
    });

    return (
        <div className="w-full h-full flex items-center justify-center">
            <ChatsSidebar
                isCreateChatActive={setIsCreateChatActive}
                onRoomClicked={roomClicked}
            />
            {isCreateChatActive ? (
                <CreateChat isCreateChatActive={setIsCreateChatActive} />
            ) : (
                <MessagingInterface room={activeRoom} />
            )}
        </div>
    );
};

export default HomePage;
