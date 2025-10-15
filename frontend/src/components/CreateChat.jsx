import React, { useState } from 'react';
import UserSearch from './UserSearch';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import EVENTS from '../../../constants/socketEvents';
import { X } from 'lucide-react';

const CreateChat = ({ isCreateChatActive }) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const [newChat, setNewChat] = useState({
        roomName: '',
        users: [],
        type: '',
    });

    const handleOnUserClicked = user => {
        setNewChat({ ...newChat, users: [...newChat.users, user] });
    };

    const handleSubmitForm = async e => {
        e.preventDefault();

        sendProtected(EVENTS.CREATE_CHAT_ROOM, newChat, result => {});

        isCreateChatActive(false);
    };

    const handleRemoveUser = userId => {
        const updatedUsers = newChat.users.filter(user => user.userId !== userId);

        setNewChat({ ...newChat, users: updatedUsers });
    };

    return (
        <div className="flex h-full w-full flex-col items-center justify-center border-2 border-red-600 p-4">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 bg-white sm:border-3">
                <h1 className="text-3xl font-bold">New Chat</h1>
                <form onSubmit={handleSubmitForm} className="w-150 space-y-4 rounded-lg p-6">
                    {/* CHAT NAME */}
                    <div>
                        <label htmlFor="chatName" className="mb-2 block font-bold text-gray-700">
                            Chat Name
                        </label>
                        <input
                            type="text"
                            id="chatName"
                            name="chatName"
                            className="w-full rounded border px-3 py-2"
                            placeholder="Enter a chat name"
                            autoComplete="off"
                            required
                            value={newChat.roomName}
                            onChange={e =>
                                setNewChat({
                                    ...newChat,
                                    roomName: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* CHAT TYPE */}
                    <div>
                        <label htmlFor="chatType" className="mb-2 block font-bold text-gray-700">
                            Chat Type
                        </label>
                        <select
                            id="chatType"
                            name="chatType"
                            className="w-full rounded border px-3 py-2"
                            required
                            value={newChat.type}
                            onChange={e =>
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
                            <option value="directMessage">Direct Message</option>
                            <option value="group">Group</option>
                        </select>
                    </div>

                    {/* SELECT USERS */}
                    <div>
                        <label htmlFor="selectUsers" className="mb-2 block font-bold text-gray-700">
                            Select Users
                        </label>
                        <UserSearch handleOnUserClicked={handleOnUserClicked} />
                    </div>

                    {/* SELECTED USERS LIST */}
                    {newChat.users && newChat.users.length > 0 && (
                        <div className="mb-6">
                            <label
                                htmlFor="selectedUsers"
                                className="mb-2 block font-bold text-gray-700"
                            >
                                Selected Users ({newChat.users.length})
                            </label>
                            <div
                                className="max-h-36 space-y-2 overflow-x-hidden"
                                id="selectedUsers"
                                name="selectedUsers"
                            >
                                {newChat.users.map(user => (
                                    <div
                                        key={user.userId}
                                        className="flex w-full flex-row justify-between rounded-xl border-1 border-gray-400 bg-gray-100 px-5 py-0 hover:cursor-pointer"
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
                                                onClick={() => handleRemoveUser(user.userId)}
                                                className="rounded-full p-2 text-red-400 transition-colors hover:cursor-pointer hover:bg-red-100"
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
                            className="focus:shadow-outline w-full rounded-full bg-gray-500 px-4 py-2 font-bold text-white hover:cursor-pointer hover:bg-gray-600 focus:outline-none"
                            type="submit"
                        >
                            Create new chat
                        </button>
                    </div>
                    {/* GO BACK BUTTON */}
                    <div>
                        <button
                            className="focus:shadow-outline w-full rounded-full bg-gray-500 px-4 py-2 font-bold text-white hover:cursor-pointer hover:bg-gray-600 focus:outline-none"
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
