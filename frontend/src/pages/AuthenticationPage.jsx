import React, { useState } from "react";
import LogIn from "../components/LogIn";
import SignUp from "../components/SignUp";

const AuthenticationPage = () => {
    const [isSignUp, setIsSignUp] = useState(true);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div>{isSignUp ? <SignUp /> : <LogIn />}</div>
        </div>
    );
};

export default AuthenticationPage;
