import React, { useState, useEffect, useRef, use } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import { toast } from 'react-toastify';
import EVENTS from '../../../constants/socketEvents';
import { MessageCirclePlus } from 'lucide-react';
import MessageTypingBar from './MessageTypingBar';
import Message from './Message';
import ChatHeader from './ChatHeader';

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
                </div>,
                {}
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
        if (!room) {
            return;
        }
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
            <ChatHeader
                room={room}
                isChatInfoActive={isChatInfoActive}
                setIsChatInfoActive={setIsChatInfoActive}
            />
            <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white/30">
                {room ? (
                    <>
                        <div className="custom-scrollbar mr-1 flex flex-1 flex-col overflow-y-auto px-4">
                            <div className="flex-grow"></div>
                            {chatHistory.map(({ role, message }, index) => {
                                return (
                                    <Message
                                        role={role}
                                        message={message}
                                        index={index}
                                        hoveredMessageId={hoveredMessageId}
                                        setHoveredMessageId={setHoveredMessageId}
                                        user={user}
                                        setSelectedEditMessage={setSelectedEditMessage}
                                        setSelectedReplyMessage={setSelectedReplyMessage}
                                    />
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
                    </>
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
