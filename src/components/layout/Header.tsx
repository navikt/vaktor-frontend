import { Alert, Page, VStack } from '@navikt/ds-react'
import { useAuth } from '../../context/AuthContext'
import { User } from '../../types/types'

// A function to check if the user has any of the specified roles
const hasAnyRole = (user: User, roleTitles: string[]): boolean => {
    return user.roles?.some((role) => roleTitles.includes(role.title)) ?? false
}

const Header = () => {
    const { user } = useAuth()

    return (
        <Page.Block width="2xl" gutters style={{ paddingTop: 'var(--ax-space-16)' }}>
            <VStack gap="space-4" align="center">
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
