import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import DineVakter from '../components/DineVakter'
import NextDeadlineBox from '../components/utils/NextDeadlineBox'

const Home: NextPage = () => {
    const { user } = useAuth()
    moment.locale('nb')

    // Check if the roles array exists and includes any of the specified roles
    const hasAccess =
        user?.roles?.some((role) => ['admin'].includes(role.title.toLowerCase())) ||
        user?.group_roles?.some((role) => ['vakthaver', 'vaktsjef', 'admin'].includes(role.title.toLowerCase()))

    if (hasAccess) {
        return (
            <div className="Container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', width: '100%', textAlign: 'left' }}>
                            <p style={{ flex: '1 1 0', margin: 0 }}>
                                Under er listen over perioder du er registrert med bereskapsvakt som du må ta stilling til.{' '}
                            </p>
                            <div style={{ flex: '1 1 0' }}>
                                <NextDeadlineBox />
                            </div>
                        </div>
                    </GuidePanel>
                </div>
                <DineVakter />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
