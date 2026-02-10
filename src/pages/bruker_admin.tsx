import type { NextPage } from 'next'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import UserRoleManagement from '../components/UserRoleManagement'
import { hasAnyRole } from '../utils/roles'

const BrukerAdmin: NextPage = () => {
    const { user } = useAuth()

    const hasAccess = hasAnyRole(user, ['admin'])

    if (hasAccess) {
        return (
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>Her kan du administrere brukere og deres roller i vaktlag.</p>
                    </GuidePanel>
                </div>
                <UserRoleManagement />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default BrukerAdmin
