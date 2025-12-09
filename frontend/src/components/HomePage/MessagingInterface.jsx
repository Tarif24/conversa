import React, { useState, useEffect, useRef, use } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import { toast } from 'react-toastify';
import EVENTS from '../../../../constants/socketEvents';
import { MessageCirclePlus } from 'lucide-react';
import { Users } from 'lucide-react';
import MessageTypingBar from './MessageTypingBar';
import MessageActionsBar from './MessageActionsBar';

const MessagingInterface = ({ room, isCreateChatActive }) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    // State to hold the chat history
    const [chatHistory, setChatHistory] = useState([]);

    // Reference to the end of the chat history for scrolling
    const chatEndRef = useRef(null);

    const [forceUpdateState, setForceUpdateState] = useState(0);

    const [hoveredMessageId, setHoveredMessageId] = useState(null);

    // Handles what happens on chat switch
    useEffect(() => {
        if (!room) return;
        sendProtected(EVENTS.GET_MESSAGES_FOR_ROOM, { roomId: room._id }, response => {
            if (!response.success) return;
            organizeMessageStructureAndSave(response.messages);
        });
    }, [room]);

    useSocketIOEvent(EVENTS.USER_STATUS_UPDATE, data => {
        if (forceUpdateState === 1) {
            setForceUpdateState(0);
        } else {
            setForceUpdateState(1);
        }
    });

    useSocketIOEvent(EVENTS.ROOM_REFRESH, () => {
        sendProtected(EVENTS.GET_MESSAGES_FOR_ROOM, { roomId: room._id }, response => {
            if (!response.success) return;
            organizeMessageStructureAndSave(response.messages);
        });
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
            setChatHistory(prev => [...prev, { role: 'other', message: data.message }]);

            sendProtected(
                EVENTS.MARK_AS_READ,
                { roomId: room._id, messageId: data.message._id },
                () => {}
            );
            return;
        }
    });

    useSocketIOEvent(EVENTS.USER_READ_UPDATE, data => {
        sendProtected(EVENTS.GET_MESSAGES_FOR_ROOM, { roomId: room._id }, response => {
            if (!response.success) return;
            organizeMessageStructureAndSave(response.messages);
        });
    });

    // Scroll to the bottom of the chat history when a new message is added
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const organizeMessageStructureAndSave = messages => {
        const organizedMessages = messages.map(message => {
            if (message.userId === user._id) {
                return { role: 'user', message: message };
            }
            if (message.userId === 'system' || message.userId === 'System') {
                return { role: 'system', message: message };
            }
            return { role: 'other', message: message };
        });
        setChatHistory(organizedMessages);
    };

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
                                    role === 'user' ? (
                                        <div
                                            className="mt-2 mb-2 flex w-full flex-col items-end gap-2"
                                            key={index}
                                            onMouseEnter={() => setHoveredMessageId(index)}
                                            onMouseLeave={() => setHoveredMessageId(null)}
                                        >
                                            <div className="flex max-w-[70%] items-center gap-2">
                                                <MessageActionsBar
                                                    isHovered={hoveredMessageId === index}
                                                    message={message}
                                                />
                                                <h1 className="rounded-l-2xl rounded-tr-2xl bg-[rgb(80,53,168)] p-4 text-[0.8rem] break-words text-white sm:text-[1.2rem]">
                                                    {message.message}
                                                </h1>
                                                <div className="flex size-10 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                                    <h1 className="text-1xl font-bold text-[rgb(80,53,168)]">
                                                        {message.username[0].toUpperCase()}
                                                    </h1>
                                                </div>
                                            </div>
                                            {message.readUsers.length > 0 && (
                                                <div className="flex w-full justify-end gap-1">
                                                    {message.readUsers.map(
                                                        ({ username }, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex size-5 items-center justify-center rounded-full bg-violet-300 p-2"
                                                            >
                                                                <h1 className="text-[0.7rem] font-bold text-[rgb(80,53,168)]">
                                                                    {username[0].toUpperCase()}
                                                                </h1>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className={`mt-2 mb-2 flex w-full flex-col items-start`}
                                            key={index}
                                            onMouseEnter={() => setHoveredMessageId(index)}
                                            onMouseLeave={() => setHoveredMessageId(null)}
                                        >
                                            <div className="flex max-w-[70%] items-center gap-2">
                                                <div className="flex size-10 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                                    <h1 className="text-1xl font-bold text-[rgb(80,53,168)]">
                                                        {message.username[0].toUpperCase()}
                                                    </h1>
                                                </div>
                                                <h1 className="rounded-tl-2xl rounded-r-2xl bg-[rgb(152,114,255)] p-4 text-[0.8rem] break-words text-white sm:text-[1.2rem]">
                                                    {message.message}
                                                </h1>
                                                <MessageActionsBar
                                                    isUser={false}
                                                    isHovered={hoveredMessageId === index}
                                                    message={message}
                                                />
                                            </div>
                                            {message.readUsers.length > 0 && (
                                                <div className="flex w-full justify-end gap-1">
                                                    {message.readUsers.map(
                                                        ({ username }, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex size-5 items-center justify-center rounded-full bg-violet-300 p-2"
                                                            >
                                                                <h1 className="text-[0.7rem] font-bold text-[rgb(80,53,168)]">
                                                                    {username[0].toUpperCase()}
                                                                </h1>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div
                                        className={`mb-2 flex w-full justify-center break-words`}
                                        key={index}
                                    >
                                        <h1 className="text-[rgb(59,37,119)]">{message.message}</h1>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef}></div>
                        </div>
                        <MessageTypingBar
                            room={room}
                            setMessages={organizeMessageStructureAndSave}
                        />
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
