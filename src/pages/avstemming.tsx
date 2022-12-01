import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import AvstemmingOkonomi from "../components/AvstemmingOkonomi";
import { GuidePanel } from "@navikt/ds-react";
import { User } from "../types/types";
import { useEffect, useState } from "react";

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

    if (["okonomi", "leveranseleder"].includes(
        userData.role
    )) return (
        <>
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>
                            Avstemming for ØT{" "}
                        </p>
                    </GuidePanel>
                </div>
                <AvstemmingOkonomi></AvstemmingOkonomi>

            </div>
        </>
    );
    return <div>Du har ikke tilgang hit!</div>
};

export default Home;
