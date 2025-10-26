import React, { useEffect, useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import EVENTS from '../../../constants/socketEvents';
import MessagingInterface from '../components/MessagingInterface';
import ChatsSidebar from '../components/ChatsSidebar';
import CreateChat from '../components/CreateChat';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const [isCreateChatActive, setIsCreateChatActive] = useState(false);
    const [activeRoom, setActiveRoom] = useState(null);

    const navigate = useNavigate();

    // Listen for incoming messages
    useSocketIOEvent(EVENTS.ERROR, error => {
        if (error.message.includes('Invalid or expired token')) {
            sendRefresh(response => {
                if (response.success) {
                    sendLastEmitted();
                } else {
                    console.error('Token refresh failed:', response.message);
                    navigate('/');
                }
            });
        }
    });

    // Wait for both user and socket connection
    if (!user || !isConnected) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#363163] via-[#695ce0] to-[#595C8A]">
                <div className="text-4xl text-[rgb(255,255,255)]">
                    {!user ? 'Loading user...' : 'Connecting to server...'}
                </div>
            </div>
        );
    }

    const roomClicked = room => {
        setActiveRoom(room);
    };

    return (
        <div className="flex h-full w-full items-center justify-center gap-2 bg-gradient-to-br from-[#363163] via-[#695ce0] to-[#595C8A] p-5">
            <Navbar isCreateChatActive={setIsCreateChatActive} setActiveRoom={setActiveRoom} />
            <ChatsSidebar onRoomClicked={roomClicked} isCreateChatActive={setIsCreateChatActive} />
            {isCreateChatActive ? (
                <CreateChat isCreateChatActive={setIsCreateChatActive} />
            ) : (
                <MessagingInterface room={activeRoom} isCreateChatActive={setIsCreateChatActive} />
            )}
        </div>
    );
};

export default HomePage;
