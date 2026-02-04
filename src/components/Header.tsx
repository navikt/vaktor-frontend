import { Alert, Heading, Page, HStack, VStack } from '@navikt/ds-react'
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

    return (
        <Page.Block width="2xl" gutters style={{ paddingTop: 'var(--ax-space-24)', paddingBottom: 'var(--ax-space-24)' }}>
            <VStack gap="space-6" align="center">
                <HStack gap="space-4" align="center" justify="center">
                    <Image
                        src={today.getMonth() === 11 ? '/images/vaktor-santa.png' : '/images/vaktor-logo.png'}
                        alt="Vaktor logo"
                        width={70}
                        height={70}
                        onClick={() => {
                            window.location.href = Routes.RouterVaktor.PATH
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                    <Heading level="1" size="large">
                        <b>Vaktor</b> - beredskapsvakt i Nav
                    </Heading>
                </HStack>
                {/* Alert if no roles */}
                {!hasAnyRole(user, ['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && (
                    <Alert variant="info" size="small">
                        Du har ingen rolle i vaktor
                    </Alert>
                )}
            </VStack>
        </Page.Block>
    )
}

export default Header
