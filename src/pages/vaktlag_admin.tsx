import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { useAuth } from '../context/AuthContext'
import VaktlagAdmin from '../components/VaktlagAdmin'
import { hasAnyRole } from '../utils/roles'

const Home: NextPage = () => {
    const { user } = useAuth()

    moment.locale('nb')

    const hasAccess = hasAnyRole(user, ['admin', 'leveranseleder'])

    if (hasAccess) {
        return (
            <div className="Container">
                <VaktlagAdmin />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
