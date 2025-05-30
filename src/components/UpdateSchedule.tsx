import { Button, Table, useMonthpicker, MonthPicker, Search, Select, ReadMore, Loader } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { Schedules, Vaktlag } from '../types/types'
import moment from 'moment'
import ScheduleModal from './ScheduleModal'
import ScheduleChanges from './ScheduleChanges'
import { useAuth } from '../context/AuthContext'
import { CalendarIcon } from '@navikt/aksel-icons'

const UpdateSchedule = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [scheduleData, setScheduleData] = useState<Schedules[]>([])
    const [selectedSchedule, setSchedule] = useState<Schedules>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [response, setResponse] = useState()
    const [Vakt, addVakt] = useState()
    const [searchFilter, setSearchFilter] = useState('')
    const [selectedVaktlag, setSelctedVaktlag] = useState(user.groups[0].id)

    const fromDate = moment('Oct 01 2022', 'MMM DD YYYY').toDate()
    const toDate = moment('2027', 'YYYY').endOf('year').toDate() // December 31, 2027
    const defaultSelected = moment().locale('en-GB').startOf('month').toDate()

    const { monthpickerProps, inputProps, selectedMonth } = useMonthpicker({
        fromDate,
        toDate,
        defaultSelected,
    })

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

        fetch('/api/group_schedules')
            .then((scheduleRes) => scheduleRes.json())
            .then((scheduleData) => {
                scheduleData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)
                setScheduleData(scheduleData)
                setLoading(false)
            })
    }, [response, Vakt, selectedSchedule, isOpen])

    return (
        <>
            {selectedSchedule ? (
                <ScheduleModal
                    schedule={selectedSchedule}
                    isOpen={isOpen}
                    setIsOpen={(open) => {
                        setIsOpen(open)
                        if (!open) {
                            setSchedule(undefined) // Reset selected schedule
                            setResponse(undefined) // Reset response state
                            addVakt(undefined) // Reset Vakt state
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
                    marginTop: '2vh',
                    marginBottom: '3vh',
                    display: 'grid',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                }}
            >
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <ReadMore header="Last ned vakter til kalender">
                        <div style={{ display: 'grid', gap: '10px', justifyContent: 'flex-end' }}>
                            <Button
                                size="small"
                                icon={<CalendarIcon title="a11y-title" fontSize="1.5rem" />}
                                onClick={() => {
                                    group_calendar(selectedVaktlag)
                                }}
                            >
                                .iCal for Vaktlaget
                            </Button>
                            <Button
                                size="small"
                                icon={<CalendarIcon title="a11y-title" fontSize="1.5rem" />}
                                onClick={() => {
                                    my_calendar()
                                }}
                            >
                                .iCal for mine vakter
                            </Button>
                        </div>
                    </ReadMore>
                </div>
                <div className="min-h-96" style={{ display: 'flex', gap: '30px' }}>
                    <MonthPicker {...monthpickerProps}>
                        <div className="grid gap-4">
                            <MonthPicker.Input {...inputProps} label="Velg måned" />
                        </div>
                    </MonthPicker>

                    <form style={{ width: '300px' }}>
                        <Search
                            label="Søk etter person"
                            hideLabel={false}
                            variant="simple"
                            onChange={(text) => setSearchFilter(text)}
                            onClick={(e) => false}
                        />
                    </form>

                    <Select label="Velg vaktlag" onChange={(e) => setSelctedVaktlag(e.target.value)}>
                        {user.groups.map((group: Vaktlag) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </Select>
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
            </div>
        </>
    )
}

export default UpdateSchedule
