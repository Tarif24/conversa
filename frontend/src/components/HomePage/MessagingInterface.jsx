import React, { useState, useEffect, useRef, use } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import { toast } from 'react-toastify';
import EVENTS from '../../../../constants/socketEvents';
import { MessageCirclePlus } from 'lucide-react';
import { Users } from 'lucide-react';
import { Reply } from 'lucide-react';
import { Info } from 'lucide-react';
import MessageTypingBar from './MessageTypingBar';
import MessageActionsBar from './MessageActionsBar';

const MessagingInterface = ({
    room,
    isCreateChatActive,
    setIsChatInfoActive,
    isChatInfoActive,
}) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    // State to hold the chat history
    const [chatHistory, setChatHistory] = useState([]);

    // Reference to the end of the chat history for scrolling
    const chatEndRef = useRef(null);

    // To force update room for status and other updates from other components
    const [forceUpdateState, setForceUpdateState] = useState(0);

    // For MessageActionBar
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [selectedEditMessage, setSelectedEditMessage] = useState(null);
    const [selectedReplyMessage, setSelectedReplyMessage] = useState(null);

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
        if (!room) {
            return;
        }
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
        <div className="flex h-full flex-1 flex-col justify-between rounded-2xl bg-white/50 backdrop-blur-2xl">
            <div className="flex h-23 items-center px-8 py-4">
                {room ? (
                    <div className="flex w-full items-center justify-between">
                        <div className="flex gap-4">
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
                                                {room.onlineMembers.length - 1}/
                                                {room.users.length - 1}
                                            </h1>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1">
                                            <div className="size-3 rounded-full bg-red-400"></div>
                                            <h1 className="text-[rgb(97,7,180)]">
                                                {room.onlineMembers.length - 1}/
                                                {room.users.length - 1}
                                            </h1>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div
                            className={`${isChatInfoActive ? 'bg-[rgb(97,7,180)] text-[rgb(176,168,226)]' : ' text-[rgb(97,7,180)]'} w-fit rounded-full transition duration-200 ease-in-out hover:scale-110 hover:cursor-pointer`}
                            onClick={() => {
                                setIsChatInfoActive(!isChatInfoActive);
                            }}
                        >
                            <Info size={30} />
                        </div>
                    </div>
                ) : (
                    <h1 className="text-3xl font-medium text-[rgb(54,0,105)]">No Chat Selected</h1>
                )}
            </div>
            <div className="flex flex-1 flex-col justify-end rounded-2xl bg-white/30">
                {room ? (
                    <div className="flex max-h-203 flex-1 flex-col justify-end">
                        <div className="custom-scrollbar mr-1 flex flex-col overflow-y-auto px-4">
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
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex w-full justify-end gap-2">
                                                        {message.replyToId && (
                                                            <div className="self-center text-[rgb(153,122,255)]">
                                                                You replied to{' '}
                                                                {user.username ===
                                                                message.replyTo.username
                                                                    ? 'yourself'
                                                                    : message.replyTo.username}
                                                            </div>
                                                        )}
                                                        {message.isEdited && (
                                                            <div className="text-[rgb(153,122,255)]">
                                                                Edited
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex w-fit flex-col gap-1">
                                                        {message.replyToId && (
                                                            <div className="mr-12 flex items-center gap-1 self-end">
                                                                <h1 className="w-fit self-end rounded-2xl bg-[rgb(153,122,255)] p-4 text-[0.8rem] break-words text-white sm:text-[1.2rem]">
                                                                    {message.replyTo.content}
                                                                </h1>
                                                                <Reply className="text-[rgb(80,53,168)]" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 self-end">
                                                            <div className="flex items-center gap-1">
                                                                <MessageActionsBar
                                                                    isHovered={
                                                                        hoveredMessageId === index
                                                                    }
                                                                    message={message}
                                                                    setSelectedEditMessage={
                                                                        setSelectedEditMessage
                                                                    }
                                                                    setSelectedReplyMessage={
                                                                        setSelectedReplyMessage
                                                                    }
                                                                />
                                                                <h1 className="rounded-l-2xl rounded-tr-2xl bg-[rgb(80,53,168)] p-4 text-[0.8rem] break-words text-white sm:text-[1.2rem]">
                                                                    {message.message}
                                                                </h1>
                                                            </div>

                                                            <div className="flex size-10 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                                                <h1 className="text-1xl font-bold text-[rgb(80,53,168)]">
                                                                    {message.username[0].toUpperCase()}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    </div>
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
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex w-full justify-start gap-2">
                                                        {message.replyToId && (
                                                            <div className="self-center text-[rgb(153,122,255)]">
                                                                {user.username ===
                                                                message.replyTo.username
                                                                    ? `${message.replyTo.username} replied to you`
                                                                    : `${message.replyTo.username} replied to ${message.username}`}
                                                            </div>
                                                        )}
                                                        {message.isEdited && (
                                                            <div className="text-[rgb(153,122,255)]">
                                                                Edited
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex w-fit flex-col gap-1 self-start">
                                                        {message.replyToId && (
                                                            <div className="ml-12 flex items-center gap-1 self-start">
                                                                <Reply className="scale-x-[-1] text-[rgb(80,53,168)]" />
                                                                <h1 className="w-fit self-start rounded-2xl bg-[rgb(153,122,255)] p-4 text-[0.8rem] break-words text-white sm:text-[1.2rem]">
                                                                    {message.replyTo.content}
                                                                </h1>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 self-start">
                                                            <div className="flex size-10 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                                                <h1 className="text-1xl font-bold text-[rgb(80,53,168)]">
                                                                    {message.username[0].toUpperCase()}
                                                                </h1>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <h1 className="rounded-l-2xl rounded-tr-2xl bg-[rgb(80,53,168)] p-4 text-[0.8rem] break-words text-white sm:text-[1.2rem]">
                                                                    {message.message}
                                                                </h1>
                                                                <MessageActionsBar
                                                                    isUser={false}
                                                                    isHovered={
                                                                        hoveredMessageId === index
                                                                    }
                                                                    message={message}
                                                                    setSelectedEditMessage={
                                                                        setSelectedEditMessage
                                                                    }
                                                                    setSelectedReplyMessage={
                                                                        setSelectedReplyMessage
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
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
                            selectedEditMessage={selectedEditMessage}
                            selectedReplyMessage={selectedReplyMessage}
                            setSelectedEditMessage={setSelectedEditMessage}
                            setSelectedReplyMessage={setSelectedReplyMessage}
                        />
                    </div>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4">
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
