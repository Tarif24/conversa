import React, { useState } from "react";
import {
    useSocketIO,
    useSocketIOEvent,
    useSocketIOState,
} from "../hooks/useSocketIO";
import EVENTS from "../../../constants/socketEvents";

const UserSearch = () => {
    const {
        isConnected,
        connectionState,
        user,
        sendProtected,
        sendRefresh,
        sendLastEmitted,
    } = useSocketIO();

    const [inputText, setInputText] = useState("");
    const [searchResult, setSearchResult] = useState([]);

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

        try {
            setIsTyping(true);

            sendProtected(EVENTS.USER_SEARCH, {
                text: "",
            });
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setIsTyping(false);
        }
    };

    const textOnChange = (e) => {
        setInputText(e.target.value);

        const userId = user._id.toString();
        const input = e.target.value.trim();

        if (input === "") {
            setSearchResult([]);
            return;
        }

        try {
            sendProtected(
                EVENTS.USER_SEARCH,
                {
                    text: input,
                    userId: userId,
                },
                (response) => {
                    setSearchResult(response.userList);
                }
            );
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const userResultOnClick = (user) => {
        console.log(user);
    };

    return (
        <div className="w-[90%] flex flex-col justify-center h-fit">
            <h1>User Search</h1>

            <div className="w-full border-2 border-black rounded-xl p-1 overflow-hidden">
                <input
                    type="text"
                    placeholder="Search for users here"
                    className="h-12 px-5 w-full focus:outline-none rounded-[5rem]"
                    value={inputText}
                    onChange={textOnChange}
                />
                {searchResult.length > 0 && (
                    <div className="flex flex-col w-full gap-2">
                        {searchResult.map((result) => (
                            <div
                                className="px-5 py-2 w-full bg-gray-100 rounded-xl hover:cursor-pointer"
                                key={result._id}
                                onClick={() => {
                                    userResultOnClick(result);
                                }}
                            >
                                <h1>{result.username}</h1>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSearch;
