import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import AvstemmingOkonomi from '../components/AvstemmingOkonomi'
import { GuidePanel } from '@navikt/ds-react'
import { User } from '../types/types'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Admin from '../components/Admin'

const Home: NextPage = () => {
    const { user } = useAuth()
    moment.locale('nb')

    if (user.is_admin === true)
        return (
            <>
                <div className="Container">
                    <div className="AdminGuideContainer">
                        <GuidePanel className="AdminGuidePanel">
                            <p>Adminoppgaver </p>
                        </GuidePanel>
                    </div>
                    <Admin></Admin>
                </div>
            </>
        )
    return <div>Du har ikke tilgang hit!</div>
}

export default Home
