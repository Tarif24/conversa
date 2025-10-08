import React, { useState, useEffect, useRef } from "react";
import {
    useSocketIO,
    useSocketIOEvent,
    useSocketIOState,
} from "../hooks/useSocketIO";
import EVENTS from "../../../constants/socketEvents";

const MessagingInterface = () => {
    const {
        isConnected,
        connectionState,
        user,
        sendProtected,
        sendRefresh,
        sendLastEmitted,
    } = useSocketIO();

    // State to hold the selected group chat name
    const [name, setName] = useState("");

    // State to hold the input text and typing status
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // State to hold the chat history
    const [chatHistory, setChatHistory] = useState([]);

    // Reference to the end of the chat history for scrolling
    const chatEndRef = useRef(null);

    // Submit form handler
    const submitForm = async (e) => {
        e.preventDefault();

        if (inputText.trim() === "") return;

        setInputText((prev) => prev.trim());

        const input = inputText;
        setInputText("");

        setChatHistory((prev) => [
            ...prev,
            { role: "user", content: `${input}` },
        ]);

        const userId = user._id.toString();

        setIsTyping(true);

        sendProtected(EVENTS.SEND_MESSAGE, {
            roomId: "default",
            message: input,
            userId: userId,
        });

        setIsTyping(false);
    };

    // Listen for incoming messages
    useSocketIOEvent(EVENTS.RECEIVE_MESSAGE, (data) => {
        if (data.success) {
            setChatHistory((prev) => [
                ...prev,
                { role: "assistant", content: data.message.message },
            ]);
        }
    });

    // Listen for incoming messages
    useSocketIOEvent(EVENTS.ERROR, (error) => {
        if (error.message.includes("Invalid or expired token")) {
            sendRefresh((response) => {
                if (response.success) {
                    sendLastEmitted();
                } else {
                    console.error("Token refresh failed:", response.message);
                }
            });
        }
    });

    // Scroll to the bottom of the chat history when a new message is added
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center border-2 border-red-600 p-4">
            <div className="flex flex-col justify-end border-2 sm:border-3 rounded-2xl w-full h-full bg-white">
                <div className="flex flex-col overflow-y-auto px-2 sm:px-10">
                    {chatHistory.map(({ role, content }, index) => (
                        <div
                            className={`w-fit max-w-[70%] sm:max-w-[60%] mt-2 sm:mt-4 p-3 sm:p-4 break-words ${
                                role === "user"
                                    ? "self-end rounded-l-2xl rounded-tr-2xl bg-blue-500 text-white"
                                    : "self-start rounded-r-2xl rounded-tl-2xl bg-gray-200 text-black"
                            }`}
                            key={index}
                        >
                            <h1 className="text-[0.8rem] sm:text-[1.2rem]">
                                {content}
                            </h1>
                        </div>
                    ))}
                    <div ref={chatEndRef}></div>
                    {/* <PulseLoader
                        color="#000000"
                        loading={isTyping}
                        size={12}
                        speedMultiplier={1}
                    /> */}
                </div>
                <form
                    className="flex justify-center items-end h-fit"
                    onSubmit={submitForm}
                >
                    <div className="relative h-[3rem] w-full border-2 border-black rounded-[5rem] m-2 sm:m-4">
                        <input
                            type="text"
                            placeholder="What do you want to know..."
                            className="relative h-full px-5 w-full focus:outline-none rounded-[5rem]"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button
                            className="absolute right-0 top-0 h-full bg-blue-500 text-white rounded-[5rem] px-4 py-2 hover:cursor-pointer hover:bg-blue-600 transition duration-300 ease-in-out"
                            type="submit"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MessagingInterface;
