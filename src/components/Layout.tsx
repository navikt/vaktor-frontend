import Navbar from "./NavBar";
import { useEffect, useState } from "react";
import { User } from "../types/types";
import { Header, Footer } from "@navikt/status-components-react";

const Layout = ({ children }: any) => {
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
    <div className="mainContainer">
      <Header imageURL="vaktor/assets/navblack.png" />
      <div className="content">
      <div className="topHeader">
          <h1>Vaktor</h1>
        </div>
        <Navbar />
       

        {children}
      </div>
      <Footer imageURL="vaktor/assets/navblack.png" />
    </div>
  );
};

export default Layout;
