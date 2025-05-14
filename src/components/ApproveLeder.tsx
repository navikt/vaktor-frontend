import { Button, Table, Loader, MonthPicker, useMonthpicker, Search, Select, HelpText } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState, Dispatch, SetStateAction } from 'react'
import { useAuth } from '../context/AuthContext'
import { Schedules, User } from '../types/types'
import ApproveButton from './utils/ApproveButton'

import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import ErrorModal from './utils/ErrorModal'
import MapApproveStatus from './utils/MapApproveStatus'

const hasAnyRole = (user: User, roleTitles: string[]): boolean => {
    return user.roles?.some((role) => roleTitles.includes(role.title)) ?? false
}

const AdminLeder = ({}) => {
    const { user } = useAuth()

    const [itemData, setItemData] = useState<Schedules[]>([])
    const [response, setResponse] = useState<ResponseType | undefined>()
    const [loading, setLoading] = useState(false)
    //const [openState, setOpenState] = useState(false)

    const [groupNames, setGroupNames] = useState<string[]>([])

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterRole, setSearchFilterRole] = useState('')
    const [searchFilterAction, setSearchFilterAction] = useState(9)
    const [searchFilterGroup, setSearchFilterGroup] = useState('')

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const { monthpickerProps, inputProps, selectedMonth, setSelected } = useMonthpicker({
        fromDate: new Date('Oct 01 2022'),
        toDate: new Date('Aug 23 2025'),
        //defaultSelected: new Date("Oct 2022")
        defaultSelected: new Date(
            new Date().getDate() - 10 > 0
                ? moment().locale('en-GB').format('L')
                : moment()
                      .locale('en-GB')
                      .month(moment().month() - 1)
                      .format('L')
        ),
    })

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
    let rowCount = 0

    if (selectedMonth !== undefined) {
        const timestamps = getMonthTimestamps(selectedMonth)
        startTimestamp = timestamps.startTimestamp
        endTimestamp = timestamps.endTimestamp
    } else {
        const now = new Date()
        startTimestamp = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime() / 1000
        endTimestamp = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0).getTime() / 1000
    }

    const confirm_schedules_bulk = async (scheduleIds: string[], setResponse: Dispatch<any>) => {
        setLoading(true)
        try {
            const results = await Promise.all(
                scheduleIds.map(async (schedule_id) => {
                    const response = await fetch(`/api/confirm_schedule?schedule_id=${schedule_id}`)
                    if (!response.ok) {
                        const errorData = await response.json()
                        throw new Error(`Server error ${response.status}: ${errorData.message || 'No additional error information'}`)
                    }
                    return response.json()
                })
            )
            setResponse(results)
        } catch (error) {
            console.error(error)
            const message =
                error instanceof Error ? `Error in bulk schedule approval: ${error.message}` : 'An unexpected error occurred approving schedules'
            setErrorMessage(message)
        } finally {
            setLoading(false)
        }
    }

    const confirm_schedule = async (schedule_id: string, setResponse: Dispatch<any>) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/confirm_schedule?schedule_id=${schedule_id}`)
            if (!response.ok) {
                // Check if the response was not ok (status code in the range 200-299)
                const errorData = await response.json() // Assuming the server sends JSON with error details
                let message = `Server error ${response.status}: ${errorData.message || 'No additional error information'}`
                setErrorMessage(message)
            } else {
                const data = await response.json()
                setResponse(data)
            }
        } catch (error: unknown) {
            console.error(error)
            let message = 'An unexpected error occurred approving schedule'
            if (error instanceof Error) {
                message = `Noe feiled ved godkjenning av perioden: ${error.message}`
            }
            setErrorMessage(message)
        }
        setLoading(false)
    }

    const disprove_schedule = async (schedule_id: string, setResponse: Dispatch<any>) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/disprove_schedule?schedule_id=${schedule_id}`)
            if (!response.ok) {
                // Check if the response was not ok (status code not in the range 200-299)
                const errorData = await response.json() // Assuming the server sends JSON with error details
                let message = `Server error ${response.status}: ${errorData.message || 'No additional error information'}`
                setErrorMessage(message)
            } else {
                const data = await response.json()
                setResponse(data)
            }
        } catch (error: unknown) {
            console.error(error)
            let message = 'An unexpected error occurred'
            if (error instanceof Error) {
                message = `Feilet ved avvisning av perioden: ${error.message}`
            }
            setErrorMessage(message)
        } finally {
            setLoading(false)
        }
    }

    const mapVakter = (vaktliste: Schedules[]) => {
        // Use a record type to map the koststed to the corresponding array of Schedules
        const groupedByGroupName: Record<string, Schedules[]> = vaktliste.reduce((acc: Record<string, Schedules[]>, current) => {
            const groupName = current.group.name || 'group name not set'
            if (!acc[groupName]) {
                acc[groupName] = []
            }
            acc[groupName].push(current)
            return acc
        }, {} as Record<string, Schedules[]>)

        // Sort each group by start_timestamp
        Object.keys(groupedByGroupName).forEach((groupNameKey) => {
            groupedByGroupName[groupNameKey].sort((a, b) => a.start_timestamp - b.start_timestamp)
        })

        // Convert the grouped and sorted schedules into an array of JSX elements
        const groupedRows = Object.entries(groupedByGroupName).flatMap(([koststed, schedules], index) => [
            // This is the row for the group header
            <Table.Row key={`header-${koststed}`}>
                <Table.DataCell colSpan={9}>
                    <b>{koststed}</b>
                </Table.DataCell>
            </Table.Row>,
            // These are the individual rows for the schedules
            ...schedules.map((vakter, i) => (
                <Table.Row key={`row-${vakter.id}-${i}`}>
                    <Table.DataCell>{++rowCount}</Table.DataCell>
                    <Table.DataCell scope="row">
                        <b> {vakter.user.name}</b>
                        <br />
                        {vakter.user.id.toUpperCase()}
                        <br />
                        {vakter.group.name}
                    </Table.DataCell>
                    <Table.DataCell scope="row">{vakter.type === 'bakvakt' ? 'bistand' : vakter.type}</Table.DataCell>
                    <Table.DataCell>
                        <b>ID: {vakter.id} </b>
                        <br />
                        Uke {moment(vakter.start_timestamp * 1000).week()}{' '}
                        {moment(vakter.start_timestamp * 1000).week() < moment(vakter.end_timestamp * 1000).week()
                            ? ' - ' + moment(vakter.end_timestamp * 1000).week()
                            : ''}
                        <br />
                        Start:{' '}
                        {new Date(vakter.start_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        <br />
                        Slutt:{' '}
                        {new Date(vakter.end_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Table.DataCell>
                    <Table.DataCell>
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            {/* {vakter.vakter.length !== 0 ? "Endringer:" : ""} */}
                            {vakter.vakter.map((endringer, idx: number) => (
                                <div key={idx}>
                                    <b> {endringer.type}:</b> {endringer.user.name} <br />
                                    {new Date(endringer.start_timestamp * 1000).toLocaleString('no-NB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                    <br />
                                    {new Date(endringer.end_timestamp * 1000).toLocaleString('no-NB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            ))}
                        </div>
                    </Table.DataCell>

                    <Table.DataCell style={{ maxWidth: '220px', minWidth: '220px' }}>
                        <div>
                            {vakter.user_id.toLowerCase() === user.id.toLowerCase() ? (
                                <></>
                            ) : (
                                <>
                                    <ApproveButton
                                        vakt={vakter}
                                        user={user}
                                        setResponse={setResponse as Dispatch<SetStateAction<ResponseType>>}
                                        confirmSchedule={confirm_schedule}
                                        setLoading={setLoading}
                                        loading={loading}
                                        onError={setErrorMessage}
                                    />

                                    <Button
                                        disabled={
                                            loading ||
                                            vakter.user_id.toLowerCase() === user.id.toLowerCase() ||
                                            vakter.approve_level === 0 ||
                                            vakter.approve_level === 2 ||
                                            vakter.approve_level >= 3
                                        }
                                        style={{
                                            backgroundColor: '#f96c6c',
                                            height: '30px',
                                            minWidth: '210px',
                                        }}
                                        onClick={() => disprove_schedule(vakter.id, setResponse)}
                                    >
                                        {' '}
                                        {loading ? <Loader /> : 'Avgodkjenn'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </Table.DataCell>

                    <MapApproveStatus status={vakter.approve_level} error={vakter.error_messages} />

                    {hasAnyRole(user, ['leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) ? (
                        <Table.DataCell scope="row" style={{ maxWidth: '200px', minWidth: '150px' }}>
                            {vakter.cost.length !== 0 ? <MapCost vakt={vakter}></MapCost> : 'ingen beregning foreligger'}
                        </Table.DataCell>
                    ) : null}

                    <Table.DataCell scope="row" style={{ maxWidth: '250px', minWidth: '200px' }}>
                        {vakter.audits.length !== 0 ? <MapAudit audits={vakter.audits} /> : 'Ingen hendelser'}
                    </Table.DataCell>
                </Table.Row>
            )),
        ])
        return groupedRows
    }

    useEffect(() => {
        setLoading(true)
        const path = `/api/leader_schedules?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`
        fetch(path)
            .then((scheduleRes) => scheduleRes.json())
            .then((itemData) => {
                itemData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)
                setItemData(itemData)
                setLoading(false)
            })

        const distinctGroupNames: string[] = Array.from(new Set(itemData.map((data: { group: { name: string } }) => data.group.name)))
        const sortedGroupNames = distinctGroupNames.sort((a, b) => a.localeCompare(b))
        setGroupNames(sortedGroupNames)
    }, [response, selectedMonth, setItemData])

    if (itemData === undefined) return <></>
    if (selectedMonth === undefined) setSelected(new Date())

    let listeAvVakter = itemData.filter((value: Schedules) => {
        const month = new Date(value.start_timestamp * 1000).getMonth()
        const year = new Date(value.start_timestamp * 1000).getFullYear()
        // Check for role and approvelevel
        const checkRole =
            (hasAnyRole(user, ['bdm']) && value.approve_level == 3) ||
            (hasAnyRole(user, ['vaktsjef']) && value.approve_level == 1) ||
            (hasAnyRole(user, ['leveranseleder']) && value.approve_level == 1)
        const isExternal = value.user.ekstern == false
        // Ignore approved periods in the future
        const futurePeriodsMonth = month <= selectedMonth!.getMonth()
        const futurePeriodsYear = year <= selectedMonth!.getFullYear()

        // Determine if the date filtering should be applied.
        const isDateMatching = checkRole || (month === selectedMonth!.getMonth() && year === selectedMonth!.getFullYear())

        // Apply other filtering conditions.
        const isNameMatching = value.user.name.toLowerCase().includes(searchFilter)
        const isRoleMatching = value.user.role.toLowerCase().includes(searchFilterRole.toLowerCase())
        const isGroupMatch = value.group.name.endsWith(searchFilterGroup)
        const isApproveLevelMatching = searchFilterAction === 9 ? true : value.approve_level === searchFilterAction

        // Combine all conditions for filtering.
        return (
            isDateMatching &&
            isNameMatching &&
            isRoleMatching &&
            isGroupMatch &&
            isApproveLevelMatching &&
            isExternal &&
            futurePeriodsMonth &&
            futurePeriodsYear
        )
    })

    let filteredListeAvVakter = mapVakter(listeAvVakter)

    return (
        <>
            <ErrorModal errorMessage={errorMessage} onClose={() => setErrorMessage(null)} />

            <div className="min-h-96" style={{ display: 'flex' }}>
                <MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <MonthPicker.Input {...inputProps} label="Velg måned" />
                    </div>
                </MonthPicker>
                <form style={{ width: '300px', marginLeft: '30px' }}>
                    <Search label="Søk etter person" hideLabel={false} variant="simple" onChange={(text) => setSearchFilter(text)} />
                </form>
                <div style={{ width: '200px', marginLeft: '30px' }}>
                    <Select label="Velg Gruppe" onChange={(e) => setSearchFilterGroup(e.target.value)}>
                        <option value="">Alle</option>
                        {groupNames.map((groupName) => (
                            <option key={groupName} value={groupName}>
                                {groupName}
                            </option>
                        ))}
                    </Select>
                </div>
                <div style={{ width: '200px', marginLeft: '30px' }}>
                    <Select label="Velg rolle" onChange={(e) => setSearchFilterRole(e.target.value)}>
                        <option value="">Alle</option>
                        <option value="vakthaver">Vakthaver</option>
                        <option value="vaktsjef">Vaktsjef</option>
                    </Select>
                </div>
                <div style={{ width: '200px', marginLeft: '30px' }}>
                    <Select label="Velg status" onChange={(e) => setSearchFilterAction(Number(e.target.value))}>
                        <option value={9}>Alle</option>
                        <option value={0}>Trenger godkjenning</option>
                        <option value={1}>Godkjent av ansatt</option>
                        <option value={2}>Venter på utregning</option>
                        <option value={3}>Godkjent av vaktsjef</option>
                        <option value={4}>Godkjent av BDM</option>
                        <option value={5}>Overført til lønn</option>
                        <option value={6}>Venter på utregning av diff</option>
                        <option value={7}>Utregning fullført med diff</option>
                        <option value={8}>Overført til lønn etter rekjøring</option>
                    </Select>
                </div>
                <div style={{ display: 'grid', alignContent: 'flex-end' }}>
                    <Button
                        style={{ width: '200px', marginLeft: '30px', height: '50px' }}
                        disabled={!(searchFilterAction === 3 || searchFilterAction === 1) || listeAvVakter.length === 0}
                        onClick={() =>
                            confirm_schedules_bulk(
                                listeAvVakter.map((vakt) => vakt.id),
                                setResponse
                            )
                        }
                    >
                        Approve All
                    </Button>
                </div>
                <div style={{ marginLeft: '15px', marginBottom: '5px', display: 'grid', alignContent: 'flex-end' }}>
                    {' '}
                    <HelpText strategy="fixed" title="Bakvakt?">
                        <div>
                            <b>Approve All</b>
                            <br />
                            Denne knappen vil godkjenne samtlige vakter i lista under. Du kan bruke filterfunksjonaliteten (til venstre) for å
                            redusere antall vakter du godkjenner i bulk. <br />
                            <br />
                            Vakter i forskjellig status kan ikke godkjennes samtidig, derfor <b>må</b> <i>status</i> velges i nedtrekksmenyen til
                            venstre
                        </div>
                    </HelpText>
                </div>
            </div>

            <Table
                style={{
                    minWidth: '900px',
                    backgroundColor: 'white',
                    marginBottom: '3vh',
                    marginTop: '2vh',
                }}
            >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>#</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Type vakt</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell scope="col">
                            <div
                                style={{
                                    display: 'flex',
                                    alignContent: 'space-around',
                                    gap: '10px',
                                }}
                            >
                                <div>Endringer</div>
                                <HelpText strategy="fixed" title="Bakvakt?">
                                    <b>Bistand</b>
                                    <br />
                                    <b>Hvem får betalt:</b> Både opprinnelig vakthaver og den personen som legges til som bistand får betalt.
                                    <br />
                                    <b>Hvem vises i vaktplanen:</b> Den som bistår vises i vaktplanen for angitte periode
                                    <hr />
                                    <b>Bytte</b>
                                    <br />
                                    <b>Hvem får betalt:</b> Kun den personen med aktiv vakt får betalt.
                                    <br />
                                    <b>Hvem vises i vaktplanen:</b> Kun den personen med aktiv vakt vises i vaktplanen. Endringen vil legge seg oppå
                                    opprinnelig vakt for angitte periode
                                </HelpText>
                            </div>
                        </Table.HeaderCell>
                        <Table.HeaderCell scope="col">Actions</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                        {hasAnyRole(user, ['leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) ? (
                            <Table.HeaderCell scope="col">Kostnad</Table.HeaderCell>
                        ) : null}

                        <Table.HeaderCell scope="col">Audit</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {filteredListeAvVakter.length === 0 ? (
                        <h3 style={{ margin: 'auto', color: 'red' }}>{loading ? <Loader /> : 'Ingen treff!'}</h3>
                    ) : (
                        filteredListeAvVakter
                    )}
                </Table.Body>
            </Table>
        </>
    )
}

export default AdminLeder
