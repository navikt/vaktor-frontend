import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import { GuidePanel } from "@navikt/ds-react";
import UpdateSchedule from "../components/UpdateSchedule";
import { useState, useEffect } from "react";
import { User } from "../types/types";

const Home: NextPage = () => {
  moment.locale("nb");
  const [userData, setUserData] = useState<User>({} as User);

  moment.locale("nb");
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
  if (["vakthaver", "vaktsjef", "leveranseleder", "personalleder"].includes(
    userData.role))
    return (
      <>
        <div className="Container">
          <div className="AdminGuideContainer">
            <GuidePanel className="AdminGuidePanel">
              <p>Her kan du endre vaktperioder i vaktlag du er medlem av </p>
            </GuidePanel>
          </div>
          <UpdateSchedule></UpdateSchedule>
        </div>
      </>
    );
  return (<div>Du har ikke tilgang hit!</div>)
};

export default Home;
