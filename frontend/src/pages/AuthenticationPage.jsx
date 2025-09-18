import React, { useEffect } from "react";
import { io } from "socket.io-client";

const AuthenticationPage = () => {
    const socket = io("http://localhost:5000");

    useEffect(() => {
        return () => {
            socket.disconnect();
        };
    }, []);

    socket.on("connect", () => {
        console.log("Connected to server with ID:", socket.id);
    });

    return (
        <div>
            <h1>AUTHENTICATION PAGE</h1>
        </div>
    );
};

export default AuthenticationPage;
