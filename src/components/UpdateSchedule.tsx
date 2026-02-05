import { Button, Table, useMonthpicker, MonthPicker, Search, Select, Loader, Tabs, Timeline, TimelinePeriodProps } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { Schedules, Vaktlag } from '../types/types'
import moment from 'moment'
import ScheduleModal from './ScheduleModal'
import ScheduleChanges from './ScheduleChanges'
import BulkDeleteSchedules from './BulkDeleteSchedules'
import { useAuth } from '../context/AuthContext'
import { CalendarIcon, Buildings3Icon, FirstAidKitIcon, RecycleIcon, WaitingRoomIcon } from '@navikt/aksel-icons'

interface UpdateScheduleProps {
    selectedVaktlag: string
    setSelectedVaktlag: (id: string) => void
}

const UpdateSchedule = ({ selectedVaktlag, setSelectedVaktlag }: UpdateScheduleProps) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [scheduleData, setScheduleData] = useState<Schedules[]>([])
    const [selectedSchedule, setSchedule] = useState<Schedules>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [response, setResponse] = useState()
    const [Vakt, addVakt] = useState()
    const [searchFilter, setSearchFilter] = useState('')
    const [activeTab, setActiveTab] = useState('vakter')

    const fromDate = moment('Oct 01 2022', 'MMM DD YYYY').toDate()
    const toDate = moment('2027', 'YYYY').endOf('year').toDate() // December 31, 2027
    const defaultSelected = moment().locale('en-GB').startOf('month').toDate()

    const { monthpickerProps, inputProps, selectedMonth } = useMonthpicker({
        fromDate,
        toDate,
        defaultSelected,
    })

    const TimeLine = ({ schedules }: { schedules: Schedules[] }) => {
        if (!schedules || schedules.length === 0) {
            return null
        }

        const vakter: TimelinePeriodProps[] = schedules
            .filter((s) => s.type === 'ordinær vakt')
            .map((schedule) => ({
                start: new Date(Number(schedule.start_timestamp) * 1000),
                end: new Date(Number(schedule.end_timestamp) * 1000),
                status: 'success',
                icon: <WaitingRoomIcon aria-hidden />,
                statusLabel: 'Vakt',
                children: (
                    <div>
                        <b>{schedule.user.name}</b>
                        <br />
                        Start:{' '}
                        {new Date(schedule.start_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        <br />
                        Slutt:{' '}
                        {new Date(schedule.end_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                ),
            }))

        const vaktbistand: TimelinePeriodProps[] = schedules
            .filter((s) => s.type === 'bistand')
            .map((change) => ({
                start: new Date(change.start_timestamp * 1000),
                end: new Date(change.end_timestamp * 1000),
                status: 'info',
                icon: <FirstAidKitIcon aria-hidden />,
                statusLabel: 'Bistand',
                children: (
                    <div>
                        <b>{change.user.name}</b> <br />
                        Start:{' '}
                        {new Date(change.start_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        <br />
                        Slutt:{' '}
                        {new Date(change.end_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                ),
            }))

        const vaktbytter: TimelinePeriodProps[] = schedules
            .filter((s) => s.type === 'bytte')
            .map((change) => ({
                start: new Date(Number(change.start_timestamp) * 1000),
                end: new Date(Number(change.end_timestamp) * 1000),
                status: 'warning',
                icon: <RecycleIcon aria-hidden />,
                statusLabel: 'Bytte',
                children: (
                    <div>
                        <b>{change.user.name}</b>
                        <br />
                        Start:{' '}
                        {new Date(change.start_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        <br />
                        Slutt:{' '}
                        {new Date(change.end_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                ),
            }))

        return (
            <div className="min-w-[800px]">
                <Timeline>
                    <Timeline.Row label="Vakter" icon={<Buildings3Icon aria-hidden />}>
                        {vakter.map((p, i) => (
                            <Timeline.Period key={i} start={p.start} end={p.end} status={p.status} icon={p.icon} statusLabel={p.statusLabel}>
                                {p.children ?? null}
                            </Timeline.Period>
                        ))}
                    </Timeline.Row>
                    <Timeline.Row label="Bistand" icon={<FirstAidKitIcon aria-hidden />}>
                        {vaktbistand.map((p, i) => (
                            <Timeline.Period key={i} start={p.start} end={p.end} status={p.status} icon={p.icon} statusLabel={p.statusLabel}>
                                {p.children ?? null}
                            </Timeline.Period>
                        ))}
                    </Timeline.Row>
                    <Timeline.Row label="Bytter" icon={<RecycleIcon aria-hidden />}>
                        {vaktbytter.map((p, i) => (
                            <Timeline.Period key={i} start={p.start} end={p.end} status={p.status} icon={p.icon} statusLabel={p.statusLabel}>
                                {p.children ?? null}
                            </Timeline.Period>
                        ))}
                    </Timeline.Row>
                </Timeline>
            </div>
        )
    }

    function getMonthTimestamps(currentMonth: Date) {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        // Start of the month
        const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0)
        const startTimestamp = Math.floor(startOfMonth.getTime() / 1000)

        // End of the month (start of the next month)
        const startOfNextMonth = new Date(year, month + 1, 1, 0, 0, 0, 0)
        const endTimestamp = Math.floor(startOfNextMonth.getTime() / 1000)

        return { startTimestamp, endTimestamp }
    }

    let startTimestamp: number, endTimestamp: number

    if (selectedMonth !== undefined) {
        const timestamps = getMonthTimestamps(selectedMonth)
        startTimestamp = timestamps.startTimestamp
        endTimestamp = timestamps.endTimestamp
    } else {
        const now = new Date()
        startTimestamp = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime() / 1000
        endTimestamp = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0).getTime() / 1000
    }

    const group_calendar = async (group_id: string) => {
        try {
            const response = await fetch(`/api/group_calendar?group_id=${group_id}`)
            if (response.ok) {
                const icalData = await response.text()
                const blob = new Blob([icalData], { type: 'text/calendar' })

                // Create a link element to download the file
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = 'group_calendar.ics'
                document.body.appendChild(link)
                link.click()

                // Clean up the link element
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

                // Create a link element to download the file
                const link = document.createElement('a')
                link.href = window.URL.createObjectURL(blob)
                link.download = 'my_calendar.ics'
                document.body.appendChild(link)
                link.click()

                // Clean up the link element
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

    useEffect(() => {
        setLoading(true)

        const fetchSchedules = async () => {
            try {
                const scheduleRes = await fetch(`/api/group_schedules_with_limit?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`)
                const scheduleData = await scheduleRes.json()
                scheduleData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)
                setScheduleData(scheduleData)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchSchedules()
    }, [response, Vakt, selectedSchedule, isOpen, startTimestamp, endTimestamp])

    return (
        <>
            {selectedSchedule ? (
                <ScheduleModal
                    schedule={selectedSchedule}
                    isOpen={isOpen}
                    setIsOpen={(open) => {
                        setIsOpen(open)
                        if (!open) {
                            setSchedule(undefined)
                            setResponse(undefined)
                            addVakt(undefined)
                        }
                    }}
                    setResponse={setResponse}
                    addVakt={addVakt}
                />
            ) : (
                <></>
            )}
            <div
                style={{
                    marginBottom: '3vh',
                }}
            >
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab value="vakter" label="Vakter" />
                        <Tabs.Tab value="administrer" label="Administrer" />
                    </Tabs.List>
                    <Tabs.Panel value="vakter" style={{ marginTop: '2vh' }}>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '2vh', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <Select
                                label="Velg vaktlag"
                                value={selectedVaktlag}
                                onChange={(e) => setSelectedVaktlag(e.target.value)}
                                style={{ minWidth: '200px', maxWidth: '300px' }}
                                size="small"
                            >
                                {user.groups.map((group: Vaktlag) => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </Select>

                            <MonthPicker {...monthpickerProps}>
                                <MonthPicker.Input {...inputProps} label="Velg måned" size="small" />
                            </MonthPicker>

                            <form style={{ minWidth: '200px', maxWidth: '300px' }}>
                                <Search
                                    label="Søk etter person"
                                    hideLabel={false}
                                    variant="simple"
                                    size="small"
                                    onChange={(text) => setSearchFilter(text)}
                                    onClick={(e) => false}
                                />
                            </form>
                        </div>

                        <div style={{ marginBottom: '3vh' }}>
                            {selectedMonth && (
                                <TimeLine
                                    schedules={scheduleData.filter(
                                        (schedule: Schedules) =>
                                            schedule.start_timestamp !== null &&
                                            schedule.user.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
                                            new Date(schedule.start_timestamp * 1000).getMonth() === selectedMonth.getMonth() &&
                                            new Date(schedule.start_timestamp * 1000).getFullYear() === selectedMonth.getFullYear() &&
                                            selectedVaktlag == schedule.group_id
                                    )}
                                />
                            )}
                        </div>

                        <Table
                            style={{
                                minWidth: '1150px',
                                maxWidth: '1200px',
                                backgroundColor: 'white',
                                marginBottom: '3vh',
                            }}
                        >
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Vaktbistand</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Vaktbytter</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {scheduleData
                                    .filter(
                                        (schedule: Schedules) =>
                                            schedule.start_timestamp !== null &&
                                            schedule.type === 'ordinær vakt' &&
                                            schedule.user.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
                                            new Date(schedule.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
                                            new Date(schedule.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear() &&
                                            selectedVaktlag == schedule.group_id
                                    )
                                    .map((schedule: Schedules, i) => {
                                        //approve_level = 0;
                                        return (
                                            <Table.Row key={i}>
                                                <Table.HeaderCell
                                                    scope="row"
                                                    style={{
                                                        minWidth: '210px',
                                                        maxWidth: '210px',
                                                    }}
                                                >
                                                    {schedule.user.name}
                                                    <br />
                                                    {schedule.type}
                                                </Table.HeaderCell>

                                                <Table.DataCell>
                                                    Uke: {moment(schedule.start_timestamp * 1000).week()}{' '}
                                                    {moment(schedule.start_timestamp * 1000).week() < moment(schedule.end_timestamp * 1000).week()
                                                        ? ' - ' + moment(schedule.end_timestamp * 1000).week()
                                                        : ''}
                                                    <br />
                                                    Fra:{' '}
                                                    {new Date(schedule.start_timestamp * 1000).toLocaleString('no-NB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                    <br />
                                                    Til:{' '}
                                                    {new Date(schedule.end_timestamp * 1000).toLocaleString('no-NB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                    <br />
                                                    {loading ? (
                                                        <div>
                                                            <Loader />
                                                        </div>
                                                    ) : (
                                                        <Button
                                                            style={{
                                                                height: '30px',
                                                                marginTop: '10px',
                                                                marginBottom: '5px',
                                                                minWidth: '170px',
                                                                maxWidth: '190px',
                                                            }}
                                                            onClick={() => {
                                                                setSchedule(schedule)
                                                                setIsOpen(true)
                                                            }}
                                                            disabled={schedule.approve_level > 0}
                                                        >
                                                            Legg til endringer
                                                        </Button>
                                                    )}
                                                </Table.DataCell>
                                                <Table.DataCell
                                                    style={{
                                                        minWidth: '210px',
                                                        maxWidth: '210px',
                                                    }}
                                                >
                                                    <div>
                                                        <ScheduleChanges
                                                            periods={schedule.vakter.filter((vakt) => vakt.type == 'bistand')}
                                                            setResponse={setResponse}
                                                            loading={loading}
                                                            modalView={false}
                                                        ></ScheduleChanges>
                                                        <ScheduleChanges
                                                            periods={schedule.vakter.filter((vakt) => vakt.type == 'bakvakt')}
                                                            setResponse={setResponse}
                                                            loading={loading}
                                                            modalView={false}
                                                        ></ScheduleChanges>
                                                    </div>
                                                </Table.DataCell>
                                                <Table.DataCell
                                                    style={{
                                                        minWidth: '210px',
                                                        maxWidth: '210px',
                                                    }}
                                                >
                                                    <ScheduleChanges
                                                        periods={schedule.vakter.filter((vakt) => vakt.type == 'bytte')}
                                                        setResponse={setResponse}
                                                        loading={loading}
                                                        modalView={false}
                                                    ></ScheduleChanges>
                                                </Table.DataCell>
                                            </Table.Row>
                                        )
                                    })}
                            </Table.Body>
                        </Table>
                    </Tabs.Panel>
                    <Tabs.Panel value="administrer" style={{ marginTop: '2vh' }}>
                        <div style={{ maxWidth: '800px' }}>
                            <BulkDeleteSchedules
                                groupId={selectedVaktlag}
                                onDeleted={() => {
                                    setResponse(undefined)
                                }}
                            />
                        </div>
                    </Tabs.Panel>
                </Tabs>
            </div>
        </>
    )
}

export default UpdateSchedule
