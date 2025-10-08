import React from "react";

const MessagesSidebar = ({ isCreateChatActive }) => {
    const handleOnNewChatClicked = () => {
        isCreateChatActive(true);
    };

    return (
        <div className="border-2 border-red-600 h-full w-100 flex flex-col gap-3 pt-3">
            <div className="flex justify-between items-center px-3">
                <h1 className="text-3xl font-bold">Chats</h1>
                <button
                    className="bg-gray-500 text-white rounded-[5rem] px-4 py-2 hover:cursor-pointer hover:bg-gray-600 transition duration-300 ease-in-out"
                    onClick={handleOnNewChatClicked}
                >
                    New Chat
                </button>
            </div>
            <div>Rooms</div>
        </div>
    );
};

export default MessagesSidebar;
