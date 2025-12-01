import React, { useState, useEffect, useRef, use } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import { toast } from 'react-toastify';
import EVENTS from '../../../../constants/socketEvents';
import { MessageCirclePlus } from 'lucide-react';
import { Users } from 'lucide-react';
import MessageTypingBar from './MessageTypingBar';

const MessagingInterface = ({ room, isCreateChatActive }) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    // State to hold the chat history
    const [chatHistory, setChatHistory] = useState([]);

    // Reference to the end of the chat history for scrolling
    const chatEndRef = useRef(null);

    const [forceUpdateState, setForceUpdateState] = useState(0);

    // Handles what happens on chat switch
    useEffect(() => {
        if (!room) return;
        sendProtected(EVENTS.GET_MESSAGES_FOR_ROOM, { roomId: room._id }, response => {
            if (!response.success) return;
            const fixedMessages = response.messages.map(message => {
                if (message.userId === user._id) {
                    return { role: 'user', message: message.message };
                }
                if (message.userId === 'system' || message.userId === 'System') {
                    return { role: 'system', message: message.message };
                }
                return { role: 'other', message: message.message };
            });
            setChatHistory(fixedMessages);
        });
    }, [room]);

    useSocketIOEvent(EVENTS.USER_STATUS_UPDATE, data => {
        if (forceUpdateState === 1) {
            setForceUpdateState(0);
        } else {
            setForceUpdateState(1);
        }
    });

    // Listen for incoming messages
    useSocketIOEvent(EVENTS.RECEIVE_MESSAGE, data => {
        if (!data.success) return;
        if (!room || room._id !== data.message.roomId) {
            const message =
                data.type === 'direct'
                    ? data.message.message
                    : `${data.sentByUser}: ${data.message.message}`;
            toast(
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">
                        {data.type === 'direct' ? data.otherUser : data.roomName}
                    </h1>
                    <h1>{message}</h1>
                </div>
            );
            return;
        }

        if (room._id === data.message.roomId) {
            setChatHistory(prev => [...prev, { role: 'other', message: data.message.message }]);
            return;
        }
    });

    // Scroll to the bottom of the chat history when a new message is added
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleOnNewChatClicked = () => {
        isCreateChatActive(true);
    };

    return (
        <div className="flex h-full flex-1 flex-col justify-center rounded-2xl bg-white/50 backdrop-blur-2xl">
            <div className="py-4 pl-8">
                {room ? (
                    <div className="flex items-center gap-4">
                        <div className="flex size-15 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                            <h1 className="text-2xl font-bold text-[rgb(80,53,168)]">
                                {room.type === 'direct' ? (
                                    room.otherUser[0].toUpperCase()
                                ) : (
                                    <Users />
                                )}
                            </h1>
                        </div>
                        <div>
                            <h1 className="text-3xl font-medium text-[rgb(97,7,180)]">
                                {room.type === 'direct' ? room.otherUser : room.roomName}
                            </h1>
                            <div className="flex items-center gap-1">
                                {room.type === 'direct' ? (
                                    room.onlineMembers.length === 2 ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <div className="size-3 rounded-full bg-green-400"></div>
                                            <div className="text-[rgb(97,7,180)]">online</div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1">
                                            <div className="size-3 rounded-full bg-red-400"></div>
                                            <div className="text-[rgb(97,7,180)]">offline</div>
                                        </div>
                                    )
                                ) : room.onlineMembers.length > 1 ? (
                                    <div className="flex items-center justify-center gap-1">
                                        <div className="size-3 rounded-full bg-green-400"></div>
                                        <h1 className="text-[rgb(97,7,180)]">
                                            {room.onlineMembers.length - 1}/{room.users.length - 1}
                                        </h1>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-1">
                                        <div className="size-3 rounded-full bg-red-400"></div>
                                        <h1 className="text-[rgb(97,7,180)]">
                                            {room.onlineMembers.length - 1}/{room.users.length - 1}
                                        </h1>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <h1 className="text-3xl font-medium text-[rgb(54,0,105)]">No Chat Selected</h1>
                )}
            </div>
            <div className="flex h-full w-full flex-col justify-end rounded-2xl bg-white/30">
                {room ? (
                    <>
                        <div className="custom-scrollbar mr-1 flex max-h-187 flex-col overflow-y-auto px-4">
                            {chatHistory.map(({ role, message }, index) => {
                                return role !== 'system' ? (
                                    <div
                                        className={`mt-2 mb-2 w-fit max-w-[70%] p-4 break-words sm:max-w-[60%] ${
                                            role === 'user'
                                                ? 'self-end rounded-l-2xl rounded-tr-2xl bg-[rgb(59,37,119)] text-white'
                                                : 'self-start rounded-tl-2xl rounded-r-2xl bg-[rgb(152,114,255)] text-white'
                                        }`}
                                        key={index}
                                    >
                                        <h1 className="text-[0.8rem] sm:text-[1.2rem]">
                                            {message}
                                        </h1>
                                    </div>
                                ) : (
                                    <div
                                        className={`mb-2 flex w-full justify-center break-words`}
                                        key={index}
                                    >
                                        <h1 className="text-[rgb(59,37,119)]">{message}</h1>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef}></div>
                        </div>
                        <MessageTypingBar room={room} setChatHistory={setChatHistory} />
                    </>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                        <h1 className="text-3xl font-bold text-[rgb(96,82,143)]">
                            Create New Chat
                        </h1>
                        <div
                            className="flex size-15 items-center justify-center rounded-full border-1 border-[rgb(183,161,255)] bg-white/70 p-2 transition-all duration-200 ease-in-out hover:scale-110 hover:cursor-pointer"
                            onClick={() => handleOnNewChatClicked()}
                        >
                            <MessageCirclePlus color="rgb(183,161,255)" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagingInterface;
