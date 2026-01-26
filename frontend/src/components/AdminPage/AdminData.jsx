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
                setAdminData(response);

                const filterDates = response.logs.map(
                    logFileName => logFileName.split('socket-')[1].split('.log')[0]
                );

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

    return (
        adminData && (
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-5 p-10">
                <div className="absolute top-10 left-10 flex w-35 flex-col items-center gap-5">
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
                    <div className="min-w-[8rem] text-center font-mono text-white">
                        Last Refreshed: {lastRefreshTime}s
                    </div>
                </div>
                <div className="justify-right flex h-50 w-full gap-20 pl-50">
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl border-4 border-white p-4">
                        <h1 className="h-fit text-3xl text-white">Total Users</h1>
                        <h1 className="text-5xl font-bold text-white">{adminData.totalUsers}</h1>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl border-4 border-white p-4">
                        <h1 className="h-fit text-3xl text-white">Active Users</h1>
                        <h1 className="text-5xl font-bold text-white">
                            {adminData.activeUsers.length}
                        </h1>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl border-4 border-white p-4">
                        <h1 className="h-fit text-3xl text-white">Total Messages</h1>
                        <h1 className="text-5xl font-bold text-white">{adminData.totalMessages}</h1>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl border-4 border-white p-4">
                        <h1 className="h-fit text-3xl text-white">Total Rooms</h1>
                        <h1 className="text-5xl font-bold text-white">{adminData.totalRooms}</h1>
                    </div>
                </div>
                <div className="w-full flex-1 rounded-3xl border-4 border-white">
                    <div className="flex items-center justify-between border-b-4 border-white p-4">
                        <h1 className="m-4 text-3xl text-white">LOGS FOR {currentLog}</h1>
                        <input
                            type="text"
                            placeholder="Log text filter..."
                            className="m-4 rounded-md border-1 border-white bg-[rgb(101,102,149)] p-2 text-2xl text-white focus:ring-2 focus:ring-[rgb(184,169,233)] focus:outline-none"
                            onChange={e => handleOnTextFilterChanged(e)}
                        />
                        <select
                            className="m-4 rounded-md border-1 border-white bg-[rgb(96,97,146)] p-2 text-2xl text-white focus:ring-2 focus:ring-[rgb(184,169,233)] focus:outline-none"
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
                                    <div key={index} className="mb-2 whitespace-pre-wrap">
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
            </div>
        )
    );
};

export default AdminData;
