import React, { useState } from 'react';
import UserSearch from './UserSearch';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import EVENTS from '../../../constants/socketEvents';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const CreateChat = ({ isCreateChatActive }) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const [newChat, setNewChat] = useState({
        roomName: '',
        users: [],
    });

    const handleOnUserClicked = user => {
        setNewChat({ ...newChat, users: [...newChat.users, user] });
    };

    const handleSubmitForm = async e => {
        e.preventDefault();

        if (newChat.users.length === 0) {
            return;
        }

        if (newChat.users.length > 1 && newChat.roomName === '') {
            toast.error('Room name is required for group chats');
            return;
        }

        if (newChat.roomName === '') {
            sendProtected(EVENTS.CREATE_CHAT_ROOM, { ...newChat, roomName: 'DEFAULT' }, result => {
                if (result.doesDirectExist) {
                    toast.error('Direct chat already exists');
                    setNewChat({
                        ...newChat,
                        users: [],
                    });
                } else {
                    isCreateChatActive(false);
                }
            });
            return;
        }

        sendProtected(EVENTS.CREATE_CHAT_ROOM, newChat, result => {});

        isCreateChatActive(false);
    };

    const handleRemoveUser = userId => {
        const updatedUsers = newChat.users.filter(user => user.userId !== userId);

        setNewChat({ ...newChat, users: updatedUsers });
    };

    return (
        <div className="flex h-full flex-1 flex-col items-center justify-center rounded-2xl">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-white/65 backdrop-blur-2xl">
                <h1 className="text-3xl font-bold text-[rgb(110,84,181)]">New Chat</h1>
                <form onSubmit={handleSubmitForm} className="w-150 space-y-4 rounded-lg p-6">
                    {/* CHAT NAME */}
                    <div className={newChat.users.length < 2 ? 'hidden' : 'block'}>
                        <input
                            type="text"
                            id="chatName"
                            name="chatName"
                            className="w-full rounded border-1 border-[rgb(103,67,221)] bg-white/80 px-3 py-2 text-[rgb(103,67,221)] focus:ring-0 focus:outline-none"
                            placeholder="Group chat name"
                            autoComplete="off"
                            value={newChat.roomName}
                            onChange={e => {
                                setNewChat({
                                    ...newChat,
                                    roomName: e.target.value,
                                });
                                if (newChat.roomName === '') {
                                    setNewChat({
                                        ...newChat,
                                        roomName: null,
                                    });
                                }
                            }}
                        />
                    </div>

                    {/* SELECT USERS */}
                    <div>
                        <UserSearch handleOnUserClicked={handleOnUserClicked} />
                    </div>

                    {/* SELECTED USERS LIST */}
                    {true && (
                        <div className="mb-6">
                            <label
                                htmlFor="selectedUsers"
                                className="mb-2 block font-bold text-[rgb(110,84,181)]"
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
                                        className="flex w-full flex-row justify-between rounded-xl border-1 border-[rgb(103,67,221)] bg-gray-100 px-5 py-0 hover:cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-3 text-red-400">
                                            <div>
                                                <p className="font-medium text-[rgb(103,67,221)]">
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
                            className="focus:shadow-outline w-full rounded-full bg-[rgb(110,84,181)] px-4 py-2 font-bold text-white transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-[rgb(81,63,131)] focus:outline-none"
                            type="submit"
                        >
                            Create new chat
                        </button>
                    </div>
                    {/* GO BACK BUTTON */}
                    <div>
                        <button
                            className="focus:shadow-outline w-full rounded-full bg-[rgb(110,84,181)] px-4 py-2 font-bold text-white transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-[rgb(81,63,131)] focus:outline-none"
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
