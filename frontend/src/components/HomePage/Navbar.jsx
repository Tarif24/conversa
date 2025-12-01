import React from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import EVENTS from '../../../../constants/socketEvents';
import { MessageCirclePlus } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = ({ isCreateChatActive, setActiveRoom }) => {
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
        'flex size-15 items-center justify-center rounded-full bg-white/60 backdrop-blur-2xl p-2 hover:cursor-pointer hover:scale-110 transition-all duration-200 ease-in-out';

    const handleOnNewChatClicked = () => {
        isCreateChatActive(true);
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
        setActiveRoom(null);
        isCreateChatActive(false);
    };

    return (
        <div className="flex h-full w-30 flex-col items-center justify-between rounded-full bg-white/20 p-4 backdrop-blur-2xl">
            <div>
                <div className={navButtonStyle} title="Profile">
                    <h1 className="text-2xl font-bold text-[rgb(152,114,255)]">
                        {userFirstLetter}
                    </h1>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div className={navButtonStyle} onClick={() => handleOnHomeClicked()} title="Home">
                    <House color="rgb(152,114,255)" />
                </div>
                <div
                    className={navButtonStyle}
                    onClick={() => handleOnNewChatClicked()}
                    title="New Chat"
                >
                    <MessageCirclePlus color="rgb(152,114,255)" />
                </div>
            </div>
            <div>
                <div
                    className={navButtonStyle}
                    onClick={() => handleOnLogoutClicked()}
                    title="Logout"
                >
                    <LogOut color="rgb(152,114,255)" />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
