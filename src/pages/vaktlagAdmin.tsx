import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel, Select } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import VaktlagAdmin from '../components/VaktlagAdmin'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    if (['leveranseleder'].includes(user.role) || user.is_admin)
        return (
            <>
                <div className="Container">
                    <div className="AdminGuideContainer">
                        <GuidePanel className="AdminGuidePanel">
                            <p>Her kan du opprette nye vaktlag</p>
                        </GuidePanel>
                    </div>
                    <VaktlagAdmin />
                </div>
            </>
        )
    return <div>Du har ikke tilgang hit!</div>
}

export default Home
