import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import AvstemmingOkonomiAlle from '../components/AvstemmingOkonomiAlle'

const Home: NextPage = () => {
    const { user } = useAuth()
    moment.locale('nb')

    if (['okonomi'].includes(user.role) || user.is_admin === true)
        return (
            <>
                <div className="Container">
                    <div className="AdminGuideContainer">
                        <GuidePanel className="AdminGuidePanel">
                            <p>Avstemming for ØT </p>
                        </GuidePanel>
                    </div>
                    <AvstemmingOkonomiAlle></AvstemmingOkonomiAlle>
                </div>
            </>
        )
    return <div>Du har ikke tilgang hit!</div>
}

export default Home
