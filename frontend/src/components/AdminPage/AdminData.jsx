import React, { useEffect, useState } from 'react';
import { useSocketIO, useSocketIOEvent, useSocketIOState } from '../../hooks/useSocketIO';
import EVENTS from '../../../constants/socketEvents';
import { toast } from 'react-toastify';
import { LogOut } from 'lucide-react';
import { RotateCw } from 'lucide-react';

const AdminData = ({ adminToken, setIsLoggedIn }) => {
    const { sendAdmin } = useSocketIO();
    const [currentLog, setCurrentLog] = useState('');
    const [adminData, setAdminData] = useState(null);
    const [log, setLog] = useState([]);
    const [filteredLog, setFilteredLog] = useState([]);
    const [lastRefreshTime, setLastRefreshTime] = useState(0);

    const dataStyle =
        'flex flex-1 sm:flex-col flex-row items-center justify-center gap-4 rounded-3xl border-4 border-white p-4';

    useEffect(() => {
        updateAdminData();
    }, []);

    // Listen for incoming error messages
    useSocketIOEvent(EVENTS.ERROR, error => {
        if (error.message.includes('Invalid or expired token')) {
            setIsLoggedIn(false);
        }
    });

    useEffect(() => {}, [filteredLog]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLastRefreshTime(prev => prev + 5);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const filterLog = keyword => {
        if (!keyword) {
            setFilteredLog(log);
            return;
        }
        const lowerKeyword = keyword.toLowerCase();
        const filtered = log.filter(entry => entry.toLowerCase().includes(lowerKeyword));
        setFilteredLog(filtered);
    };

    const updateAdminData = () => {
        sendAdmin(
            EVENTS.GET_ALL_ADMIN_DATA,
            {},
            response => {
                const adminData = {
                    ...response,
                    logs: response.logs.reverse(),
                };

                setAdminData(adminData);

                sendAdmin(
                    EVENTS.GET_ADMIN_LOG_FOR_DAY,
                    { day: date },
                    response => {
                        setLog(response.logs);
                        setFilteredLog(response.logs);
                    },
                    adminToken
                );
            },
            adminToken
        );
    };

    const dateChange = date => {
        setCurrentLog(date);
        sendAdmin(
            EVENTS.GET_ADMIN_LOG_FOR_DAY,
            { day: date },
            response => {
                setLog(response.log);
                setFilteredLog(response.log);
            },
            adminToken
        );
    };

    const handleOnTextFilterChanged = e => {
        const keyword = e.target.value;
        filterLog(keyword);
    };

    const handleOnDataSelectChanged = e => {
        const selectedDate = e.target.value;
        dateChange(selectedDate);
    };

    const handleOnLogOutClicked = () => {
        toast.success('Logout successful!');
        setIsLoggedIn(false);
    };

    const handleOnRefreshClicked = () => {
        updateAdminData();
        dateChange(currentLog);
        setLastRefreshTime(0);
    };

    const handleOnDeleteAllDatabaseDataClicked = () => {
        const result = confirm(
            'Are you sure you want to delete all database data? This action cannot be undone.'
        );
        if (result) {
            sendAdmin(EVENTS.DELETE_ALL_DATA, {}, response => {}, adminToken);
            toast.success('All database data deleted successfully!');
        } else {
            toast.info('Action cancelled');
        }
    };

    return (
        adminData && (
            <div className="flex h-full w-full flex-col gap-5 overflow-auto p-2 sm:p-10">
                <div className="flex w-full flex-col items-center gap-12 rounded-2xl bg-[rgb(45,38,56)] p-5 xl:flex-row">
                    <div className="flex w-full flex-col items-center justify-center gap-5 sm:w-55">
                        <div className="flex gap-4">
                            <LogOut
                                size={40}
                                className="rounded-full bg-white p-1 text-[rgb(103,67,221)] transition duration-150 ease-in-out hover:cursor-pointer hover:bg-[rgb(103,67,221)] hover:text-white"
                                onClick={() => handleOnLogOutClicked()}
                            />
                            <RotateCw
                                size={40}
                                className="rounded-full bg-white p-1 text-[rgb(103,67,221)] transition duration-150 ease-in-out hover:cursor-pointer hover:bg-[rgb(103,67,221)] hover:text-white"
                                onClick={() => handleOnRefreshClicked()}
                            />
                        </div>

                        <div className="min-w-[8rem] text-center font-mono text-white">
                            Last Refreshed: {lastRefreshTime}s
                        </div>
                    </div>
                    <div className="justify-right flex w-full flex-col gap-5 lg:flex-row lg:gap-20 xl:h-50">
                        <div className={dataStyle}>
                            <h1 className="h-fit text-white sm:text-3xl">Total Users</h1>
                            <h1 className="text-2xl font-bold text-white sm:text-5xl">
                                {adminData.totalUsers}
                            </h1>
                        </div>
                        <div className={dataStyle}>
                            <h1 className="h-fit text-white sm:text-3xl">Active Users</h1>
                            <h1 className="text-2xl font-bold text-white sm:text-5xl">
                                {adminData.activeUsers.length}
                            </h1>
                        </div>
                        <div className={dataStyle}>
                            <h1 className="h-fit text-white sm:text-3xl">Total Messages</h1>
                            <h1 className="text-2xl font-bold text-white sm:text-5xl">
                                {adminData.totalMessages}
                            </h1>
                        </div>
                        <div className={dataStyle}>
                            <h1 className="h-fit text-white sm:text-3xl">Total Rooms</h1>
                            <h1 className="text-2xl font-bold text-white sm:text-5xl">
                                {adminData.totalRooms}
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="w-full flex-1 rounded-2xl border-4 border-white bg-[rgb(45,38,56)]">
                    <div className="flex w-full flex-col items-start justify-between gap-4 border-b-4 border-white p-4 md:flex-row md:items-center md:gap-8">
                        <h1 className="text-2xl text-white sm:text-3xl">
                            LOGS FOR - {currentLog === '' ? 'YYYY-MM-DD' : currentLog}
                        </h1>
                        <input
                            type="text"
                            placeholder="Log text filter..."
                            className="w-full rounded-md border-1 border-white bg-[rgb(63,64,95)] p-2 text-white focus:ring-2 focus:ring-[rgb(184,169,233)] focus:outline-none sm:text-2xl md:w-fit"
                            onChange={e => handleOnTextFilterChanged(e)}
                        />
                        <select
                            className="w-full rounded-md border-1 border-white bg-[rgb(63,64,95)] p-2 text-center text-white focus:ring-2 focus:ring-[rgb(184,169,233)] focus:outline-none sm:text-2xl md:w-fit"
                            value={currentLog}
                            onChange={e => handleOnDataSelectChanged(e)}
                        >
                            <option value="" disabled>
                                Select a date
                            </option>
                            {adminData.logs.map(logFileName => {
                                const date = logFileName.split('socket-')[1].split('.log')[0];
                                return (
                                    <option key={date} value={date}>
                                        {date}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="pr-2">
                        <div className="custom-scrollbar my-5 h-115 w-full overflow-auto p-4 text-white">
                            {filteredLog?.length > 0 ? (
                                filteredLog.map((logEntry, index) => (
                                    <div
                                        key={index}
                                        className="mb-2 text-[0.7rem] break-words whitespace-pre-wrap sm:text-[1rem]"
                                    >
                                        {logEntry}
                                    </div>
                                ))
                            ) : (
                                <div className="mb-2 flex w-full items-center justify-center text-2xl text-white">
                                    SELECT A LOG DATE
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col items-center gap-12 rounded-2xl bg-red-400 p-2 sm:p-5">
                    <h1 className="w-full text-center text-3xl font-bold text-white">
                        DANGER ZONE
                    </h1>
                    <div className="flex w-full items-center justify-between rounded-2xl bg-red-300 p-2 sm:p-5">
                        <h1 className="font-medium sm:text-2xl">Delete all database data</h1>
                        <button
                            className="mt-2 rounded-md bg-white px-4 py-2 font-medium text-red-500 transition duration-150 ease-in-out hover:cursor-pointer hover:bg-red-500 hover:text-white"
                            onClick={() => handleOnDeleteAllDatabaseDataClicked()}
                        >
                            DELETE
                        </button>
                    </div>
                </div>
            </div>
        )
    );
};

export default AdminData;
