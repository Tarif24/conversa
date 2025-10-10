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

    useEffect(() => {
        sendProtected(
            EVENTS.GET_USER_ROOMS,
            { userId: user._id },
            (response) => {
                setRooms(response.rooms);
            }
        );
    }, []);

    // When a new room is created for the user the server will call a room refresh to tell the front to refresh the rooms
    useSocketIOEvent(EVENTS.ROOM_REFRESH, (data) => {
        console.log("here");
        sendProtected(
            EVENTS.GET_USER_ROOMS,
            { userId: user._id },
            (response) => {
                setRooms(response.rooms);
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

    return (
        <div className="border-2 border-red-600 h-full w-100 flex flex-col justify-around gap-3 pt-3">
            <div className="flex justify-between items-center px-3">
                <h1 className="text-3xl font-bold">Chats</h1>
                <button
                    className="bg-gray-500 text-white rounded-[5rem] px-4 py-2 hover:cursor-pointer hover:bg-gray-600 transition duration-300 ease-in-out"
                    onClick={() => handleOnNewChatClicked()}
                >
                    New Chat
                </button>
            </div>
            <div className="flex flex-col gap-6 px-4 py-2 m-0 h-full max-h-175 overflow-x-hidden">
                {rooms && rooms.length > 0 ? (
                    rooms.map((room) => (
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
