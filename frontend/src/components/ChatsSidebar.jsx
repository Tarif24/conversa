import React, { useState, useEffect } from "react";
import {
    useSocketIO,
    useSocketIOEvent,
    useSocketIOState,
} from "../hooks/useSocketIO";
import EVENTS from "../../../constants/socketEvents";

const MessagesSidebar = ({ isCreateChatActive, onRoomClicked }) => {
    const {
        isConnected,
        connectionState,
        user,
        sendProtected,
        sendRefresh,
        sendLastEmitted,
    } = useSocketIO();

    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState(rooms);
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        sendProtected(
            EVENTS.GET_USER_ROOMS,
            { userId: user._id },
            (response) => {
                setRooms(response.rooms);
                setFilteredRooms(response.rooms);
            }
        );
    }, [user, isConnected]);

    useSocketIOEvent(EVENTS.ROOM_REFRESH, (data) => {
        console.log("here");
        sendProtected(
            EVENTS.GET_USER_ROOMS,
            { userId: user._id },
            (response) => {
                setRooms(response.rooms);
                setFilteredRooms(response.rooms);
            }
        );
    });

    const handleOnNewChatClicked = () => {
        isCreateChatActive(true);
    };

    const handleOnRoomClicked = (room) => {
        sendProtected(
            EVENTS.SET_ACTIVE_ROOM,
            { roomId: room._id },
            (response) => {}
        );
        onRoomClicked(room);
    };

    const handleTextOnChange = (input) => {
        setInputText(input);
        console.log(input);

        if (input === "" || input === null) {
            setFilteredRooms(rooms);
            return;
        }

        const filtered = rooms.filter((room) =>
            room.roomName.toLowerCase().includes(input.toLowerCase())
        );

        setFilteredRooms(filtered);
    };

    return (
        <div className="border-2 border-red-600 h-full w-100 flex flex-col justify-around gap-4 pt-3 px-3">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Chats</h1>
                <button
                    className="bg-gray-500 text-white rounded-[5rem] px-4 py-2 hover:cursor-pointer hover:bg-gray-600 transition duration-300 ease-in-out"
                    onClick={() => handleOnNewChatClicked()}
                >
                    New Chat
                </button>
            </div>
            <div className="border-1 rounded-3xl">
                <input
                    type="text"
                    placeholder="Search for chats"
                    className="h-12 px-5 w-full focus:outline-none rounded-[5rem]"
                    value={inputText}
                    onChange={(e) => handleTextOnChange(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-6 py-2 h-full max-h-170 overflow-x-hidden">
                {filteredRooms && filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                        <div
                            key={room._id}
                            className="flex flex-col h-fit w-full gap-1 border-1 rounded-xl p-4 hover:cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                            onClick={() => handleOnRoomClicked(room)}
                        >
                            <h1 className="text-3xl font-bold">
                                {room.roomName}
                            </h1>
                            <h1>{room.message.message}</h1>
                        </div>
                    ))
                ) : (
                    <div className="w-full h-full flex justify-center items-center">
                        <h1 className="text-3xl font-bold">No Rooms</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesSidebar;
