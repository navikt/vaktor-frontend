import type { NextPage } from 'next'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import AuditLogComponent from '../components/AuditLog'
import { hasAnyRole } from '../utils/roles'

const AuditPage: NextPage = () => {
    const { user } = useAuth()

    const hasAccess = hasAnyRole(user, ['admin', 'okonomi'])

    if (hasAccess) {
        return (
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>Her kan du se alle handlinger som er utfort i systemet.</p>
                    </GuidePanel>
                </div>
                <AuditLogComponent />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default AuditPage
