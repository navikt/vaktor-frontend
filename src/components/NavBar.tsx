import { useRouter } from 'next/router'
import Link from 'next/link'
import styled from 'styled-components'

import { BodyShort } from '@navikt/ds-react';

import { RouterVaktor, RouterAdmin, RouterLedergodkjenning } from '../types/routes';

const Nav = styled.nav`
	height: 2.75rem;
	border-bottom: #c6c2bf 1px solid;

	display: none;

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		height: 100%;
		width: 100%;

		display: flex;
		justify-content: center;

		li {
			:hover {
				cursor: pointer;
			}

			.inactive {
				border-bottom: transparent 3px solid;
				
				:hover {
					border-bottom: var(--navds-global-color-blue-500) 3px solid;
				}
			}

			:focus, :active {
				color: black;
				background-color: transparent;
				outline: var(--navds-semantic-color-focus) 3px solid;
				box-shadow: 0 0 0 0;
				outline-offset: -3px;
			}

			a {
				text-decoration: none;
				color: black;
			}
		}
	}


	@media (min-width: 768px) {
		display: block;
	}
`

const LenkeSpacer = styled.div`
	margin: 0 1rem;
	height: 100%;
	
	border-bottom: 3px transparent;
	display: flex;
	align-items: center;

	&.active {
		border-bottom: var(--navds-global-color-blue-500) 3px solid;
		
		p {
			font-weight: bold !important;
		}
	}
`

export default function Navbar() {
	const router = useRouter()

	//const user = useContext<UserData>(UserStateContext


	return (
		<Nav>
			<ul role="tablist">
				<li role="tab" onClick={() => router.push(RouterVaktor.PATH)}>
					<Link href={RouterVaktor.PATH}>
						<a>
							<LenkeSpacer className={`${(router.asPath === RouterVaktor.PATH) ? "active" : "inactive"}`}>
								<BodyShort size="small" className={`${router.pathname === "/" ? "active" : ""}`}>{RouterVaktor.NAME}</BodyShort>
							</LenkeSpacer>
						</a>
					</Link>
				</li>
				<li role="tab" onClick={() => router.push(RouterAdmin.PATH)}>
					<Link href={RouterAdmin.PATH}>
						<a>
							<LenkeSpacer className={`${(router.asPath === RouterAdmin.PATH) ? "active" : "inactive"}`}>
								<BodyShort size="small" className={`${router.pathname === "/admin" ? "active" : ""}`}>{RouterAdmin.NAME}</BodyShort>
							</LenkeSpacer>
						</a>
					</Link>
				</li>
				<li role="tab" onClick={() => router.push(RouterLedergodkjenning.PATH)}>
					<Link href={RouterAdmin.PATH}>
						<a>
							<LenkeSpacer className={`${(router.asPath === RouterLedergodkjenning.PATH) ? "active" : "inactive"}`}>
								<BodyShort size="small" className={`${router.pathname === "/adminLeder" ? "active" : ""}`}>{RouterLedergodkjenning.NAME}</BodyShort>
							</LenkeSpacer>
						</a>
					</Link>
				</li>



			</ul>
		</Nav>
	)
}