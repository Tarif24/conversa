import React from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import { MessageCirclePlus } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = ({
    isCreateChatActive,
    setActiveRoom,
    setIsChatInfoActive,
    setIsActive = null,
    isResponsive = false,
}) => {
    const {
        isConnected,
        connectionState,
        user,
        sendProtected,
        sendRefresh,
        sendLastEmitted,
        sendLogout,
    } = useSocketIO();

    const userFirstLetter = user?.username ? user.username[0].toUpperCase() : '';

    const navigate = useNavigate();

    const navButtonStyle =
        'flex size-10 sm:size-15 items-center justify-center rounded-full bg-white/60 backdrop-blur-2xl p-2 hover:cursor-pointer hover:scale-110 transition-all duration-200 ease-in-out';

    const handleOnNewChatClicked = () => {
        setIsChatInfoActive(false);
        isCreateChatActive(true);
        if (setIsActive) {
            setIsActive(false);
        }
    };

    const handleOnLogoutClicked = () => {
        sendLogout(response => {
            if (response.success) {
            }
        });

        toast.success('Logout successful!');
        navigate('/', { replace: true, state: { fromLogout: true } });
    };

    const handleOnHomeClicked = () => {
        setIsChatInfoActive(false);
        setActiveRoom(null);
        isCreateChatActive(false);
        if (setIsActive) {
            setIsActive(false);
        }
    };

    return (
        <div
            className={`${isResponsive ? 'bg-white/50' : 'bg-white/20'} flex h-full w-15 flex-col items-center justify-between rounded-full p-4 backdrop-blur-2xl sm:w-30`}
        >
            <div>
                <div className={navButtonStyle} title="Profile">
                    <h1 className="font-bold text-[rgb(152,114,255)] sm:text-2xl">
                        {userFirstLetter}
                    </h1>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div className={navButtonStyle} onClick={() => handleOnHomeClicked()} title="Home">
                    <House color="rgb(152,114,255)" className="size-5 sm:size-8" />
                </div>
                <div
                    className={navButtonStyle}
                    onClick={() => handleOnNewChatClicked()}
                    title="New Chat"
                >
                    <MessageCirclePlus color="rgb(152,114,255)" className="size-5 sm:size-8" />
                </div>
            </div>
            <div>
                <div
                    className={navButtonStyle}
                    onClick={() => handleOnLogoutClicked()}
                    title="Logout"
                >
                    <LogOut color="rgb(152,114,255)" className="size-5 sm:size-8" />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
