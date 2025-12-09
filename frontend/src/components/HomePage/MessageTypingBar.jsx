import React, { useState, useEffect, useRef, use } from 'react';
import EVENTS from '../../../../constants/socketEvents';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import { Send } from 'lucide-react';
import { PulseLoader } from 'react-spinners';

const MessageTypingBar = ({ room, setMessages }) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    // State to hold the input text and typing status
    const [inputText, setInputText] = useState('');

    // State to hold typing users for the current room
    const [typingUsers, setTypingUsers] = useState([]);

    const isTyping = useRef(false);
    const typingTimeoutRef = useRef(null);

    useSocketIOEvent(EVENTS.TYPING_UPDATE, data => {
        if (room._id === data.roomId) {
            setTypingUsers(data.typingUsers.filter(u => u.userId !== user._id));
        }
    });

    // Mange typing status
    const handleTyping = e => {
        setInputText(e.target.value);

        // Send "started typing" if not already typing
        if (!isTyping.current && e.target.value.length > 0) {
            isTyping.current = true;
            sendProtected(
                EVENTS.TYPING_START,
                {
                    roomId: room._id,
                    username: user.username,
                },
                response => {}
            );
        }

        // Reset the timeout
        clearTimeout(typingTimeoutRef.current);

        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping.current) {
                isTyping.current = false;
                sendProtected(
                    EVENTS.TYPING_STOP,
                    {
                        roomId: room._id,
                    },
                    response => {}
                );
            }
        }, 3000);

        // Also stop if input is empty
        if (e.target.value.length === 0) {
            clearTimeout(typingTimeoutRef.current);
            if (isTyping.current) {
                isTyping.current = false;
                sendProtected(
                    EVENTS.TYPING_STOP,
                    {
                        roomId: room._id,
                    },
                    response => {}
                );
            }
        }
    };

    // Submit form handler
    const submitForm = async e => {
        e.preventDefault();

        clearTimeout(typingTimeoutRef.current);
        if (isTyping.current) {
            isTyping.current = false;
            sendProtected(
                EVENTS.TYPING_STOP,
                {
                    roomId: room._id,
                },
                response => {}
            );
        }

        if (inputText.trim() === '') return;

        setInputText(prev => prev.trim());

        const input = inputText;
        setInputText('');

        const userId = user._id.toString();

        sendProtected(
            EVENTS.SEND_MESSAGE,
            {
                roomId: room._id,
                message: input,
                userId: userId,
            },
            response => {
                sendProtected(EVENTS.GET_MESSAGES_FOR_ROOM, { roomId: room._id }, response => {
                    if (!response.success) return;
                    setMessages(response.messages);
                });
            }
        );
    };

    return (
        <>
            <div className="pl-4">
                {typingUsers.length > 0 &&
                    (typingUsers.length === 1 ? (
                        <div className="mt-2 mb-2 flex items-center gap-2">
                            <div className="flex size-10 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                <h1 className="font-bold text-[rgb(80,53,168)]">
                                    {typingUsers[0].username[0].toUpperCase()}
                                </h1>
                            </div>

                            <PulseLoader color="#000000" size={8} speedMultiplier={1} />
                        </div>
                    ) : (
                        <div className="mt-2 mb-2 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <div className="flex size-10 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                    <h1 className="font-bold text-[rgb(80,53,168)]">
                                        {typingUsers[0].username[0].toUpperCase()}
                                    </h1>
                                </div>
                                <div className="flex size-10 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                    <h1 className="flex font-bold text-[rgb(80,53,168)]">+</h1>
                                    <h1 className="flex font-bold text-[rgb(80,53,168)]">
                                        {typingUsers.length - 1}
                                    </h1>
                                </div>
                            </div>
                            <PulseLoader color="#000000" size={12} speedMultiplier={1} />
                        </div>
                    ))}
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
                        onChange={e => handleTyping(e)}
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
    );
};

export default MessageTypingBar;
