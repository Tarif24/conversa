import React, { useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import EVENTS from '../../../constants/socketEvents';

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
    };

    return (
        <div className="flex h-fit w-full flex-col justify-center">
            <div className="border-1 w-full overflow-hidden rounded-xl border-black p-0">
                <input
                    type="text"
                    placeholder="Search for users here"
                    className="h-12 w-full rounded-[5rem] px-5 focus:outline-none"
                    value={inputText}
                    onChange={textOnChange}
                />
                {searchResult && searchResult.length > 0 && (
                    <div className="flex max-h-36 w-full flex-col gap-2 overflow-x-hidden px-2">
                        {searchResult.map(result => (
                            <div
                                className="border-1 w-full rounded-xl border-gray-400 bg-gray-100 px-5 py-1 hover:cursor-pointer"
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
