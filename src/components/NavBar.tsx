import React from 'react'
import Link from 'next/link'
import { Button, Alert } from '@navikt/ds-react'
import Image from 'next/image'
import { useAuth } from '../context/AuthContext'
import { User } from '../types/types'
import * as Routes from '../types/routes'

// A function to check if the user has any of the specified roles
const hasAnyRole = (user: User, roleTitles: string[]): boolean => {
    return user.roles?.some((role) => roleTitles.includes(role.title)) ?? false
}

const Navbar: React.FC = () => {
    const { user } = useAuth()
    const today = new Date()
    const greetings = ['Hei, ', 'Vooof! ', 'Voff, voff, ', today.getMonth() === 11 ? 'God jul, ' : ''].filter(Boolean)

    // Function to get a random greeting
    const getGreeting = () => greetings[Math.floor(Math.random() * greetings.length)]

    // Function to generate a link button
    const LinkButton: React.FC<{ route: (typeof Routes)[keyof typeof Routes] }> = ({ route }) => (
        <Link href={route.PATH}>
            <Button variant="tertiary" style={{ marginLeft: '5px', marginRight: '5px', height: '35px' }}>
                <a className="link">{route.NAME}</a>
            </Button>
        </Link>
    )

    return (
        <>
            <nav>
                {/* Logo and greeting */}
                <div style={{ marginTop: '10px' }}>
                    <Image
                        src={today.getMonth() === 11 ? '/vaktor/images/vaktor-santa.png' : '/vaktor/images/vaktor-logo.png'}
                        alt="Vaktor logo"
                        width={70}
                        height={70}
                    />
                </div>
                <div className="logo">
                    {hasAnyRole(user, ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && (
                        <h3>
                            {getGreeting()} {user.name}
                        </h3>
                    )}
                </div>

                {/* Buttons for various roles */}
                {hasAnyRole(user, ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && (
                    <LinkButton route={Routes.RouterVaktor} />
                )}
                {hasAnyRole(user, ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'admin']) && (
                    <LinkButton route={Routes.RouterAdminSchedule} />
                )}
                {hasAnyRole(user, ['vaktsjef', 'admin']) && <LinkButton route={Routes.RouterVaktperioder} />}
                {hasAnyRole(user, ['vakthaver', 'vaktsjef', 'leveranseleder', 'admin']) && <LinkButton route={Routes.RouterDineVakter} />}
                {hasAnyRole(user, ['vaktsjef', 'leveranseleder', 'personalleder', 'admin', 'bdm']) && (
                    <LinkButton route={Routes.RouterLedergodkjenning} />
                )}
                {hasAnyRole(user, ['leveranseleder', 'admin']) && <LinkButton route={Routes.RouterLeveranseleder} />}
                {hasAnyRole(user, ['okonomi', 'admin']) && <LinkButton route={Routes.RouterAvstemmingOkonomi} />}
                {hasAnyRole(user, ['admin']) && <LinkButton route={Routes.RouterUnfinished} />}
                {hasAnyRole(user, ['admin']) && <LinkButton route={Routes.RouterVaktlagAdmin} />}
                {hasAnyRole(user, ['admin']) && <LinkButton route={Routes.RouterAdmin} />}

                {/* Alert if no roles */}
                {!hasAnyRole(user, ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && (
                    <Alert variant="info" size="small" style={{ maxWidth: '250px', minWidth: '250px', marginBottom: '20px', marginTop: '-20px' }}>
                        Du har ingen rolle i vaktor
                    </Alert>
                )}
            </nav>
        </>
    )
}

export default Navbar
