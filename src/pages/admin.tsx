import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import Admin from '../components/Admin'

const Home: NextPage = () => {
    const { user } = useAuth()
    moment.locale('nb')

    // Check if the roles array exists and includes any of the specified roles
    const hasAccess = user?.roles?.some((role) => ['admin'].includes(role.title.toLowerCase()))

    if (hasAccess) {
        return (
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>Adminoppgaver </p>
                    </GuidePanel>
                </div>
                <Admin />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
