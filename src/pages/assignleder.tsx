import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import AdminLeder from "../components/AssignLeader";
import { GuidePanel } from "@navikt/ds-react";

const Home: NextPage = () => {
    moment.locale("nb");
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
