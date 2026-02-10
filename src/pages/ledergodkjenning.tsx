import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import AdminLeder from '../components/Ledergodkjenning'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import NextDeadlineBox from '../components/utils/NextDeadlineBox'
import { hasAnyRole, ADMIN_ROLES } from '../utils/roles'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    const hasAccess = hasAnyRole(user, [...ADMIN_ROLES, 'vaktsjef', 'leveranseleder', 'personalleder'])

    if (hasAccess) {
        return (
            <div className="Container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: '100%', textAlign: 'left' }}>
                            <p style={{ flex: '1 1 0', margin: 0 }}>Under er listen over personer som har vaktperioder du må ta stilling til.</p>
                            <div style={{ flex: '1 1 0' }}>
                                <NextDeadlineBox />
                            </div>
                        </div>
                    </GuidePanel>
                </div>
                <AdminLeder />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
