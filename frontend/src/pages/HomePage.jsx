import React, { useEffect, useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import EVENTS from '../../../constants/socketEvents';
import MessagingInterface from '../components/MessagingInterface';
import ChatsSidebar from '../components/ChatsSidebar';
import CreateChat from '../components/CreateChat';

const HomePage = () => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const [isCreateChatActive, setIsCreateChatActive] = useState(false);
    const [activeRoom, setActiveRoom] = useState(null);

    // Listen for incoming messages
    useSocketIOEvent(EVENTS.ERROR, error => {
        if (error.message.includes('Invalid or expired token')) {
            sendRefresh(response => {
                if (response.success) {
                    sendLastEmitted();
                } else {
                    console.error('Token refresh failed:', response.message);
                }
            });
        }
    });

    // Wait for both user and socket connection
    if (!user || !isConnected) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <div className="text-xl">
                    {!user ? 'Loading user...' : 'Connecting to server...'}
                </div>
            </div>
        );
    }

    const roomClicked = room => {
        setActiveRoom(room);
    };

    return (
        <div className="flex h-full w-full items-center justify-center">
            <ChatsSidebar isCreateChatActive={setIsCreateChatActive} onRoomClicked={roomClicked} />
            {isCreateChatActive ? (
                <CreateChat isCreateChatActive={setIsCreateChatActive} />
            ) : (
                <MessagingInterface room={activeRoom} />
            )}
        </div>
    );
};

export default HomePage;
