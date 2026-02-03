import { Button, Table, Loader, MonthPicker, useMonthpicker, Search, Select, HelpText, Timeline, TimelinePeriodProps } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState, Dispatch, SetStateAction } from 'react'
import { useAuth } from '../context/AuthContext'
import { Schedules, User } from '../types/types'
import ApproveButton from './utils/ApproveButton'

import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import ErrorModal from './utils/ErrorModal'
import MapApproveStatus from './utils/MapApproveStatus'
import { Buildings3Icon, FirstAidKitIcon, RecycleIcon, WaitingRoomIcon } from '@navikt/aksel-icons'
import NextDeadlineBox from './NextDeadline'

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
        toDate: new Date('Aug 23 2027'),
        defaultSelected:
            new Date().getDate() <= 10
                ? new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
                : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    })

    const TimeLine = ({ schedules }: { schedules: Schedules[] }) => {
        const vakter: TimelinePeriodProps[] = schedules
            .filter((s) => s.type === 'ordinær vakt') // Vakter av type 'ordinær vakt'
            .map((schedule) => ({
                start: new Date(Number(schedule.start_timestamp) * 1000),
                end: new Date(Number(schedule.end_timestamp) * 1000),
                status: 'success',
                icon: <WaitingRoomIcon aria-hidden />,
                statusLabel: 'Vakt',
                children: (
                    <div>
                        <b> {schedule.user.name}</b>
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
            .filter((s) => s.type === 'bistand') // Vakter av type 'bistand'
            .map((change) => ({
                start: new Date(change.start_timestamp * 1000),
                end: new Date(change.end_timestamp * 1000),
                status: 'info',
                icon: <FirstAidKitIcon aria-hidden />,
                statusLabel: 'Bistand',
                children: (
                    <div>
                        <b>{change.user.name}</b> <br />
                        Slutt:{' '}
                        {new Date(change.start_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        <br />
                        Start:{' '}
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
            .filter((s) => s.type === 'bytte') // Vakter av type 'bytte'
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

    const getStatusColor = (approveLevel: number) => {
        switch (approveLevel) {
            case 1:
                return '#66CBEC'
            case 2:
                return '#99DEAD'
            case 3:
                return '#99DEAD'
            case 4:
                return '#E18071'
            case 5:
                return '#E18071'
            case 6:
                return '#99DEAD'
            case 7:
                return '#99DEAD'
            case 8:
                return '#E18071'
            default:
                return '#FFFFFF'
        }
    }

    const mapVakter = (vaktliste: Schedules[]) => {
        // Use a record type to map the koststed to the corresponding array of Schedules
        const groupedByGroupName: Record<string, Schedules[]> = vaktliste.reduce(
            (acc: Record<string, Schedules[]>, current) => {
                const groupName = current.group.name || 'group name not set'
                if (!acc[groupName]) {
                    acc[groupName] = []
                }
                acc[groupName].push(current)
                return acc
            },
            {} as Record<string, Schedules[]>
        )

        // Sort each group by start_timestamp
        Object.keys(groupedByGroupName).forEach((groupNameKey) => {
            groupedByGroupName[groupNameKey].sort((a, b) => a.start_timestamp - b.start_timestamp)
        })

        // Convert the grouped and sorted schedules into an array of JSX elements
        let rowCount = 0
        const groupedRows = Object.entries(groupedByGroupName).flatMap(([koststed, schedules], index) => [
            // This is the row for the group header

            // TODO: Make a timeline visualization of the schedule
            <Table.Row key={`header-${koststed}`}>
                <Table.DataCell colSpan={9}>
                    <b>{koststed}</b>
                    <TimeLine schedules={schedules} />
                </Table.DataCell>
            </Table.Row>,
            // These are the individual rows for the schedules
            ...schedules.map((vakter, i) => {
                rowCount++
                const vaktType = vakter.type === 'bakvakt' ? 'bistand' : vakter.type
                const isSpecialType = vaktType === 'bistand' || vaktType === 'bytte'
                const backgroundColor = vaktType === 'bistand' ? '#e6f4f9' : vaktType === 'bytte' ? '#fff4cc' : 'transparent'
                const icon =
                    vaktType === 'bistand' ? (
                        <FirstAidKitIcon aria-hidden style={{ marginRight: '8px' }} />
                    ) : vaktType === 'bytte' ? (
                        <RecycleIcon aria-hidden style={{ marginRight: '8px' }} />
                    ) : null

                return (
                    <Table.Row key={`row-${vakter.id}-${i}`}>
                        <Table.DataCell>{rowCount}</Table.DataCell>
                        <Table.DataCell scope="row" style={{ padding: '12px', backgroundColor }}>
                            <div style={{ lineHeight: '1.5' }}>
                                <div style={{ fontSize: '1em', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                                    {icon}
                                    {vakter.user.name}
                                </div>
                                <div style={{ fontSize: '0.85em', color: '#666' }}>{vakter.user.id.toUpperCase()}</div>
                                <div style={{ fontSize: '0.85em', color: '#666' }}>{vakter.group.name}</div>
                                <div style={{ fontSize: '0.85em', color: '#888', marginTop: '4px', fontStyle: 'italic' }}>{vaktType}</div>
                            </div>
                        </Table.DataCell>
                        <Table.DataCell style={{ minWidth: '200px', padding: '12px', backgroundColor: getStatusColor(vakter.approve_level) }}>
                            <div style={{ lineHeight: '1.6' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <MapApproveStatus status={vakter.approve_level} error={vakter.error_messages} />
                                </div>
                                <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px' }}>
                                    <b>ID:</b> {vakter.id}
                                </div>
                                <div style={{ fontSize: '0.85em', marginBottom: '4px' }}>
                                    <b>Uke:</b> {moment(vakter.start_timestamp * 1000).week()}
                                    {moment(vakter.start_timestamp * 1000).week() < moment(vakter.end_timestamp * 1000).week()
                                        ? ' - ' + moment(vakter.end_timestamp * 1000).week()
                                        : ''}
                                </div>
                                <div style={{ fontSize: '0.85em' }}>
                                    <b>Start:</b>{' '}
                                    {new Date(vakter.start_timestamp * 1000).toLocaleString('no-NB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                                <div style={{ fontSize: '0.85em', marginTop: '4px' }}>
                                    <b>Slutt:</b>{' '}
                                    {new Date(vakter.end_timestamp * 1000).toLocaleString('no-NB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            </div>
                        </Table.DataCell>
                        <Table.DataCell style={{ minWidth: '180px', padding: '12px' }}>
                            {vakter.vakter.length > 0 ? (
                                <div style={{ lineHeight: '1.5' }}>
                                    {vakter.vakter.map((endringer, idx: number) => {
                                        const endringBgColor =
                                            vaktType === 'ordinær vakt'
                                                ? endringer.type === 'bistand' || endringer.type === 'bakvakt'
                                                    ? '#e6f4f9'
                                                    : endringer.type === 'bytte'
                                                      ? '#fff4cc'
                                                      : 'transparent'
                                                : 'transparent'
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    marginBottom: idx < vakter.vakter.length - 1 ? '12px' : '0',
                                                    paddingBottom: idx < vakter.vakter.length - 1 ? '12px' : '0',
                                                    borderBottom: idx < vakter.vakter.length - 1 ? '1px solid #e0e0e0' : 'none',
                                                    backgroundColor: endringBgColor,
                                                    padding: endringBgColor !== 'transparent' ? '8px' : '0',
                                                    borderRadius: endringBgColor !== 'transparent' ? '4px' : '0',
                                                }}
                                            >
                                                <div style={{ fontSize: '0.9em', fontWeight: 'bold', marginBottom: '2px' }}>{endringer.type}</div>
                                                <div style={{ fontSize: '0.85em', marginBottom: '4px' }}>{endringer.user.name}</div>
                                                <div style={{ fontSize: '0.8em', color: '#666' }}>
                                                    {new Date(endringer.start_timestamp * 1000).toLocaleString('no-NB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                                <div style={{ fontSize: '0.8em', color: '#666' }}>
                                                    {new Date(endringer.end_timestamp * 1000).toLocaleString('no-NB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <span style={{ fontSize: '0.85em', color: '#999' }}>Ingen endringer</span>
                            )}
                        </Table.DataCell>
                        <Table.DataCell style={{ minWidth: '140px', padding: '8px' }}>
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
                                                height: '36px',
                                                width: '100%',
                                                marginBottom: '5px',
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
                        <Table.DataCell style={{ padding: '8px', minWidth: '220px' }}>
                            {hasAnyRole(user, ['leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && vakter.cost.length !== 0 ? (
                                <div
                                    style={{
                                        padding: '8px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '4px',
                                        border: '1px solid #e0e0e0',
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.85em' }}>Kostnad:</div>
                                    <MapCost vakt={vakter}></MapCost>
                                </div>
                            ) : (
                                <span style={{ fontSize: '0.85em', color: '#999' }}>Ingen beregning foreligger</span>
                            )}
                        </Table.DataCell>
                        <Table.DataCell style={{ padding: '8px' }}>
                            <div
                                style={{
                                    padding: '8px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    border: '1px solid #e0e0e0',
                                }}
                            >
                                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.85em' }}>Audit:</div>
                                {vakter.audits.length !== 0 ? (
                                    <MapAudit audits={vakter.audits} />
                                ) : (
                                    <span style={{ fontSize: '0.8em', color: '#999' }}>Ingen hendelser</span>
                                )}
                            </div>
                        </Table.DataCell>
                    </Table.Row>
                )
            }),
        ])
        return groupedRows
    }

    useEffect(() => {
        setLoading(true)
        const path = `/api/leader_schedules?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`

        Promise.all([fetch(path).then((res) => res.json())])
            .then(([itemData]) => {
                itemData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)
                setItemData(itemData)

                const distinctGroupNames: string[] = Array.from(new Set(itemData.map((data: { group: { name: string } }) => data.group.name)))
                const sortedGroupNames = distinctGroupNames.sort((a, b) => a.localeCompare(b))
                setGroupNames(sortedGroupNames)

                setLoading(false)
            })
            .catch(() => setLoading(false))
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
        const isRoleMatching =
            searchFilterRole === ''
                ? true
                : (value.user.roles?.some((role) => role.title.toLowerCase().includes(searchFilterRole.toLowerCase())) ?? false)
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

            <div className="min-h-96" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                <MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <MonthPicker.Input {...inputProps} label="Velg måned" />
                    </div>
                </MonthPicker>
                <form style={{ width: '300px', minWidth: '250px', flex: '1 1 auto' }}>
                    <Search label="Søk etter person" hideLabel={false} variant="simple" onChange={(text) => setSearchFilter(text)} />
                </form>
                <div style={{ width: '200px', minWidth: '180px', flex: '0 1 auto' }}>
                    <Select label="Velg Gruppe" onChange={(e) => setSearchFilterGroup(e.target.value)}>
                        <option value="">Alle</option>
                        {groupNames.map((groupName) => (
                            <option key={groupName} value={groupName}>
                                {groupName}
                            </option>
                        ))}
                    </Select>
                </div>
                <div style={{ width: '200px', minWidth: '180px', flex: '0 1 auto' }}>
                    <Select
                        label={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>Velg rolle</span>
                                <HelpText strategy="fixed" title="Om rollefilter">
                                    <div>
                                        <b>Velg rolle</b>
                                        <br />
                                        Her kan du velge for eksempel <i>Vaktsjef</i> for kun å vise vakter fra de som har denne rollen. Dette er
                                        nyttig for leveranseledere.
                                    </div>
                                </HelpText>
                            </div>
                        }
                        onChange={(e) => setSearchFilterRole(e.target.value)}
                    >
                        <option value="">Alle</option>
                        <option value="vakthaver">Vakthaver</option>
                        <option value="vaktsjef">Vaktsjef</option>
                    </Select>
                </div>
                <div style={{ width: '200px', minWidth: '180px', flex: '0 1 auto' }}>
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

                <div style={{ display: 'grid', alignItems: 'start', width: '200px', minWidth: '180px', flex: '0 1 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold' }}>Godkjenn alle</span>
                        <HelpText strategy="fixed" title="Bakvakt?">
                            <div>
                                <b>Approve All</b>
                                <br />
                                Denne knappen vil godkjenne samtlige vakter i lista under. Du kan bruke filterfunksjonaliteten (til venstre) for å
                                redusere antall vakter du godkjenner i bulk. <br />
                                <br />
                                Vakter i forskjellig status kan ikke godkjennes samtidig, derfor <b>må</b> <i>status</i> velges i nedtrekksmenyen til
                                venstre.
                            </div>
                        </HelpText>
                    </div>
                    <Button
                        style={{ width: '100%', height: '50px' }}
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

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 1 auto' }}>
                    <NextDeadlineBox />
                </div>
            </div>

            <Table
                style={{
                    width: '100%',
                    backgroundColor: 'white',
                    marginBottom: '3vh',
                    marginTop: '2vh',
                }}
            >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>#</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Endringer</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Actions</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Kostnad</Table.HeaderCell>
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
