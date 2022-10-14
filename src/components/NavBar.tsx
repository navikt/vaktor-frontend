import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from "@navikt/ds-react";

import { RouterVaktor, RouterAdmin, RouterLedergodkjenning } from '../types/routes';

export default function Navbar() {
	const router = useRouter()

	//const user = useContext<UserData>(UserStateContext

	return (

		<nav>
			<div className="logo">
				<h1>Vaktor</h1>
			</div>
			<Link href="/"><Button variant="tertiary" style={{
				marginLeft: "5px",
				marginRight: "5px",
				height: "35px",
				color: "#FAEBD7",
			}}><a className="link">{RouterVaktor.NAME}</a></Button></Link>
			<Link href="/admin"><Button variant="tertiary" style={{
				marginLeft: "5px",
				marginRight: "5px",
				height: "35px",
				color: "red"
			}}><a className="link">{RouterAdmin.NAME}</a></Button></Link>
			<Link href="/adminleder"><Button variant="tertiary" style={{
				marginLeft: "5px",
				marginRight: "5px",
				height: "35px",
			}}><a className="link">{RouterLedergodkjenning.NAME}</a></Button></Link>

		</nav >
	)
}