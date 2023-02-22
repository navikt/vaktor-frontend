import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel } from '@navikt/ds-react'
import UpdateSchedule from '../components/UpdateSchedule'
import { useState, useEffect } from 'react'
import { User } from '../types/types'
import { useAuth } from '../context/AuthContext'

const Home: NextPage = () => {
    const { user } = useAuth()
    moment.locale('nb')

    if (['vakthaver', 'vaktsjef', 'leveranseleder', 'personalleder'].includes(user.role))
        return (
            <>
                <div className="Container">
                    <div className="AdminGuideContainer">
                        <GuidePanel className="AdminGuidePanel">
                            <p>Her kan du endre vaktperioder i vaktlag du er medlem av </p>
                        </GuidePanel>
                    </div>
                    <UpdateSchedule></UpdateSchedule>
                </div>
            </>
        )
    return <div>Du har ikke tilgang hit!</div>
}

export default Home
