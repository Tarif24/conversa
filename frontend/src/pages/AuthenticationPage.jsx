import React, { useState } from 'react';
import LogIn from '../components/LogIn';
import SignUp from '../components/SignUp';
import IMG1 from '../assets/Auth_Screen_1.png';
import IMG2 from '../assets/Auth_Screen_2.png';
import IMG3 from '../assets/Auth_Screen_3.png';

const AuthenticationPage = () => {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#7C77AA] to-[#595C8A] p-15">
            <div className="z-2 flex h-full w-full rounded-2xl bg-[rgb(45,38,56)] shadow-xl/40 backdrop-blur-lg">
                <div className="flex w-[60%] items-center justify-center p-5">
                    <div className="flex h-full w-full flex-col rounded-lg bg-[rgb(59,54,76)]">
                        <div className="flex h-[50%] w-full">
                            <div className="h-full w-[50%] pt-6 pr-3 pb-3 pl-6">
                                <div className="h-full w-full rounded-xl bg-[rgb(165,143,224)]">
                                    <img
                                        src={IMG2}
                                        alt="Auth Screen 1"
                                        className="h-full w-full rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="h-full w-[50%] pt-6 pr-6 pb-3 pl-3">
                                <div className="h-full w-full rounded-xl bg-[rgb(83,41,197)]">
                                    <img
                                        src={IMG3}
                                        alt="Auth Screen 1"
                                        className="h-full w-full rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="h-[50%] w-full pt-3 pr-6 pb-6 pl-6">
                            <div className="h-full w-full rounded-xl bg-[rgb(65,44,122)]">
                                <img
                                    src={IMG1}
                                    alt="Auth Screen 1"
                                    className="h-full w-full rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex w-[40%] flex-col items-center justify-center">
                    <div>{isSignUp ? <SignUp /> : <LogIn />}</div>
                    <div className="mt-6 flex gap-2 text-[rgb(168,167,173)]">
                        <h1>
                            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                        </h1>
                        <h1
                            className="font-medium text-[rgb(183,161,255)] underline transition duration-150 ease-in-out hover:cursor-pointer hover:text-[rgb(110,84,181)]"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Log In' : 'Sign Up'}
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthenticationPage;
