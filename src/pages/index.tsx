import type { NextPage } from "next";
import VaktorTimeline from "../components/VaktorTimeline";
import moment from "moment";
import "moment/locale/nb";
import Example from "../components/ApproveSchema";
import NavBar from "../components/NavBar";

const Home: NextPage = () => {
  moment.locale("nb");
  return (
    <>
      <NavBar></NavBar>
      <div className="Container">
        <Example></Example>

        <VaktorTimeline />
      </div>
    
    </>
  );
};

export default Home;
