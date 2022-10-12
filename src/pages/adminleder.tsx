import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import AdminLeder from "../components/ApproveLeder";
import NavBar from "../components/NavBar";
import { GuidePanel } from "@navikt/ds-react";

const Home: NextPage = () => {
	moment.locale("nb");
	return (
		<>
			<NavBar></NavBar>
			<div className="Container">
				<div className="AdminGuideContainer">
					<GuidePanel className="AdminGuidePanel">
						<p>
							Under er listen over personer som har vaktperioder du må ta
							stilling til.{" "}
						</p>
					</GuidePanel>
				</div>
				<AdminLeder></AdminLeder>
			</div>
		</>
	);
};

export default Home;
