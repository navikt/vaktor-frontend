import type { NextPage } from "next";
import GroupDetailsModal from "../components/GroupDetailsModal";
import Tidslinje from "../components/VaktorTimeline";

const Home: NextPage = () => {
  return (
    <div>
      <Tidslinje />
    </div>
  );
};

export default Home;
