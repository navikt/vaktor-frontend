import type { NextPage } from "next";
import VaktorTimeline from "../components/VaktorTimeline";
import moment from "moment";
import "moment/locale/nb";

const Home: NextPage = () => {
  moment.locale("nb");
  return (
    <div>
      <VaktorTimeline />
    </div>
  );
};

export default Home;
