import type { NextPage } from "next";
import VaktorTimeline from "../components/VaktorTimeline";
import moment from "moment";
import "moment/locale/nb";

const Home: NextPage = () => {
  moment.locale("nb");
  return (
    <>
      <div className="Container">
        <VaktorTimeline></VaktorTimeline>
      </div>

    </>
  )
}

export default Home;


