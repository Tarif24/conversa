import React, { useState } from "react";
import LogIn from "../components/LogIn";
import SignUp from "../components/SignUp";

const AuthenticationPage = () => {
    const [isSignUp, setIsSignUp] = useState(true);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div>{isSignUp ? <SignUp /> : <LogIn />}</div>
            <button
                className="bg-gray-500 mt-4 hover:bg-gray-600 hover:cursor-pointer text-white font-bold py-2 px-4 rounded-full w-150 focus:outline-none focus:shadow-outline"
                onClick={() => setIsSignUp(!isSignUp)}
            >
                {isSignUp
                    ? "Already have an account? Log In"
                    : "Don't have an account? Sign Up"}
            </button>
        </div>
    );
};

export default AuthenticationPage;
