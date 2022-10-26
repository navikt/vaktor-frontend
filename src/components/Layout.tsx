import Navbar from "./NavBar";
import { useEffect, useState } from "react";
import { User } from "../types/types";
import { Header, Footer } from "@navikt/status-components-react";

const Layout = ({ children }) => {
  const [userData, setUserData] = useState<User>({} as User);
  useEffect(() => {
    Promise.all([fetch("/vaktor/api/get_me")])
      .then(async ([current_user]) => {
        const userjson = await current_user.json();
        return [userjson];
      })
      .then(([userData]) => {
        setUserData(userData);
      });
  }, []);
  return (
    <>
      <Header imageURL="vaktor/assets/navblack.png" />
      <div className="content">
        <Navbar />
        {["vakthaver", "vaktsjef", "leveranseleder", "personalleder"].includes(
          userData.role
        ) && <h3>Hei, {userData.name}</h3>}

        {children}
      </div>
      <Footer imageURL="vaktor/assets/navblack.png" />
    </>
  );
};

export default Layout;
