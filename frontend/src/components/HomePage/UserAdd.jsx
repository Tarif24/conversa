import React, { useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import EVENTS from '../../../../constants/socketEvents';
import { UserPlus } from 'lucide-react';

const UserAdd = ({ room }) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const [inputText, setInputText] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    const textOnChange = e => {
        setInputText(e.target.value);

        const input = e.target.value.trim();

        if (input === '') {
            setSearchResult([]);
            return;
        }

        try {
            sendProtected(
                EVENTS.USER_SEARCH,
                {
                    text: input,
                    excludeUsers: room.users,
                },
                response => {
                    setSearchResult(response.userList);
                }
            );
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const handleOnAddClicked = userId => {
        sendProtected(
            EVENTS.JOIN_ROOM,
            {
                roomId: room._id,
                userId: userId,
            },
            () => {}
        );
        setInputText('');
        setSearchResult([]);
    };

    return (
        <div className="flex h-fit w-full flex-col justify-center">
            <div className="w-full overflow-hidden rounded-md border-1 border-[rgb(103,67,221)] bg-white/80 p-2 focus:ring-0">
                <input
                    type="text"
                    placeholder="Add users to group"
                    className="h-7 w-full rounded-[5rem] px-1 text-[rgb(103,67,221)] focus:outline-none"
                    value={inputText}
                    onChange={textOnChange}
                />
                {searchResult && searchResult.length > 0 && (
                    <div className="custom-scrollbar flex max-h-36 w-full flex-col items-center gap-2 overflow-x-hidden">
                        <span className="w-[75%] border-1 border-[rgb(164,146,224)]"></span>
                        {searchResult.map(result => (
                            <div
                                className="flex w-[90%] items-center justify-between rounded-xl border-1 border-[rgb(103,67,221)] bg-gray-100 px-5 py-1 text-[rgb(103,67,221)] hover:cursor-pointer"
                                key={result.userId}
                            >
                                <h1>{result.username}</h1>
                                <UserPlus
                                    className="rounded-full bg-white p-1 text-[rgb(103,67,221)] transition duration-150 ease-in-out hover:bg-[rgb(103,67,221)] hover:text-white"
                                    size={30}
                                    onClick={() => handleOnAddClicked(result.userId)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserAdd;
