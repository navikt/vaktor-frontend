import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from "@navikt/ds-react";
import { useEffect, useState } from 'react';
import { User } from "../types/types";

import { RouterVaktor, RouterAdmin, RouterLedergodkjenning, RouterAssignLeder } from '../types/routes';

export default function Navbar() {
	const router = useRouter()
	const [userData, setUserData] = useState<User>();
	const [response, setResponse] = useState();

	useEffect(() => {
		Promise.all([fetch("/vaktor/api/get_me")])
			.then(async ([current_user]) => {
				const userjson = await current_user.json();
				return [userjson];
			})
			.then(([userData]) => {
				setUserData(userData);
			});
	}, [response]);

	//const user = useContext<UserData>(UserStateContext
	//userData.role = "leveranseleder"
	{
		//approve_level = 2;
		if (!userData) return userData === "";
		return (

			< nav >
				<div className="logo">
					<h1>Vaktor</h1>
				</div>
				{
					(userData.role === "vakthaver" || userData.role === "vaktsjef" || userData.role === "leveranseleder" || userData.role === "personalsjef") && (
						<Link href="/"><Button variant="tertiary" style={{
							marginLeft: "5px",
							marginRight: "5px",
							height: "35px",
						}}><a className="link">{RouterVaktor.NAME}</a></Button></Link>

					)
				}

				{
					(userData.role === "vakthaver" || userData.role === "vaktsjef" || userData.role === "leveranseleder" || userData.role === "personalsjef") && (
						<Link href="/admin"><Button variant="tertiary" style={{
							marginLeft: "5px",
							marginRight: "5px",
							height: "35px",
						}}><a className="link">{RouterAdmin.NAME}</a></Button></Link>
					)
				}

				{
					(userData.role === "vaktsjef" || userData.role === "leveranseleder" || userData.role === "personalsjef") && (
						<Link href="/adminleder"><Button variant="tertiary" style={{
							marginLeft: "5px",
							marginRight: "5px",
							height: "35px",
						}}><a className="link">{RouterLedergodkjenning.NAME}</a></Button></Link>
					)
				}

				{
					(userData.role === "leveranseleder") && (
						<Link href="/assignleder"><Button variant="tertiary" style={{
							marginLeft: "5px",
							marginRight: "5px",
							height: "35px",
						}}><a className="link">{RouterAssignLeder.NAME}</a></Button></Link>
					)
				}
			</nav >
		);
	}
}