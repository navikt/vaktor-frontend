import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import Admin from "../components/ApproveSchema";
import { GuidePanel } from "@navikt/ds-react";

const Home: NextPage = () => {
    moment.locale("nb")
    return (
        <>
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>
                            Under er listen over perioder du er registrert med
                            bereskapsvakt som du må ta stilling til.{" "}
                        </p>
                    </GuidePanel>
                </div>
                <Admin></Admin>
            </div>
        </>
    )
}

export default Home
