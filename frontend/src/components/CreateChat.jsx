import React, { useState } from "react";
import UserSearch from "./UserSearch";
import {
    useSocketIO,
    useSocketIOEvent,
    useSocketIOState,
} from "../hooks/useSocketIO";
import EVENTS from "../../../constants/socketEvents";
import { X } from "lucide-react";

const CreateChat = ({ isCreateChatActive }) => {
    const {
        isConnected,
        connectionState,
        user,
        sendProtected,
        sendRefresh,
        sendLastEmitted,
    } = useSocketIO();

    const [newChat, setNewChat] = useState({
        roomName: "",
        users: [],
        type: "",
    });

    const handleOnUserClicked = (user) => {
        setNewChat({ ...newChat, users: [...newChat.users, user] });
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();

        sendProtected(EVENTS.CREATE_CHAT_ROOM, newChat, (result) => {});

        isCreateChatActive(false);
    };

    const handleRemoveUser = (userId) => {
        const updatedUsers = newChat.users.filter(
            (user) => user.userId !== userId
        );

        setNewChat({ ...newChat, users: updatedUsers });
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center border-2 border-red-600 p-4">
            <div className="flex flex-col justify-center items-center border-2 sm:border-3 rounded-2xl w-full h-full bg-white">
                <h1 className="text-3xl font-bold">New Chat</h1>
                <form
                    onSubmit={handleSubmitForm}
                    className="space-y-4 p-6 w-150 rounded-lg"
                >
                    {/* CHAT NAME */}
                    <div>
                        <label
                            htmlFor="chatName"
                            className="block text-gray-700 font-bold mb-2"
                        >
                            Chat Name
                        </label>
                        <input
                            type="text"
                            id="chatName"
                            name="chatName"
                            className="border rounded w-full py-2 px-3"
                            placeholder="Enter a chat name"
                            autoComplete="off"
                            required
                            value={newChat.roomName}
                            onChange={(e) =>
                                setNewChat({
                                    ...newChat,
                                    roomName: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* CHAT TYPE */}
                    <div>
                        <label
                            htmlFor="chatType"
                            className="block text-gray-700 font-bold mb-2"
                        >
                            Chat Type
                        </label>
                        <select
                            id="chatType"
                            name="chatType"
                            className="border rounded w-full py-2 px-3"
                            required
                            value={newChat.type}
                            onChange={(e) =>
                                setNewChat({
                                    ...newChat,
                                    type: e.target.value,
                                })
                            }
                        >
                            {/* fill options with collection names from the database */}
                            <option value="" disabled>
                                Select a collection
                            </option>
                            <option value="directMessage">
                                Direct Message
                            </option>
                            <option value="group">Group</option>
                        </select>
                    </div>

                    {/* SELECT USERS */}
                    <div>
                        <label
                            htmlFor="selectUsers"
                            className="block text-gray-700 font-bold mb-2"
                        >
                            Select Users
                        </label>
                        <UserSearch handleOnUserClicked={handleOnUserClicked} />
                    </div>

                    {/* SELECTED USERS LIST */}
                    {newChat.users && newChat.users.length > 0 && (
                        <div className="mb-6">
                            <label
                                htmlFor="selectedUsers"
                                className="block text-gray-700 font-bold mb-2"
                            >
                                Selected Users ({newChat.users.length})
                            </label>
                            <div
                                className="space-y-2 max-h-36 overflow-x-hidden"
                                id="selectedUsers"
                                name="selectedUsers"
                            >
                                {newChat.users.map((user) => (
                                    <div
                                        key={user.userId}
                                        className="flex flex-row justify-between px-5 py-0 w-full bg-gray-100 border-1 border-gray-400 rounded-xl hover:cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-3 text-red-400">
                                            <div>
                                                <p className="font-medium text-gray-600">
                                                    {user.username}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() =>
                                                    handleRemoveUser(
                                                        user.userId
                                                    )
                                                }
                                                className="p-2 text-red-400 hover:bg-red-100 rounded-full transition-colors hover:cursor-pointer"
                                                title="Remove"
                                                type="button"
                                            >
                                                <X size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SUBMIT BUTTON */}
                    <div>
                        <button
                            className="bg-gray-500 hover:bg-gray-600 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Create new chat
                        </button>
                    </div>
                    {/* GO BACK BUTTON */}
                    <div>
                        <button
                            className="bg-gray-500 hover:bg-gray-600 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-full w-full focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={() => isCreateChatActive(false)}
                        >
                            Go Back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateChat;
