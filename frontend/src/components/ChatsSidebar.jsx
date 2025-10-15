import React, { useState, useEffect } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../hooks/useSocketIO';
import EVENTS from '../../../constants/socketEvents';

const MessagesSidebar = ({ isCreateChatActive, onRoomClicked }) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState(rooms);
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        sendProtected(EVENTS.GET_USER_ROOMS, { userId: user._id }, response => {
            setRooms(response.rooms);
            setFilteredRooms(response.rooms);
        });
    }, [user, isConnected]);

    useSocketIOEvent(EVENTS.ROOM_REFRESH, data => {
        console.log('here');
        sendProtected(EVENTS.GET_USER_ROOMS, { userId: user._id }, response => {
            setRooms(response.rooms);
            setFilteredRooms(response.rooms);
        });
    });

    const handleOnNewChatClicked = () => {
        isCreateChatActive(true);
    };

    const handleOnRoomClicked = room => {
        sendProtected(EVENTS.SET_ACTIVE_ROOM, { roomId: room._id }, response => {});
        onRoomClicked(room);
    };

    const handleTextOnChange = input => {
        setInputText(input);
        console.log(input);

        if (input === '' || input === null) {
            setFilteredRooms(rooms);
            return;
        }

        const filtered = rooms.filter(room =>
            room.roomName.toLowerCase().includes(input.toLowerCase())
        );

        setFilteredRooms(filtered);
    };

    return (
        <div className="flex h-full w-100 flex-col justify-around gap-4 border-2 border-red-600 px-3 pt-3">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Chats</h1>
                <button
                    className="rounded-[5rem] bg-gray-500 px-4 py-2 text-white transition duration-300 ease-in-out hover:cursor-pointer hover:bg-gray-600"
                    onClick={() => handleOnNewChatClicked()}
                >
                    New Chat
                </button>
            </div>
            <div className="rounded-3xl border-1">
                <input
                    type="text"
                    placeholder="Search for chats"
                    className="h-12 w-full rounded-[5rem] px-5 focus:outline-none"
                    value={inputText}
                    onChange={e => handleTextOnChange(e.target.value)}
                />
            </div>
            <div className="flex h-full max-h-170 flex-col gap-6 overflow-x-hidden py-2">
                {filteredRooms && filteredRooms.length > 0 ? (
                    filteredRooms.map(room => (
                        <div
                            key={room._id}
                            className="flex h-fit w-full flex-col gap-1 rounded-xl border-1 p-4 transition duration-300 ease-in-out hover:cursor-pointer hover:bg-gray-200"
                            onClick={() => handleOnRoomClicked(room)}
                        >
                            <h1 className="text-3xl font-bold">{room.roomName}</h1>
                            <h1>{room.message.message}</h1>
                        </div>
                    ))
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <h1 className="text-3xl font-bold">No Rooms</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesSidebar;
