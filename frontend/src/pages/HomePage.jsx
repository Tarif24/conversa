import React, { use, useEffect, useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import EVENTS from '../../constants/socketEvents';
import MessagingInterface from '../components/HomePage/MessagingInterface';
import ChatsSidebar from '../components/HomePage/ChatsSidebar';
import CreateChat from '../components/HomePage/CreateChat';
import Navbar from '../components/HomePage/Navbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SlideInNav from '../components/HomePage/SlideInNav';

const HomePage = () => {
    const {
        isConnected,
        connectionState,
        user,
        isAuthenticated,
        sendProtected,
        sendRefresh,
        sendLastEmitted,
        clearAuth,
    } = useSocketIO();

    const [isCreateChatActive, setIsCreateChatActive] = useState(false);
    const [activeRoom, setActiveRoom] = useState(null);
    const [isChatInfoActive, setIsChatInfoActive] = useState(false);

    const navigate = useNavigate();

    // Listen for incoming error messages
    useSocketIOEvent(EVENTS.ERROR, error => {
        if (error.message.includes('Invalid or expired token')) {
            sendRefresh(response => {
                if (response.success) {
                    sendLastEmitted();
                } else {
                    console.error('Token refresh failed:', response.message);
                    clearAuth();
                    navigate('/');
                }
            });
        }
    });

    useSocketIOEvent(EVENTS.RATE_LIMIT_REACHED, data => {
        toast.error('RATE LIMIT REACHED PLEASE WAIT');
    });

    useSocketIOEvent(EVENTS.FORCE_LOGOUT, data => {
        clearAuth();
        toast.info('FORCE LOGOUT:');
        navigate('/', { replace: true, state: { fromLogout: true } });
    });

    // Wait for both user and socket connection
    if (!user || !isConnected) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#363163] via-[#695ce0] to-[#595C8A]">
                <div className="text-2xl text-[rgb(255,255,255)] sm:text-4xl">
                    {!user ? 'Loading user...' : 'Connecting to server...'}
                </div>
            </div>
        );
    }

    const roomClicked = room => {
        setActiveRoom(room);
    };

    return (
        <div className="flex h-full w-full gap-2 bg-gradient-to-br from-[#363163] via-[#695ce0] to-[#595C8A] p-1 sm:items-center sm:justify-center sm:p-5">
            <div className="hidden h-full gap-2 lg:flex">
                <Navbar
                    isCreateChatActive={setIsCreateChatActive}
                    setActiveRoom={setActiveRoom}
                    setIsChatInfoActive={setIsChatInfoActive}
                />
                <ChatsSidebar
                    onRoomClicked={roomClicked}
                    setIsCreateChatActive={setIsCreateChatActive}
                    setActiveRoom={setActiveRoom}
                    activeRoom={activeRoom}
                    setIsChatInfoActive={setIsChatInfoActive}
                />
            </div>

            <SlideInNav
                setIsCreateChatActive={setIsCreateChatActive}
                setActiveRoom={setActiveRoom}
                setIsChatInfoActive={setIsChatInfoActive}
                roomClicked={roomClicked}
                activeRoom={activeRoom}
            />

            {isCreateChatActive ? (
                <CreateChat isCreateChatActive={setIsCreateChatActive} />
            ) : (
                <MessagingInterface
                    room={activeRoom}
                    isCreateChatActive={setIsCreateChatActive}
                    setIsChatInfoActive={setIsChatInfoActive}
                    isChatInfoActive={isChatInfoActive}
                    setActiveRoom={setActiveRoom}
                />
            )}
        </div>
    );
};

export default HomePage;
