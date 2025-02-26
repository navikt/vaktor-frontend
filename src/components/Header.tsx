import { Alert, Button, Heading, Link } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import styled from 'styled-components'
import { User } from '../types/types'
import * as Routes from '../types/routes'
import Image from 'next/image'

// A function to check if the user has any of the specified roles
const hasAnyRole = (user: User, roleTitles: string[]): boolean => {
    return user.roles?.some((role) => roleTitles.includes(role.title)) ?? false
}

const today = new Date()

const HeaderContent = styled.span`
    justify-content: center;
    display: flex;
    align-items: center;
    margin-top: 20px;
`

const HeadingCustomized = styled(Heading)`
    display: none;
    text-align: center;
    font-weight: normal;

    @media (min-width: 390px) {
        width: 100%;
        display: block;
    }
    @media (min-width: 450px) {
        width: 425px;
    }
`

const Header = () => {
    const { user } = useAuth()

    const LinkButton: React.FC<{ route: (typeof Routes)[keyof typeof Routes] }> = ({ route }) => (
        <Link href={route.PATH}>
            <Button variant="tertiary" style={{ marginLeft: '5px', marginRight: '5px', height: '35px' }}>
                <a className="link">{route.NAME}</a>
            </Button>
        </Link>
    )
    return (
        <HeaderContent>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Image
                    src={today.getMonth() === 11 ? '/images/vaktor-santa.png' : '/images/vaktor-logo.png'}
                    alt="Vaktor logo"
                    width={70}
                    height={70}
                    onClick={() => {
                        window.location.href = Routes.RouterVaktor.PATH
                    }}
                />
                <div style={{ marginLeft: '30px', fontSize: '1.5em' }}>
                    <b>Vaktor</b> - beredskapsvakt i Nav{' '}
                </div>
            </div>
            {/* Alert if no roles */}
            {!hasAnyRole(user, ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && (
                <Alert variant="info" size="small" style={{ maxWidth: '250px', minWidth: '250px' }}>
                    Du har ingen rolle i vaktor
                </Alert>
            )}
        </HeaderContent>
    )
}

export default Header
