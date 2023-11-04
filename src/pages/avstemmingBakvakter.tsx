import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import AvstemmingBakvakter from '../components/AvstemmingBakvakter'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    const hasAccess = user?.roles?.some((role) => ['okonomi', 'admin'].includes(role.title.toLowerCase()))

    if (hasAccess) {
        return (
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>Rapport for bakvakter</p>
                    </GuidePanel>
                </div>
                <AvstemmingBakvakter />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
