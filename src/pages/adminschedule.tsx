import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import { GuidePanel } from "@navikt/ds-react";
import UpdateSchedule from "../components/UpdateSchedule";

const Home: NextPage = () => {
  moment.locale("nb");
  return (
    <>
      <div className="Container">
        <div className="AdminGuideContainer">
          <GuidePanel className="AdminGuidePanel">
            <p>Et eller annet med å tildele roller/leder </p>
          </GuidePanel>
        </div>
        <UpdateSchedule></UpdateSchedule>
      </div>
    </>
  );
};

export default Home;
