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
    setIsActive = null,
    isResponsive = false,
}) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState(rooms);
    const [inputText, setInputText] = useState('');

    const [activeRoomId, setActiveRoomId] = useState(null);

    // For responsive design
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        function handleResize() {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        updateRooms();
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
        updateRooms();
    });

    useSocketIOEvent(EVENTS.USER_STATUS_UPDATE, data => {
        const updatedRooms = updateRooms(true);
    });

    const updateRooms = (updateActiveRoom = false) => {
        sendProtected(EVENTS.GET_USER_ROOMS, { userId: user._id }, response => {
            setRooms(response.rooms);
            setFilteredRooms(response.rooms);

            // If when you update rooms you want to update the data in the current room too (for example to change the active room data to reflect when someone goes from online to offline)
            if (updateActiveRoom) {
                if (!activeRoom) {
                    return;
                }

                for (const room of response.rooms) {
                    if (activeRoom._id === room._id) {
                        setActiveRoom(room);
                        return;
                    }
                }
            }
        });
    };

    const handleOnRoomClicked = room => {
        sendProtected(EVENTS.SET_ACTIVE_ROOM, { roomId: room._id }, response => {
            updateRooms();
        });
        setActiveRoomId(room._id);
        onRoomClicked(room);
        setIsCreateChatActive(false);
        if (setIsActive) {
            setIsActive(false);
        }
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
        <div className="flex h-full w-60 flex-col gap-1 md:w-100">
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
            <div className="flex min-h-0 w-full flex-1 flex-col justify-between rounded-2xl bg-white/50 pt-4 pr-1 pl-4 backdrop-blur-2xl">
                <div className="flex items-center">
                    <h1 className="text-2xl font-medium text-[rgb(59,37,119)] sm:text-3xl">
                        Chats
                    </h1>
                </div>
                <div className="custom-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto py-2 pr-1 sm:gap-4">
                    {filteredRooms && filteredRooms.length > 0 ? (
                        filteredRooms.map(room => (
                            <div
                                key={room._id}
                                className="relative flex h-fit w-full items-center gap-3 rounded-xl py-2 transition duration-300 ease-in-out hover:cursor-pointer hover:bg-white/30 sm:px-4 sm:py-6"
                                onClick={() => handleOnRoomClicked(room)}
                            >
                                <div className="flex size-8 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl sm:size-15">
                                    <h1 className="font-bold text-[rgb(80,53,168)] sm:text-2xl">
                                        {room.type === 'direct' ? (
                                            room.otherUser[0].toUpperCase()
                                        ) : (
                                            <Users className="size-4 sm:size-6" />
                                        )}
                                    </h1>
                                </div>
                                <div>
                                    <h1 className="font-bold text-[rgb(80,53,168)] sm:text-3xl sm:font-medium">
                                        {room.type === 'direct'
                                            ? windowSize.width < 640
                                                ? room.otherUser.substring(0, 15) +
                                                  (room.otherUser.length > 15 ? '...' : '')
                                                : room.otherUser
                                            : windowSize.width < 640
                                              ? room.roomName.substring(0, 15) +
                                                (room.roomName.length > 15 ? '...' : '')
                                              : room.roomName}
                                    </h1>
                                    <h1
                                        className={`text-[rgb(80,53,168)] ${room.isTyping ? '' : ''}`}
                                    >
                                        {room.isTyping
                                            ? 'typing...'
                                            : windowSize.width < 640
                                              ? room.message.message.substring(0, 15) +
                                                (room.message.message.length > 10 ? '...' : '')
                                              : room.message.message.substring(0, 20) +
                                                (room.message.message.length > 20 ? '...' : '')}
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
                                {room.unreadCount > 0 && (
                                    <div className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-white/30 p-1 text-[0.8rem] text-[rgb(80,53,168)] backdrop-blur-2xl sm:size-6 sm:text-[1rem]">
                                        {room.unreadCount}
                                    </div>
                                )}
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
