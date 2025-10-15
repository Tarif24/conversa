import React, { useState, useEffect, useRef } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import { toast } from 'react-toastify';
import EVENTS from '../../../constants/socketEvents';

const MessagingInterface = ({ room }) => {
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
                    console.log('user');
                    return { role: 'user', message: message.message };
                }
                if (message.userId === 'system' || message.userId === 'System') {
                    console.log('system');
                    return { role: 'system', message: message.message };
                }
                console.log('other');
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

        if (room._id === data.message.roomId) {
            setChatHistory(prev => [...prev, { role: 'other', message: data.message.message }]);
            return;
        }

        const message = `${data.sentByUser}: ${data.message.message}`;
        toast(
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">{data.roomName}</h1>
                <h1>{message}</h1>
            </div>
        );
    });

    // Scroll to the bottom of the chat history when a new message is added
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center border-2 border-red-600 p-4">
            <div className={`${room ? 'block' : 'hidden'} mb-4`}>
                <h1 className="text-3xl font-bold">{room && room.roomName}</h1>
            </div>
            <div className="flex h-full w-full flex-col justify-end rounded-2xl border-2 bg-white sm:border-3">
                {room ? (
                    <>
                        <div className="flex max-h-155 flex-col overflow-y-auto px-2 sm:px-10">
                            {chatHistory.map(({ role, message }, index) => {
                                return role !== 'system' ? (
                                    <div
                                        className={`mt-2 w-fit max-w-[70%] p-3 break-words sm:mt-4 sm:max-w-[60%] sm:p-4 ${
                                            role === 'user'
                                                ? 'self-end rounded-l-2xl rounded-tr-2xl bg-blue-500 text-white'
                                                : 'self-start rounded-tl-2xl rounded-r-2xl bg-gray-200 text-black'
                                        }`}
                                        key={index}
                                    >
                                        <h1 className="text-[0.8rem] sm:text-[1.2rem]">
                                            {message}
                                        </h1>
                                    </div>
                                ) : (
                                    <div
                                        className={`flex w-full justify-center break-words`}
                                        key={index}
                                    >
                                        <h1 className="text-gray-500">{message}</h1>
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
                        <form className="flex h-fit items-end justify-center" onSubmit={submitForm}>
                            <div className="relative m-2 h-[3rem] w-full rounded-[5rem] border-2 border-black sm:m-4">
                                <input
                                    type="text"
                                    placeholder="What do you want to know..."
                                    className="relative h-full w-full rounded-[5rem] px-5 focus:outline-none"
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                />
                                <button
                                    className="absolute top-0 right-0 h-full rounded-[5rem] bg-blue-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:cursor-pointer hover:bg-blue-600"
                                    type="submit"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <h1 className="text-4xl font-bold">No Chat Selected</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagingInterface;
