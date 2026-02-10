import React, { useState } from 'react'
import Link from 'next/link'
import { Button, Dropdown, BodyShort, HStack } from '@navikt/ds-react'
import { MenuHamburgerIcon } from '@navikt/aksel-icons'
import Image from 'next/image'

import { useAuth } from '../../context/AuthContext'
import { User } from '../../types/types'
import * as Routes from '../../types/routes'

// A function to check if the user has any of the specified roles (global or group-specific)
const hasAnyRole = (user: User, roleTitles: string[]): boolean => {
    const hasGlobalRole = user.roles?.some((role) => roleTitles.includes(role.title)) ?? false
    const hasGroupRole = user.group_roles?.some((gr) => roleTitles.includes(gr.role?.title)) ?? false
    return hasGlobalRole || hasGroupRole
}

type NavRoute = {
    route: (typeof Routes)[keyof typeof Routes]
    roles: string[]
}

const Navbar: React.FC = () => {
    const { user } = useAuth()
    const today = new Date()
    const greetings = ['Hei, ', today.getMonth() === 11 ? 'God jul, ' : ''].filter(Boolean)

    // Function to get a random greeting
    const [getGreeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)])

    // Function to generate a link button
    const LinkButton: React.FC<{ route: (typeof Routes)[keyof typeof Routes] }> = ({ route }) => (
        <Link href={route.PATH}>
            <Button variant="tertiary" style={{ marginLeft: '5px', marginRight: '5px', height: '35px' }}>
                {route.NAME}
            </Button>
        </Link>
    )

    // Define all possible navigation routes with their required roles
    const allRoutes: NavRoute[] = [
        { route: Routes.RouterVaktor, roles: ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm'] },
        { route: Routes.RouterAdminSchedule, roles: ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'admin'] },
        { route: Routes.RouterVaktperioder, roles: ['vaktsjef', 'admin'] },
        { route: Routes.RouterDineVakter, roles: ['vakthaver', 'vaktsjef', 'leveranseleder', 'admin'] },
        { route: Routes.RouterLedergodkjenning, roles: ['vaktsjef', 'leveranseleder', 'personalleder', 'admin', 'bdm'] },
        { route: Routes.RouterLeveranseleder, roles: ['leveranseleder', 'admin'] },
        { route: Routes.RouterAvstemmingOkonomi, roles: ['okonomi', 'admin'] },
        { route: Routes.RouterUnfinished, roles: ['admin'] },
        { route: Routes.RouterVaktlagAdmin, roles: ['admin'] },
        { route: Routes.RouterBrukerAdmin, roles: ['admin'] },
        { route: Routes.RouterAdmin, roles: ['admin'] },
    ]

    // Filter routes based on user roles
    const visibleRoutes = allRoutes.filter((navRoute) => hasAnyRole(user, navRoute.roles))

    const MAX_VISIBLE_ITEMS = 5

    return (
        <>
            <nav>
                <div className="logo">
                    <HStack gap="space-8" align="center">
                        <Image
                            src={today.getMonth() === 11 ? '/images/vaktor-santa.png' : '/images/vaktor-logo.png'}
                            alt="Vaktor logo"
                            width={60}
                            height={60}
                            onClick={() => {
                                window.location.href = Routes.RouterVaktor.PATH
                            }}
                            style={{ cursor: 'pointer', padding: 'var(--ax-space-4)' }}
                        />
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.8rem', lineHeight: '1.2' }}>Vaktor</div>
                            {hasAnyRole(user, ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && (
                                <BodyShort size="small" style={{ color: 'var(--ax-text-neutral-subtle)' }}>
                                    {getGreeting} {user.name}
                                </BodyShort>
                            )}
                        </div>
                    </HStack>
                </div>

                {/* Show first items directly */}
                {visibleRoutes.slice(0, MAX_VISIBLE_ITEMS).map((navRoute, index) => (
                    <LinkButton key={index} route={navRoute.route} />
                ))}

                {/* Show remaining items in dropdown if more than MAX_VISIBLE_ITEMS */}
                {visibleRoutes.length > MAX_VISIBLE_ITEMS && (
                    <Dropdown>
                        <Button
                            as={Dropdown.Toggle}
                            variant="tertiary"
                            icon={<MenuHamburgerIcon title="Mer" />}
                            style={{ marginLeft: '5px', marginRight: '5px', height: '35px' }}
                        >
                            Mer
                        </Button>
                        <Dropdown.Menu>
                            <Dropdown.Menu.List>
                                {visibleRoutes.slice(MAX_VISIBLE_ITEMS).map((navRoute, index) => (
                                    <Dropdown.Menu.List.Item key={index} as={Link} href={navRoute.route.PATH}>
                                        {navRoute.route.NAME}
                                    </Dropdown.Menu.List.Item>
                                ))}
                            </Dropdown.Menu.List>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </nav>
        </>
    )
}

export default Navbar
