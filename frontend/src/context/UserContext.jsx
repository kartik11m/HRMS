import React, { createContext,useEffect } from "react";

export const UserContextData = createContext();


const UserContext = ({children}) => {

    const [user, setUser] = React.useState({
        fullname: {
            firstname: "",
            lastname: ""
        },
        email: "",
        password: ""
    });

    // Load user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user:', e);
            }
        }
    }, []);

    // Save user to localStorage whenever it changes
    useEffect(() => {
        if (user.email) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }, [user]);

    return(
        <UserContextData.Provider value={{user, setUser}}>
            <div>{children}</div>
        </UserContextData.Provider>
    );
}

export default UserContext;