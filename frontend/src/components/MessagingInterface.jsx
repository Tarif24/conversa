import React, { useState, useEffect, useRef } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import { toast } from 'react-toastify';
import EVENTS from '../../../constants/socketEvents';
import { MessageCirclePlus } from 'lucide-react';
import { Send } from 'lucide-react';
import { Users } from 'lucide-react';

const MessagingInterface = ({ room, isCreateChatActive }) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    // State to hold the input text and typing status
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // State to hold the chat history
    const [chatHistory, setChatHistory] = useState([]);

    // Reference to the end of the chat history for scrolling
    const chatEndRef = useRef(null);

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

    // Submit form handler
    const submitForm = async e => {
        e.preventDefault();

        if (inputText.trim() === '') return;

        setInputText(prev => prev.trim());

        const input = inputText;
        setInputText('');

        setChatHistory(prev => [...prev, { role: 'user', message: `${input}` }]);

        const userId = user._id.toString();

        setIsTyping(true);

        sendProtected(EVENTS.SEND_MESSAGE, {
            roomId: room._id,
            message: input,
            userId: userId,
        });

        setIsTyping(false);
    };

    // Listen for incoming messages
    useSocketIOEvent(EVENTS.RECEIVE_MESSAGE, data => {
        if (!data.success) return;
        if (!room || room._id !== data.message.roomId) {
            const message = `${data.sentByUser}: ${data.message.message}`;
            toast(
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">{data.roomName}</h1>
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
                        <h1 className="text-3xl font-medium text-[rgb(97,7,180)]">
                            {room.type === 'direct' ? room.otherUser : room.roomName}
                        </h1>
                    </div>
                ) : (
                    <h1 className="text-3xl font-medium text-[rgb(54,0,105)]">No Chat Selected</h1>
                )}
            </div>
            <div className="flex h-full w-full flex-col justify-end rounded-2xl bg-white/30">
                {room ? (
                    <>
                        <div className="custom-scrollbar mr-1 flex max-h-179 flex-col overflow-y-auto px-4 pt-4">
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
                            {/* <PulseLoader
                        color="#000000"
                        loading={isTyping}
                        size={12}
                        speedMultiplier={1}
                    /> */}
                        </div>
                        <form
                            className="flex h-fit items-end justify-center rounded-full"
                            onSubmit={submitForm}
                        >
                            <div className="mx-2 mb-2 flex h-fit w-full items-center rounded-[5rem] border-2 border-[rgb(59,37,119)] bg-white/20 backdrop-blur-2xl">
                                <input
                                    type="text"
                                    placeholder="Send a message..."
                                    className="relative h-full w-full rounded-[5rem] px-5 text-[rgb(81,46,177)] focus:outline-none"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                />
                                <button
                                    className="flex h-full items-center justify-center rounded-[5rem] border-2 border-white bg-[rgb(59,37,119)] p-3 text-white transition duration-300 ease-in-out hover:cursor-pointer hover:bg-[rgb(173,154,226)]"
                                    type="submit"
                                >
                                    <Send className="rounded-[5rem]" />
                                </button>
                            </div>
                        </form>
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
