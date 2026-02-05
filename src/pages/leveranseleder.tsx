import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import AdminLeder from '../components/LeveranselederAdmin'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    const hasAccess =
        user?.roles?.some((role) => ['bdm', 'admin'].includes(role.title.toLowerCase())) ||
        user?.group_roles?.some((role) => ['leveranseleder'].includes(role.title.toLowerCase()))

    if (hasAccess) {
        return (
            <div className="Container">
                <div className="AdminGuideContainer">
                    <GuidePanel className="AdminGuidePanel">
                        <p>Her kan leveranseleder påta seg ansvaret som leder for et vaktlag og tildele vaktsjef </p>
                    </GuidePanel>
                </div>
                <AdminLeder />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
