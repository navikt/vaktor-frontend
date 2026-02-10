import type { NextPage } from 'next'
import moment from 'moment'
import 'moment/locale/nb'
import { GuidePanel, Button } from '@navikt/ds-react'
import { CalendarIcon } from '@navikt/aksel-icons'
import UpdateSchedule from '../components/VaktlagetsVakter'
import { useState, useEffect } from 'react'
import { User } from '../types/types'
import { useAuth } from '../context/AuthContext'

const Home: NextPage = () => {
    const { user } = useAuth()
    const [selectedVaktlag, setSelectedVaktlag] = useState(user?.groups?.[0]?.id || '')
    moment.locale('nb')

    const selectedVaktlagName = user?.groups?.find((g) => g.id === selectedVaktlag)?.name || 'Vaktlaget'

    const group_calendar = async (group_id: string) => {
        try {
            const response = await fetch(`/api/group_calendar?group_id=${group_id}`)
            if (response.ok) {
                const icalData = await response.text()
                const blob = new Blob([icalData], { type: 'text/calendar' })
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = 'group_calendar.ics'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(link.href)
                console.log(`Laster ned kalender for: ${user.name}`)
            } else {
                console.error('Failed to download calendar')
                const errorText = await response.text()
                console.error(errorText)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const my_calendar = async () => {
        try {
            const response = await fetch(`/api/my_calendar`)
            if (response.ok) {
                const icalData = await response.text()
                const blob = new Blob([icalData], { type: 'text/calendar' })
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = 'my_calendar.ics'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(link.href)
                console.log(`Laster ned kalender for: ${user.name}`)
            } else {
                console.error('Failed to download calendar')
                const errorText = await response.text()
                console.error(errorText)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const hasAccess =
        user?.roles?.some((role) => ['bdm', 'admin'].includes(role.title.toLowerCase())) ||
        user?.group_roles?.some((role) => ['vakthaver', 'vaktsjef', 'personalleder', 'leveranseleder'].includes(role.title.toLowerCase()))

    if (hasAccess) {
        return (
            <div className="Container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ minWidth: '600px', maxWidth: '1200px', margin: '2vh auto 2vh auto' }}>
                    <GuidePanel className="AdminGuidePanel">
                        <p>Her kan du endre vaktperioder i vaktlag du er medlem av </p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <Button
                                size="small"
                                icon={<CalendarIcon title="Last ned kalender" fontSize="1.5rem" />}
                                onClick={() => {
                                    if (selectedVaktlag) group_calendar(selectedVaktlag)
                                }}
                            >
                                Last ned .iCal for {selectedVaktlagName}
                            </Button>
                            <Button
                                size="small"
                                variant="secondary"
                                icon={<CalendarIcon title="Last ned kalender" fontSize="1.5rem" />}
                                onClick={() => {
                                    my_calendar()
                                }}
                            >
                                Last ned .iCal for mine vakter
                            </Button>
                        </div>
                    </GuidePanel>
                </div>
                <UpdateSchedule selectedVaktlag={selectedVaktlag} setSelectedVaktlag={setSelectedVaktlag} />
            </div>
        )
    }

    return <div>Du har ikke tilgang hit!</div>
}

export default Home
