import React, { useEffect, useState } from 'react';
import MessageActionsBar from './MessageActionsBar';
import { Reply } from 'lucide-react';

const Message = ({
    role,
    message,
    index,
    hoveredMessageId,
    setHoveredMessageId,
    user,
    setSelectedEditMessage,
    setSelectedReplyMessage,
}) => {
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

    return role !== 'system' ? (
        role === 'user' ? (
            <div
                className="my-2 flex w-full flex-col items-end gap-2"
                key={index}
                onMouseEnter={() => setHoveredMessageId(index)}
                onMouseLeave={() => setHoveredMessageId(null)}
            >
                <div className="flex max-w-[70%] items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex w-full justify-end gap-2">
                            {message.replyToId && (
                                <div className="self-center text-[0.7rem] text-[rgb(153,122,255)] sm:text-[1rem]">
                                    You replied to{' '}
                                    {user.username === message.replyTo.username
                                        ? 'yourself'
                                        : message.replyTo.username}
                                </div>
                            )}
                            {message.isEdited && (
                                <div className="text-[0.7rem] text-[rgb(153,122,255)] sm:text-[1rem]">
                                    Edited
                                </div>
                            )}
                        </div>
                        <div className="flex w-fit flex-col gap-1">
                            {message.replyToId && (
                                <div className="flex items-center gap-1 self-end">
                                    <h1 className="w-fit self-end rounded-2xl bg-[rgb(153,122,255)] p-2 text-[0.8rem] break-words text-white sm:p-4 sm:text-[1.2rem]">
                                        {message.replyTo.content}
                                    </h1>
                                    <Reply className="text-[rgb(80,53,168)]" />
                                </div>
                            )}
                            <div className="flex items-center gap-2 self-end">
                                <div className="flex items-center gap-1">
                                    <MessageActionsBar
                                        isHovered={
                                            windowSize.width >= 1024 && hoveredMessageId === index
                                        }
                                        message={message}
                                        setSelectedEditMessage={setSelectedEditMessage}
                                        setSelectedReplyMessage={setSelectedReplyMessage}
                                    />
                                    <h1 className="rounded-l-2xl rounded-tr-2xl rounded-br-2xl bg-[rgb(80,53,168)] p-2 text-[0.8rem] break-words text-white sm:rounded-br-none sm:p-4 sm:text-[1.2rem]">
                                        {message.message}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {message.readUsers.length > 0 && (
                    <div className="flex w-full justify-end gap-1">
                        {message.readUsers.map(({ username }, index) => (
                            <div
                                key={index}
                                className="flex size-5 items-center justify-center rounded-full bg-violet-300 p-2"
                            >
                                <h1 className="text-[0.7rem] font-bold text-[rgb(80,53,168)]">
                                    {username[0].toUpperCase()}
                                </h1>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ) : (
            <div
                className={`mt-2 mb-2 flex w-full flex-col items-start`}
                key={index}
                onMouseEnter={() => setHoveredMessageId(index)}
                onMouseLeave={() => setHoveredMessageId(null)}
            >
                <div className="flex max-w-[70%] items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex w-full justify-start gap-2 pl-10">
                            {message.replyToId && (
                                <div className="self-center text-[0.7rem] text-[rgb(153,122,255)] sm:text-[1rem]">
                                    {user.username === message.replyTo.username
                                        ? `${message.replyTo.username} replied to you`
                                        : `${message.replyTo.username} replied to ${message.username}`}
                                </div>
                            )}
                            {message.isEdited && (
                                <div className="text-[0.7rem] text-[rgb(153,122,255)] sm:text-[1rem]">
                                    Edited
                                </div>
                            )}
                        </div>
                        <div className="flex w-fit flex-col gap-1 self-start">
                            {message.replyToId && (
                                <div className="ml-12 flex items-center gap-1 self-start">
                                    <Reply className="scale-x-[-1] text-[rgb(153,122,255)]" />
                                    <h1 className="w-fit self-start rounded-2xl bg-[rgb(96,75,163)] p-2 text-[0.8rem] break-words text-white sm:p-4 sm:text-[1.2rem]">
                                        {message.replyTo.content}
                                    </h1>
                                </div>
                            )}
                            <div className="flex items-center gap-2 self-start">
                                <div className="flex size-7 items-center justify-center rounded-full bg-white/30 p-2 backdrop-blur-2xl sm:size-10">
                                    <h1 className="font-bold text-[rgb(80,53,168)]">
                                        {message.username[0].toUpperCase()}
                                    </h1>
                                </div>
                                <div className="flex items-center gap-1">
                                    <h1 className="rounded-tl-2xl rounded-r-2xl rounded-bl-2xl bg-[rgb(138,102,255)] p-2 text-[0.8rem] break-words text-white sm:rounded-bl-none sm:p-4 sm:text-[1.2rem]">
                                        {message.message}
                                    </h1>
                                    <MessageActionsBar
                                        isUser={false}
                                        isHovered={
                                            windowSize.width >= 1024 && hoveredMessageId === index
                                        }
                                        message={message}
                                        setSelectedEditMessage={setSelectedEditMessage}
                                        setSelectedReplyMessage={setSelectedReplyMessage}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {message.readUsers.length > 0 && (
                    <div className="flex w-full justify-end gap-1">
                        {message.readUsers.map(({ username }, index) => (
                            <div
                                key={index}
                                className="flex size-5 items-center justify-center rounded-full bg-violet-300 p-2"
                            >
                                <h1 className="text-[0.7rem] font-bold text-[rgb(80,53,168)]">
                                    {username[0].toUpperCase()}
                                </h1>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    ) : (
        <div className={`mb-2 flex w-full justify-center break-words`} key={index}>
            <h1 className="text-[0.8rem] text-[rgb(59,37,119)] sm:text-[1rem]">
                {message.message}
            </h1>
        </div>
    );
};

export default Message;
