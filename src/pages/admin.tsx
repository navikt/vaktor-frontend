import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import Admin from '../components/Admin'
import { hasAnyRole } from '../utils/roles'

const Home: NextPage = () => {
    const { user } = useAuth()
    moment.locale('nb')

    const hasAccess = hasAnyRole(user, ['admin'])

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
