import React, { useState, useEffect, use } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import EVENTS from '../../../constants/socketEvents';
import { Search } from 'lucide-react';
import { Users } from 'lucide-react';

const MessagesSidebar = ({
    onRoomClicked,
    setIsCreateChatActive,
    setActiveRoom,
    activeRoom,
    setIsChatInfoActive,
}) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState(rooms);
    const [inputText, setInputText] = useState('');

    const [activeRoomId, setActiveRoomId] = useState(null);

    useEffect(() => {
        sendProtected(EVENTS.GET_USER_ROOMS, { userId: user._id }, response => {
            setRooms(response.rooms);
            setFilteredRooms(response.rooms);
        });
    }, [user, isConnected]);

    useSocketIOEvent(EVENTS.ROOM_REFRESH, data => {
        sendProtected(EVENTS.GET_USER_ROOMS, { userId: user._id }, response => {
            setRooms(response.rooms);
            setFilteredRooms(response.rooms);

            let doesHaveRoom = false;

            // Checks if user still has the active room might have been deleted or kicked
            if (!activeRoom) {
                return;
            }

            for (const room of response.rooms) {
                if (activeRoom._id === room._id) {
                    doesHaveRoom = true;
                }
            }

            if (!doesHaveRoom) {
                setIsChatInfoActive(false);
                setActiveRoom(null);
            }
        });
    });

    useSocketIOEvent(EVENTS.TYPING_UPDATE, data => {
        sendProtected(EVENTS.GET_USER_ROOMS, { userId: user._id }, response => {
            setRooms(response.rooms);
            setFilteredRooms(response.rooms);
        });
    });

    useSocketIOEvent(EVENTS.USER_STATUS_UPDATE, data => {
        sendProtected(EVENTS.GET_USER_ROOMS, { userId: user._id }, response => {
            setRooms(response.rooms);
            setFilteredRooms(response.rooms);
        });
    });

    const handleOnRoomClicked = room => {
        sendProtected(EVENTS.SET_ACTIVE_ROOM, { roomId: room._id }, response => {});
        setActiveRoomId(room._id);
        onRoomClicked(room);
        setIsCreateChatActive(false);
    };

    const handleTextOnChange = input => {
        setInputText(input);
        console.log(input);

        if (input === '' || input === null) {
            setFilteredRooms(rooms);
            return;
        }

        const filtered = rooms.filter(room => {
            if (room.type === 'direct') {
                return room.otherUser.toLowerCase().includes(input.toLowerCase());
            } else {
                return room.roomName.toLowerCase().includes(input.toLowerCase());
            }
        });

        setFilteredRooms(filtered);
    };

    return (
        <div className="flex h-full w-100 flex-col gap-1">
            <div className="flex items-center gap-2 rounded-2xl bg-white/50 px-4 backdrop-blur-2xl">
                <Search color="rgb(59,37,119)" />
                <input
                    type="text"
                    placeholder="Search for chats"
                    className="h-12 w-full rounded-2xl text-[rgb(81,46,177)] focus:outline-none"
                    value={inputText}
                    onChange={e => handleTextOnChange(e.target.value)}
                />
            </div>
            <div className="flex h-full w-full flex-1 flex-col justify-between rounded-2xl bg-white/50 pt-4 pr-1 pl-4 backdrop-blur-2xl">
                <div className="flex items-center">
                    <h1 className="text-3xl font-medium text-[rgb(59,37,119)]">Chats</h1>
                </div>
                <div className="custom-scrollbar flex h-189 flex-col gap-6 overflow-x-hidden py-2 pr-1">
                    {filteredRooms && filteredRooms.length > 0 ? (
                        filteredRooms.map(room => (
                            <div
                                key={room._id}
                                className="flex h-fit w-full gap-3 rounded-xl p-4 transition duration-300 ease-in-out hover:cursor-pointer hover:bg-white/30"
                                onClick={() => handleOnRoomClicked(room)}
                            >
                                <div className="flex size-15 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                    <h1 className="text-2xl font-bold text-[rgb(80,53,168)]">
                                        {room.type === 'direct' ? (
                                            room.otherUser[0].toUpperCase()
                                        ) : (
                                            <Users />
                                        )}
                                    </h1>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-medium text-[rgb(80,53,168)]">
                                        {room.type === 'direct' ? room.otherUser : room.roomName}
                                    </h1>
                                    <h1
                                        className={`text-[rgb(80,53,168)] ${room.isTyping ? '' : ''}`}
                                    >
                                        {room.isTyping ? 'typing...' : room.message.message}
                                    </h1>
                                </div>
                                <div className="flex flex-1 items-center justify-end">
                                    {room.type === 'direct' ? (
                                        room.onlineMembers.length === 2 ? (
                                            <div className="size-3 rounded-full bg-green-400"></div>
                                        ) : (
                                            <div className="size-3 rounded-full bg-red-400"></div>
                                        )
                                    ) : room.onlineMembers.length > 1 ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <h1 className="text-[rgb(80,53,168)]">
                                                {room.onlineMembers.length - 1}
                                            </h1>
                                            <div className="size-3 rounded-full bg-green-400"></div>
                                        </div>
                                    ) : (
                                        <div className="size-3 rounded-full bg-red-400"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <h1 className="text-3xl font-bold text-[rgb(96,82,143)]">No Rooms</h1>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesSidebar;
