import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../../context/AuthContext'
import LederKontroll from '../../components/LederKontroll/LederKontroll'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    if (['vaktsjef', 'leveranseleder', 'personalleder'].includes(user.role))
        return (
            <>
                <div className="Container">
                    <div className="AdminGuideContainer">
                        <GuidePanel className="AdminGuidePanel">
                            <p>Under er listen over personer som har vaktperioder du må ta stilling til. </p>
                        </GuidePanel>
                    </div>
                    <LederKontroll></LederKontroll>
                </div>
            </>
        )
    return <div>Du har ikke tilgang hit!</div>
}

export default Home
