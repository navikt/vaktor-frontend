import type { NextPage } from "next";
import moment from "moment";
import "moment/locale/nb";
import AdminLeder from "../components/ApproveLeder";
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

	if (["vaktsjef", "leveranseleder", "personalleder"].includes(
		userData.role
	)) return (
		<>
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
	return <div>Du har ikke tilgang hit!</div>
};

export default Home;
