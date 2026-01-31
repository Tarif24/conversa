import React, { useEffect, useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import EVENTS from '../../../constants/socketEvents';
import MessageSearch from './MessageSearch';
import UserAdd from './UserAdd';
import { Users } from 'lucide-react';
import { UserMinus } from 'lucide-react';

const ChatInfo = ({ room, setActiveRoom, setIsChatInfoActive }) => {
    const {
        isConnected,
        connectionState,
        user,
        sendProtected,
        sendRefresh,
        sendLastEmitted,
        sendLogout,
    } = useSocketIO();

    const [roomMembers, setRoomMembers] = useState(null);
    const [userMember, setUserMember] = useState(null);

    useEffect(() => {
        if (!room) {
            return;
        }
        sendProtected(EVENTS.GET_ROOM_SIDEBAR_INFO, { roomId: room._id }, response => {
            const onlineUsers = new Map();

            for (const onlineUser of response.onlineMembers) {
                onlineUsers.set(onlineUser.username, true);
            }

            const roomMembersWithOnlineStatus = response.roomMembers.map(roomMember => {
                if (onlineUsers.has(roomMember.username)) {
                    if (user.username === roomMember.username) {
                        setUserMember({ ...roomMember, online: true });
                    }
                    return { ...roomMember, online: true };
                }
                if (user.username === roomMember.username) {
                    setUserMember({ ...roomMember, online: false });
                }
                return { ...roomMember, online: false };
            });

            setRoomMembers(roomMembersWithOnlineStatus);
        });
    }, [room]);

    useSocketIOEvent(EVENTS.ROOM_REFRESH, data => {
        if (!room) {
            return;
        }
        sendProtected(EVENTS.GET_ROOM_SIDEBAR_INFO, { roomId: room._id }, response => {
            const onlineUsers = new Map();

            for (const onlineUser of response.onlineMembers) {
                onlineUsers.set(onlineUser.username, true);
            }

            const roomMembersWithOnlineStatus = response.roomMembers.map(roomMember => {
                if (onlineUsers.has(roomMember.username)) {
                    if (user.username === roomMember.username) {
                        setUserMember({ ...roomMember, online: true });
                    }
                    return { ...roomMember, online: true };
                }
                if (user.username === roomMember.username) {
                    setUserMember({ ...roomMember, online: false });
                }
                return { ...roomMember, online: false };
            });

            setRoomMembers(roomMembersWithOnlineStatus);
        });
    });

    const handleOnLeaveClicked = () => {
        sendProtected(
            EVENTS.LEAVE_ROOM,
            { roomId: room._id, userId: user._id, isKick: false },
            () => {}
        );
        setActiveRoom(null);
        setIsChatInfoActive(false);
    };

    const handleOnKickClicked = userId => {
        sendProtected(
            EVENTS.LEAVE_ROOM,
            { roomId: room._id, userId: userId, isKick: true },
            () => {}
        );
    };

    return (
        <div className="flex h-full w-100 flex-col items-center rounded-2xl bg-white/50 p-4 backdrop-blur-2xl transition duration-200 ease-in-out">
            {room &&
                roomMembers &&
                (room.type === 'direct' ? (
                    <div className="my-10 flex h-full w-full flex-col justify-between">
                        <div className="flex w-full flex-col gap-5">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="flex size-15 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                    <h1 className="text-2xl font-bold text-[rgb(80,53,168)]">
                                        {room.otherUser[0].toUpperCase()}
                                    </h1>
                                </div>

                                <h1 className="text-3xl font-bold text-[rgb(80,53,168)]">
                                    {room.otherUser}
                                </h1>
                            </div>
                            <div className="w- flex flex-col items-start gap-2 pl-3">
                                <h1 className="text-2xl font-medium text-[rgb(80,53,168)]">
                                    Members
                                </h1>
                                {roomMembers.map(({ username, online, role }, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                            <h1 className="text-2xl font-bold text-[rgb(80,53,168)]">
                                                {username[0].toUpperCase()}
                                            </h1>
                                        </div>
                                        <div className="text-[rgb(80,53,168)]">{username}</div>
                                        <div
                                            className={`size-3 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'}`}
                                        ></div>
                                        <h1 className="text-[rgb(80,53,168)]">{role}</h1>
                                    </div>
                                ))}
                            </div>
                            <MessageSearch roomId={room._id} />
                        </div>
                        <div className="flex justify-center">
                            <button
                                className="w-50 rounded-2xl bg-red-400 px-2 py-3 text-2xl text-white transition duration-200 ease-in-out hover:cursor-pointer hover:ring-3 hover:ring-red-600 hover:ring-offset-5 hover:ring-offset-[rgb(175,175,213)]"
                                onClick={() => handleOnLeaveClicked()}
                            >
                                Leave
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="my-10 flex h-full w-full flex-col justify-between">
                        <div className="flex w-full flex-col gap-5">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="flex size-15 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                    <h1 className="text-2xl font-bold text-[rgb(80,53,168)]">
                                        <Users />
                                    </h1>
                                </div>

                                <h1 className="text-3xl font-bold text-[rgb(80,53,168)]">
                                    {room.roomName}
                                </h1>
                            </div>
                            <div className="w- flex flex-col items-start gap-2 pl-3">
                                <h1 className="text-2xl font-medium text-[rgb(80,53,168)]">
                                    Members
                                </h1>
                                {roomMembers.map(({ username, online, role, userId }, index) => (
                                    <div
                                        key={index}
                                        className="flex w-full items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl">
                                                <h1 className="text-2xl font-bold text-[rgb(80,53,168)]">
                                                    {username[0].toUpperCase()}
                                                </h1>
                                            </div>
                                            <div className="text-[rgb(80,53,168)]">{username}</div>
                                            <div
                                                className={`size-3 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'}`}
                                            ></div>
                                            <h1 className="text-[rgb(80,53,168)]">{role}</h1>
                                        </div>

                                        {userMember.role === 'owner' &&
                                            userMember.username !== username && (
                                                <UserMinus
                                                    className="justify-self-end rounded-full bg-white/30 p-1 text-red-400 backdrop-blur-2xl transition duration-150 ease-in-out hover:cursor-pointer hover:bg-red-400 hover:text-white"
                                                    size={30}
                                                    onClick={() => handleOnKickClicked(userId)}
                                                />
                                            )}
                                    </div>
                                ))}
                            </div>
                            <MessageSearch roomId={room._id} />
                            <UserAdd room={room} />
                        </div>
                        <div className="flex justify-center">
                            <button
                                className="w-50 rounded-2xl bg-red-400 px-2 py-3 text-2xl text-white transition duration-200 ease-in-out hover:cursor-pointer hover:ring-3 hover:ring-red-600 hover:ring-offset-5 hover:ring-offset-[rgb(175,175,213)]"
                                onClick={() => handleOnLeaveClicked()}
                            >
                                Leave
                            </button>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default ChatInfo;
