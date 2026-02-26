import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Info } from 'lucide-react';

const ChatHeader = ({ room, isChatInfoActive, setIsChatInfoActive }) => {
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
    return (
        <div className="flex h-17 items-center px-3 py-4 sm:h-23 sm:px-6">
            {room ? (
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex size-7 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl sm:size-15">
                            <h1 className="font-bold text-[rgb(80,53,168)] sm:text-2xl">
                                {room.type === 'direct' ? (
                                    room.otherUser[0].toUpperCase()
                                ) : (
                                    <Users className="size-5 sm:size-8" />
                                )}
                            </h1>
                        </div>
                        <div>
                            <h1 className="text-2xl font-medium text-[rgb(97,7,180)] sm:text-3xl">
                                {room.type === 'direct'
                                    ? windowSize.width < 640
                                        ? room.otherUser.substring(0, 14) +
                                          (room.otherUser.length > 14 ? '...' : '')
                                        : room.otherUser
                                    : windowSize.width < 640
                                      ? room.roomName.substring(0, 14) +
                                        (room.roomName.length > 14 ? '...' : '')
                                      : room.roomName}
                            </h1>
                            <div className="flex items-center gap-1">
                                {room.type === 'direct' ? (
                                    room.onlineMembers.length === 2 ? (
                                        <div className="flex items-center justify-center gap-1">
                                            <div className="size-3 rounded-full bg-green-400"></div>
                                            <div className="text-[rgb(97,7,180)]">online</div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-1">
                                            <div className="size-3 rounded-full bg-red-400"></div>
                                            <div className="text-[rgb(97,7,180)]">offline</div>
                                        </div>
                                    )
                                ) : room.onlineMembers.length > 1 ? (
                                    <div className="flex items-center justify-center gap-1">
                                        <div className="size-3 rounded-full bg-green-400"></div>
                                        <h1 className="text-[rgb(97,7,180)]">
                                            {room.onlineMembers.length - 1}/{room.users.length - 1}
                                        </h1>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-1">
                                        <div className="size-3 rounded-full bg-red-400"></div>
                                        <h1 className="text-[rgb(97,7,180)]">
                                            {room.onlineMembers.length - 1}/{room.users.length - 1}
                                        </h1>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div
                        className={`${isChatInfoActive ? ' bg-[rgb(97,7,180)] text-[rgb(176,168,226)]' : ' text-[rgb(97,7,180)]'} w-fit rounded-full transition duration-200 ease-in-out hover:scale-110 hover:cursor-pointer`}
                        onClick={() => {
                            setIsChatInfoActive(!isChatInfoActive);
                        }}
                    >
                        <Info size={30} />
                    </div>
                </div>
            ) : (
                <h1 className="text-3xl font-medium text-[rgb(54,0,105)]">No Chat Selected</h1>
            )}
        </div>
    );
};

export default ChatHeader;
