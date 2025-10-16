import React, { useState } from 'react';
import LogIn from '../components/LogIn';
import SignUp from '../components/SignUp';

const AuthenticationPage = () => {
    const [isSignUp, setIsSignUp] = useState(true);

    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
            <div>{isSignUp ? <SignUp /> : <LogIn />}</div>
            <button
                className="focus:shadow-outline w-150 mt-4 rounded-full bg-gray-500 px-4 py-2 font-bold text-white hover:cursor-pointer hover:bg-gray-600 focus:outline-none"
                onClick={() => setIsSignUp(!isSignUp)}
            >
                {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
        </div>
    );
};

export default AuthenticationPage;
