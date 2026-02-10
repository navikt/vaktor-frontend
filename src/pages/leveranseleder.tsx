import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import AdminLeder from '../components/LeveranselederAdmin'
import { GuidePanel } from '@navikt/ds-react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole, ADMIN_ROLES } from '../utils/roles'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    const hasAccess = hasAnyRole(user, [...ADMIN_ROLES, 'leveranseleder'])

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
