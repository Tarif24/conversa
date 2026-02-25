import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import ChatsSidebar from './ChatsSidebar';

const SlideInNav = ({
    setIsCreateChatActive,
    setActiveRoom,
    setIsChatInfoActive,
    roomClicked,
    activeRoom,
}) => {
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="flex h-full lg:hidden">
            <div
                className="flex h-full items-center justify-center hover:cursor-pointer"
                onClick={() => {
                    setIsActive(true);
                }}
            >
                <ChevronRight className="size-5 text-[rgb(194,172,255)] sm:size-15" />
            </div>
            <div
                className={`absolute top-0 left-0 h-[100vh] w-[100vw] bg-black/0 opacity-40 ${isActive ? '' : 'hidden'}`}
            ></div>
            <div
                id="nav"
                className={`absolute top-0 left-0 z-2 h-full transition duration-600 ease-in-out ${isActive ? 'translate-x-0' : '-translate-x-[100vw]'}`}
            >
                <div className="flex h-full w-fit gap-2 rounded-tr-2xl rounded-br-2xl bg-[rgb(124,77,255)]/50 p-2 backdrop-blur-sm sm:gap-4 sm:p-5">
                    <Navbar
                        isCreateChatActive={setIsCreateChatActive}
                        setActiveRoom={setActiveRoom}
                        setIsChatInfoActive={setIsChatInfoActive}
                        setIsActive={setIsActive}
                        isResponsive={true}
                    />
                    <ChatsSidebar
                        onRoomClicked={roomClicked}
                        setIsCreateChatActive={setIsCreateChatActive}
                        setActiveRoom={setActiveRoom}
                        activeRoom={activeRoom}
                        setIsChatInfoActive={setIsChatInfoActive}
                        setIsActive={setIsActive}
                        isResponsive={true}
                    />
                    <div
                        className="flex h-full items-center justify-center hover:cursor-pointer"
                        onClick={() => {
                            setIsActive(false);
                        }}
                    >
                        <ChevronLeft className="size-5 text-[rgb(82,19,255)] sm:size-15" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlideInNav;
