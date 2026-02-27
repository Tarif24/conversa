import React, { useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../../hooks/useSocketIO';
import EVENTS from '../../../../constants/socketEvents';

const MessageSearch = ({ roomId }) => {
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
                EVENTS.MESSAGE_SEARCH,
                {
                    roomId: roomId,
                    text: input,
                },
                response => {
                    setSearchResult(response.messageList);
                }
            );
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    return (
        <div className="flex h-fit w-full flex-col justify-center">
            <div className="w-full overflow-hidden rounded-md border-1 border-[rgb(103,67,221)] bg-white/80 p-2 focus:ring-0">
                <input
                    type="text"
                    placeholder="Search for messages"
                    className="h-7 w-full rounded-[5rem] px-1 text-[rgb(103,67,221)] focus:outline-none"
                    value={inputText}
                    onChange={textOnChange}
                />
                {searchResult && searchResult.length > 0 && (
                    <div className="custom-scrollbar flex max-h-36 w-full flex-col items-center gap-2 overflow-x-hidden">
                        <span className="w-[75%] border-1 border-[rgb(164,146,224)]"></span>
                        {searchResult.map((result, index) => (
                            <div
                                className="w-[90%] rounded-xl border-1 border-[rgb(103,67,221)] bg-gray-100 px-5 py-1 text-[rgb(103,67,221)] hover:cursor-pointer"
                                key={index}
                            >
                                <h1>{result.message}</h1>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageSearch;
