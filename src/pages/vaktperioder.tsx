import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel } from '@navikt/ds-react'
import Vaktperioder from '../components/Vaktperioder'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole, ADMIN_ROLES } from '../utils/roles'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    const hasAccess = hasAnyRole(user, [...ADMIN_ROLES, 'vaktsjef', 'leveranseleder'])

    if (hasAccess) {
        return (
            <div className="Container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>Her kan du generere nye vaktperioder for ditt vaktlag.</p>
                    </GuidePanel>
                </div>
                <Vaktperioder />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
