import React, { useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import EVENTS from '../../../../constants/socketEvents';

const UserSearch = ({ handleOnUserClicked }) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const [inputText, setInputText] = useState('');
    const [searchResult, setSearchResult] = useState([]);

    // Submit form handler
    const submitForm = async e => {
        e.preventDefault();

        if (inputText.trim() === '') return;

        setInputText(prev => prev.trim());

        const input = inputText;
        setInputText('');

        setChatHistory(prev => [...prev, { role: 'user', content: `${input}` }]);

        const userId = user._id.toString();

        try {
            setIsTyping(true);

            sendProtected(EVENTS.USER_SEARCH, {
                text: '',
            });
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setIsTyping(false);
        }
    };

    const textOnChange = e => {
        setInputText(e.target.value);

        const userId = user._id.toString();
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
                    userId: userId,
                },
                response => {
                    setSearchResult(response.userList);
                }
            );
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const userResultOnClick = user => {
        handleOnUserClicked(user);
        setInputText('');
        setSearchResult([]);
    };

    return (
        <div className="flex h-fit w-full flex-col justify-center">
            <div className="w-full overflow-hidden rounded-md border-1 border-[rgb(103,67,221)] bg-white/80 p-2 focus:ring-0">
                <input
                    type="text"
                    placeholder="Search for users"
                    className="h-7 w-full rounded-[5rem] px-1 text-[rgb(103,67,221)] focus:outline-none"
                    value={inputText}
                    onChange={textOnChange}
                />
                {searchResult && searchResult.length > 0 && (
                    <div className="flex max-h-36 w-full flex-col items-center gap-2 overflow-x-hidden">
                        <span className="w-[75%] border-1 border-[rgb(164,146,224)]"></span>
                        {searchResult.map(result => (
                            <div
                                className="w-full rounded-xl border-1 border-[rgb(103,67,221)] bg-gray-100 px-5 py-1 text-[rgb(103,67,221)] hover:cursor-pointer"
                                key={result.userId}
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
