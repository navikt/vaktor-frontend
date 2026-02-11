import type { NextPage } from 'next'
import { Loader } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import GroupManagement from '../components/GroupManagement'
import { hasAnyRole } from '../utils/roles'

const VaktlagOpprett: NextPage = () => {
    const { user } = useAuth()

    if (!user?.id) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader size="xlarge" title="Laster..." />
            </div>
        )
    }

    const hasAccess = hasAnyRole(user, ['admin'])

    if (!hasAccess) {
        return <div>Du har ikke tilgang hit!</div>
    }

    return (
        <div className="Container">
            <GroupManagement />
        </div>
    )
}

export default VaktlagOpprett
