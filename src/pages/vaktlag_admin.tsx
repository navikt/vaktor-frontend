import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import VaktlagAdmin from '../components/VaktlagAdmin'
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
                        <p>Her kan du opprette nye vaktlag</p>
                        <p>
                            <b>OBS! funker ikke enda</b>
                        </p>
                    </GuidePanel>
                </div>
                <VaktlagAdmin />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
