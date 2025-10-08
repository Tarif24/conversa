import React, { useState } from "react";
import MessagingInterface from "../components/MessagingInterface";
import ChatsSidebar from "../components/ChatsSidebar";
import CreateChat from "../components/CreateChat";

const HomePage = () => {
    const [isCreateChatActive, setIsCreateChatActive] = useState(false);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <ChatsSidebar isCreateChatActive={setIsCreateChatActive} />
            {isCreateChatActive ? (
                <CreateChat isCreateChatActive={setIsCreateChatActive} />
            ) : (
                <MessagingInterface />
            )}
        </div>
    );
};

export default HomePage;
