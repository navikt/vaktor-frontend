import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import { GuidePanel } from "@navikt/ds-react";
import { User } from "../types/types";
import { useEffect, useState } from "react";
import Vaktperioder from "../components/Vaktperioder";

const Home: NextPage = () => {
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

    if (["vaktsjef", "leveranseleder"].includes(
        userData.role
    )) return (
        <>
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>
                            Her kan du generere nye vaktperioder for ditt vaktlag: <b>{userData.groups[0].name}</b>
                        </p>
                    </GuidePanel>
                </div>
                <Vaktperioder></Vaktperioder>

            </div>
        </>
    );
    return <div>Du har ikke tilgang hit!</div>
};

export default Home;
