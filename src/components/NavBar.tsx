import { useRouter } from "next/router"
import Link from "next/link"
import { Button, Alert } from "@navikt/ds-react"
import { useEffect, useState } from "react"
import { User } from "../types/types"
import Image from "next/image"

import {
	RouterVaktor,
	RouterAdmin,
	RouterLedergodkjenning,
	RouterLeveranseleder,
	RouterAdminSchedule,
	RouterVaktperioder,
	RouterAvstemmingOkonomi,
} from "../types/routes"

const today = new Date()
let greetings: string | any[] = []

today.getMonth() === 11 ? greetings = ["Hei, ", "Vooof! ", "Voff, voff, ", "God jul, "] : greetings = ["Hei, ", "Vooof! ", "Voff, voff, "]

export default function Navbar() {
	const [userData, setUserData] = useState<User>({} as User)

	useEffect(() => {
		Promise.all([fetch("/vaktor/api/get_me")])
			.then(async ([current_user]) => {
				const userjson = await current_user.json()
				return [userjson]
			})
			.then(([userData]) => {
				setUserData(userData)
			})
	}, [])

	//const user = useContext<UserData>(UserStateContext
	//userData.role = "leveranseleder"
	{
		//approve_level = 2;
		return (
			<>
				<nav>
					{today.getMonth() === 11
						?
						<div style={{ marginTop: "10px" }}>
							<Image
								src="/vaktor/images/vaktor-santa.png"
								alt="Vaktor logo"
								width={70}
								height={70}
							/>
						</div>

						:
						<div style={{ marginTop: "10px" }}>
							<Image
								src="/vaktor/images/vaktor-logo.png"
								alt="Vaktor logo"
								width={70}
								height={70}
							/>
						</div>
					}
					<div className="logo">
						{[
							"vakthaver",
							"vaktsjef",
							"leveranseleder",
							"personalleder",
							"okonomi"
						].includes(userData.role) && (
								<h3>{greetings[Math.floor(Math.random() * greetings.length)]} {userData.name}</h3>
							)}
					</div>
					{[
						"vakthaver",
						"vaktsjef",
						"leveranseleder",
						"personalleder",
						"okonomi"
					].includes(userData.role) && (
							<Link href="/">
								<Button
									variant="tertiary"
									style={{
										marginLeft: "5px",
										marginRight: "5px",
										height: "35px",
									}}
								>
									<a className="link">{RouterVaktor.NAME}</a>
								</Button>
							</Link>
						)}

					{[
						"vakthaver",
						"vaktsjef",
						"leveranseleder",
						"personalleder",
					].includes(userData.role) && (
							<Link href="/vaktlagets_vakter">
								<Button
									variant="tertiary"
									style={{
										marginLeft: "5px",
										marginRight: "5px",
										height: "35px",
									}}
								>
									<a className="link">
										{RouterAdminSchedule.NAME}
									</a>
								</Button>
							</Link>
						)}

					{["vaktsjef"].includes(userData.role) && (
						<Link href="/vaktperioder">
							<Button
								variant="tertiary"
								style={{
									marginLeft: "5px",
									marginRight: "5px",
									height: "35px",
								}}
							>
								<a className="link">
									{RouterVaktperioder.NAME}
								</a>
							</Button>
						</Link>
					)}

					{["vakthaver", "vaktsjef", "leveranseleder"].includes(
						userData.role
					) && (
							<Link href="/dine_vakter">
								<Button
									variant="tertiary"
									style={{
										marginLeft: "5px",
										marginRight: "5px",
										height: "35px",
									}}
								>
									<a className="link">{RouterAdmin.NAME}</a>
								</Button>
							</Link>
						)}

					{["vaktsjef", "leveranseleder", "personalleder"].includes(
						userData.role
					) && (
							<Link href="/ledergodkjenning">
								<Button
									variant="tertiary"
									style={{
										marginLeft: "5px",
										marginRight: "5px",
										height: "35px",
									}}
								>
									<a className="link">
										{RouterLedergodkjenning.NAME}
									</a>
								</Button>
							</Link>
						)}

					{userData.role === "leveranseleder" && (
						<Link href="/leveranseleder">
							<Button
								variant="tertiary"
								style={{
									marginLeft: "5px",
									marginRight: "5px",
									height: "35px",
								}}
							>
								<a className="link">{RouterLeveranseleder.NAME}</a>
							</Button>
						</Link>
					)}

					{["okonomi", "leveranseleder"].includes(
						userData.role
					) && (
							<Link href="/avstemming">
								<Button
									variant="tertiary"
									style={{
										marginLeft: "5px",
										marginRight: "5px",
										height: "35px",
									}}
								>
									<a className="link">{RouterAvstemmingOkonomi.NAME}</a>
								</Button>
							</Link>
						)}
				</nav>

				{[
					"vakthaver",
					"vaktsjef",
					"leveranseleder",
					"personalleder",
				].includes(userData.role) ? (
					<></>
				) : (
					<div style={{ marginBottom: "20px", marginTop: "-20px" }}>
						<Alert
							style={{
								maxWidth: "250px",
								minWidth: "250px",
							}}
							size="small"
							variant="info"
						>
							Du har ingen rolle i vaktor
						</Alert>
					</div>
				)}
			</>
		)
	}
}
