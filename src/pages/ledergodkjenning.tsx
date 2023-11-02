import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import AdminLeder from '../components/ApproveLeder'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    // Check if the roles array exists and includes any of the specified roles
    const hasAccess = user?.roles?.some((role) => ['vaktsjef', 'leveranseleder', 'personalleder', 'admin'].includes(role.title.toLowerCase()))

    if (hasAccess) {
        return (
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>Under er listen over personer som har vaktperioder du må ta stilling til.</p>
                    </GuidePanel>
                </div>
                <AdminLeder />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
