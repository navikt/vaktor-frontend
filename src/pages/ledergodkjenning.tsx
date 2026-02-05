import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import AdminLeder from '../components/Ledergodkjenning'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import NextDeadlineBox from '../components/utils/NextDeadlineBox'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    // Check if the roles array exists and includes any of the specified roles
    const hasAccess =
        user?.roles?.some((role) => ['bdm', 'admin'].includes(role.title.toLowerCase())) ||
        user?.group_roles?.some((role) => ['vaktsjef', 'leveranseleder', 'personalleder'].includes(role.title.toLowerCase()))

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
