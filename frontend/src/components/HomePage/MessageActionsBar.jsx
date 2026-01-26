import React from 'react';
import EVENTS from '../../../constants/socketEvents';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import { Reply } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { Trash2 } from 'lucide-react';

const MessageActionsBar = ({
    isUser = true,
    isHovered = false,
    message,
    setSelectedEditMessage,
    setSelectedReplyMessage,
}) => {
    const { isConnected, connectionState, user, sendProtected, sendRefresh, sendLastEmitted } =
        useSocketIO();

    const messageActionStyleUser =
        'rounded-full p-2 text-[rgb(152,114,255)] hover:cursor-pointer hover:bg-white/30';
    const messageActionStyleOther =
        'rounded-full p-2 text-[rgb(80,53,168)] hover:cursor-pointer hover:bg-white/30';

    const handleOnDeleteClicked = () => {
        sendProtected(EVENTS.DELETE_MESSAGE, { messageId: message._id, roomId: message.roomId });
    };

    const handleOnEditClicked = () => {
        setSelectedReplyMessage(null);
        setSelectedEditMessage(message);
    };
    const handleOnReplyClicked = () => {
        setSelectedEditMessage(null);
        setSelectedReplyMessage(message);
    };

    return (
        <div className={`${isHovered ? 'flex' : 'hidden'}`}>
            {isUser ? (
                <div className="flex gap-1">
                    <Trash2
                        className={messageActionStyleUser}
                        size={40}
                        onClick={() => handleOnDeleteClicked()}
                    />
                    <Pencil
                        className={messageActionStyleUser}
                        size={40}
                        onClick={() => handleOnEditClicked()}
                    />
                    <Reply
                        className={messageActionStyleUser}
                        size={40}
                        onClick={() => handleOnReplyClicked()}
                    />
                </div>
            ) : (
                <div>
                    <Reply
                        className={messageActionStyleOther}
                        size={40}
                        onClick={() => handleOnReplyClicked()}
                    />
                </div>
            )}
        </div>
    );
};

export default MessageActionsBar;
