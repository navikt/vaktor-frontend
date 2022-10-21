import Navbar from "./NavBar";
import { useEffect, useState } from 'react';
import { User } from "../types/types";

const Layout = ({ children }) => {

    const [userData, setUserData] = useState<User>();
    useEffect(() => {
        Promise.all([fetch("/vaktor/api/get_me")])
            .then(async ([current_user]) => {
                const userjson = await current_user.json();
                return [userjson];
            })
            .then(([userData]) => {
                setUserData(userData);
            });
    },);
    if (!userData) return userData === "";
    return (

        <div className="content" >
            <Navbar />
            <h3>Hei, {userData.name}</h3>
            {children}
        </div >
    );
}

export default Layout;