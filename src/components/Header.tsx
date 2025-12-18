import { Alert, Button, Heading, Link, Page } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import { User } from '../types/types'
import * as Routes from '../types/routes'
import Image from 'next/image'

// A function to check if the user has any of the specified roles
const hasAnyRole = (user: User, roleTitles: string[]): boolean => {
    return user.roles?.some((role) => roleTitles.includes(role.title)) ?? false
}

const Header = () => {
    const { user } = useAuth()
    const today = new Date()
    
    const LinkButton: React.FC<{ route: (typeof Routes)[keyof typeof Routes] }> = ({ route }) => (
        <Link href={route.PATH}>
            <Button variant="tertiary" style={{ marginLeft: '5px', marginRight: '5px', height: '35px' }}>
                <a className="link">{route.NAME}</a>
            </Button>
        </Link>
    )
    return (
        <Page.Block width="2xl" gutters>
            <Heading level="1" size="large">
                <div style={{ margin: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        src={today.getMonth() === 11 ? '/images/vaktor-santa.png' : '/images/vaktor-logo.png'}
                        alt="Vaktor logo"
                        width={70}
                        height={70}
                        onClick={() => {
                            window.location.href = Routes.RouterVaktor.PATH
                        }}
                    />
                    <b>Vaktor </b> - beredskapsvakt i Nav
                </div>
                {/* Alert if no roles */}
                {!hasAnyRole(user, ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && (
                    <Alert variant="info" size="small" style={{ maxWidth: '250px', minWidth: '250px' }}>
                        Du har ingen rolle i vaktor
                    </Alert>
                )}
            </Heading>
        </Page.Block>
    )
}

export default Header
