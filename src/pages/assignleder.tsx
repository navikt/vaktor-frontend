import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import AdminLeder from "../components/AssignLeader";
import { GuidePanel } from "@navikt/ds-react";
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

    if (userData.role !== "leveranseleder") {
        return <div>Du har ikke tilgang hit!</div>
    }
    return (
        <>
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>
                            Her kan leveranseleder påta seg ansvaret som leder for et vaktlag og tildele vaktsjef{" "}
                        </p>
                    </GuidePanel>
                </div>
                <AdminLeder></AdminLeder>
            </div>
        </>
    );
};

export default Home;
