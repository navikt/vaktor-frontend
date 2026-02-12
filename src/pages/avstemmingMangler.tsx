import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { useAuth } from '../context/AuthContext'
import AvstemmingMangler from '../components/AvstemmingMangler'
import { hasAnyRole } from '../utils/roles'

const Home: NextPage = () => {
    const { user } = useAuth()
    moment.locale('nb')

    const hasAccess = hasAnyRole(user, ['okonomi', 'admin'])

    if (hasAccess) {
        return (
            <div className="Container">
                <AvstemmingMangler />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
