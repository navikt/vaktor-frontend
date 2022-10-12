import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import Admin from "../components/ApproveSchema";
import NavBar from "../components/NavBar";

const Home: NextPage = () => {
  moment.locale("nb");
  return (
    <>

      <NavBar></NavBar>
      <div className="Container">
      <Admin></Admin>
      </div>
    
    </>
  );
};

export default Home;


