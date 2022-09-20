import type { NextPage } from "next";
import GroupDetailsModal from "../components/GroupDetailsModal";
import Tidslinje from "../components/tidslinje";

const Home: NextPage = () => {
return (
    <div>
      <GroupDetailsModal />
      <Tidslinje />
    </div>
    );
};

export default Home;
