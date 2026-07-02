import { Button, Table, Loader, MonthPicker, useMonthpicker, Search, Select, HelpText, Timeline, TimelinePeriodProps } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState, Dispatch, SetStateAction } from 'react'
import { useAuth } from '../context/AuthContext'
import { Schedules } from '../types/types'
import ApproveButton from './utils/ApproveButton'

import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import ErrorModal from './utils/ErrorModal'
import MapApproveStatus from './utils/MapApproveStatus'
import { useTheme } from '../context/ThemeContext'
import { Buildings3Icon, FirstAidKitIcon, RecycleIcon, WaitingRoomIcon } from '@navikt/aksel-icons'
import { hasAnyRole, hasRoleInGroup } from '../utils/roles'

type ActionFilter = 'krever_handling' | 'ikke_utbetalt' | 'alle'

const AdminLeder = ({}) => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'

    const [itemData, setItemData] = useState<Schedules[]>([])
    const [response, setResponse] = useState<ResponseType | undefined>()
    const [loading, setLoading] = useState(false)
    //const [openState, setOpenState] = useState(false)

    const [groupNames, setGroupNames] = useState<string[]>([])

    const [searchFilter, setSearchFilter] = useState('')
    const [actionFilter, setActionFilter] = useState<ActionFilter>('krever_handling')
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
        const lightColors = {
            0: '#FFFFFF',
            1: '#66CBEC',
            2: '#FFB366',
            3: '#99DEAD',
            4: '#E18071',
            5: '#E18071',
            6: '#FFB366',
            7: '#99DEAD',
            8: '#E18071',
            default: '#FFFFFF',
        }

        const darkColors = {
            0: '#333333',
            1: '#2d5f7a',
            2: '#6b4a2a',
            3: '#3d5a47',
            4: '#6b3a35',
            5: '#6b3a35',
            6: '#6b4a2a',
            7: '#3d5a47',
            8: '#6b3a35',
            default: '#333333',
        }

        const colors = isDarkMode ? darkColors : lightColors
        return colors[approveLevel as keyof typeof colors] || colors.default
    }

    const getBistandBytteColor = (vaktType: string) => {
        if (vaktType === 'bistand') {
            return isDarkMode ? '#2d5f7a' : '#e6f4f9'
        }
        if (vaktType === 'bytte') {
            return isDarkMode ? '#8b5e2f' : '#fff4cc'
        }
        return 'transparent'
    }

    const getTextColor = (level: 'primary' | 'secondary' | 'subtle') => {
        if (!isDarkMode) {
            return level === 'primary' ? '#000' : level === 'secondary' ? '#666' : '#999'
        }
        return level === 'primary' ? '#e0e0e0' : level === 'secondary' ? '#b0b0b0' : '#888'
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
        const canViewCost = hasAnyRole(user, ['leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm'])
        const columnCount = canViewCost ? 7 : 6
        const groupedRows = Object.entries(groupedByGroupName).flatMap(([koststed, schedules], index) => [
            // This is the row for the group header

            // TODO: Make a timeline visualization of the schedule
            <Table.Row key={`header-${koststed}`}>
                <Table.DataCell colSpan={columnCount}>
                    <b>{koststed}</b>
                    <TimeLine schedules={schedules} />
                </Table.DataCell>
            </Table.Row>,
            // These are the individual rows for the schedules
            ...schedules.map((vakter, i) => {
                rowCount++
                const vaktType = vakter.type === 'bakvakt' ? 'bistand' : vakter.type
                const isSpecialType = vaktType === 'bistand' || vaktType === 'bytte'
                const backgroundColor = getBistandBytteColor(vaktType)
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
                                <div style={{ fontSize: '0.85em', color: getTextColor('secondary') }}>{vakter.user.id.toUpperCase()}</div>
                                <div style={{ fontSize: '0.85em', color: getTextColor('secondary') }}>{vakter.group.name}</div>
                                <div style={{ fontSize: '0.85em', color: getTextColor('subtle'), marginTop: '4px', fontStyle: 'italic' }}>
                                    {vaktType}
                                </div>
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
                                                ? getBistandBytteColor(endringer.type === 'bakvakt' ? 'bistand' : endringer.type)
                                                : 'transparent'
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    marginBottom: idx < vakter.vakter.length - 1 ? '12px' : '0',
                                                    paddingBottom: idx < vakter.vakter.length - 1 ? '12px' : '0',
                                                    borderBottom:
                                                        idx < vakter.vakter.length - 1 ? `1px solid ${isDarkMode ? '#444' : '#e0e0e0'}` : 'none',
                                                    backgroundColor: endringBgColor,
                                                    padding: endringBgColor !== 'transparent' ? '8px' : '0',
                                                    borderRadius: endringBgColor !== 'transparent' ? '4px' : '0',
                                                }}
                                            >
                                                <div style={{ fontSize: '0.9em', fontWeight: 'bold', marginBottom: '2px' }}>{endringer.type}</div>
                                                <div style={{ fontSize: '0.85em', marginBottom: '4px' }}>{endringer.user.name}</div>
                                                <div style={{ fontSize: '0.8em', color: getTextColor('secondary') }}>
                                                    {new Date(endringer.start_timestamp * 1000).toLocaleString('no-NB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                                <div style={{ fontSize: '0.8em', color: getTextColor('secondary') }}>
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
                                <span style={{ fontSize: '0.85em', color: getTextColor('subtle') }}>Ingen endringer</span>
                            )}
                        </Table.DataCell>
                        <Table.DataCell style={{ minWidth: '110px', padding: '8px' }}>
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
                                                backgroundColor: isDarkMode ? '#6b2c2c' : '#f96c6c',
                                                color: '#ffffff',
                                                height: '36px',
                                                marginBottom: '5px',
                                                width: '150px',
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

                        {hasAnyRole(user, ['leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && (
                            <Table.DataCell style={{ padding: '8px', minWidth: '280px' }}>
                                {vakter.cost.length !== 0 ? (
                                    <div
                                        style={{
                                            padding: '8px',
                                            backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                                            borderRadius: '4px',
                                            border: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0',
                                        }}
                                    >
                                        <MapCost vakt={vakter}></MapCost>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '0.85em', color: getTextColor('subtle') }}>Ingen beregning foreligger</span>
                                )}
                            </Table.DataCell>
                        )}

                        <Table.DataCell style={{ padding: '8px' }}>
                            <div
                                style={{
                                    padding: '8px',
                                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                                    borderRadius: '4px',
                                    border: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0',
                                }}
                            >
                                {vakter.audits.length !== 0 ? (
                                    <MapAudit audits={vakter.audits} />
                                ) : (
                                    <span style={{ fontSize: '0.8em', color: getTextColor('subtle') }}>Ingen hendelser</span>
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

    const isVakthaverVaktsjefForGroup = (schedule: Schedules): boolean => {
        const isVaktsjefInGroup =
            schedule.user.group_roles?.some((groupRole) => groupRole.group_id === schedule.group_id && groupRole.role?.title === 'vaktsjef') ?? false
        const isGlobalVaktsjef = schedule.user.roles?.some((role) => role.title === 'vaktsjef') ?? false
        return isVaktsjefInGroup || isGlobalVaktsjef
    }

    const isActionableForUser = (schedule: Schedules): boolean => {
        const canApproveAsBDM = hasAnyRole(user, ['bdm']) && schedule.approve_level === 3
        const canApproveAsVaktsjef = hasRoleInGroup(user, schedule.group_id, ['vaktsjef']) && schedule.approve_level === 1
        const canApproveAsLeveranseleder =
            hasRoleInGroup(user, schedule.group_id, ['leveranseleder']) && schedule.approve_level === 1 && isVakthaverVaktsjefForGroup(schedule)
        return canApproveAsBDM || canApproveAsVaktsjef || canApproveAsLeveranseleder
    }

    const isNotPaidForUser = (schedule: Schedules): boolean => {
        if (hasAnyRole(user, ['bdm']) && schedule.approve_level <= 3) return true
        if (hasRoleInGroup(user, schedule.group_id, ['vaktsjef']) && schedule.approve_level <= 1) return true
        if (hasRoleInGroup(user, schedule.group_id, ['leveranseleder']) && schedule.approve_level <= 1) return true
        return false
    }

    let listeAvVakter = itemData.filter((value: Schedules) => {
        const month = new Date(value.start_timestamp * 1000).getMonth()
        const year = new Date(value.start_timestamp * 1000).getFullYear()
        const isExternal = value.user.ekstern == false
        // Ignore approved periods in the future
        const futurePeriodsMonth = month <= selectedMonth!.getMonth()
        const futurePeriodsYear = year <= selectedMonth!.getFullYear()

        // Always keep selected month as baseline for all action filters.
        const isDateMatching = month === selectedMonth!.getMonth() && year === selectedMonth!.getFullYear()

        // Apply other filtering conditions.
        const isNameMatching = value.user.name.toLowerCase().includes(searchFilter)
        const isGroupMatch = value.group.name.endsWith(searchFilterGroup)
        const isActionMatching =
            actionFilter === 'alle'
                ? true
                : actionFilter === 'ikke_utbetalt'
                  ? isNotPaidForUser(value)
                  : // krev_handling: kun manuelle handlinger i status 0/1/3
                    value.approve_level <= 3 && isActionableForUser(value)

        // Combine all conditions for filtering.
        return isDateMatching && isNameMatching && isGroupMatch && isActionMatching && isExternal && futurePeriodsMonth && futurePeriodsYear
    })

    let filteredListeAvVakter = mapVakter(listeAvVakter)
    const uniqueApproveLevels = Array.from(new Set(listeAvVakter.map((vakt) => vakt.approve_level)))
    const canBulkApprove = uniqueApproveLevels.length === 1 && (uniqueApproveLevels[0] === 1 || uniqueApproveLevels[0] === 3) && listeAvVakter.length > 0
    const tableColumnCount = hasAnyRole(user, ['leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) ? 7 : 6

    return (
        <>
            <ErrorModal errorMessage={errorMessage} onClose={() => setErrorMessage(null)} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' }}>
                <MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <MonthPicker.Input {...inputProps} label="Velg måned" />
                    </div>
                </MonthPicker>
                <form style={{ width: '200px', minWidth: '200px', flex: '1 1 auto' }}>
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
                <div style={{ width: '240px', minWidth: '220px', flex: '0 1 auto' }}>
                    <Select
                        label={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>Krever handling</span>
                                <HelpText strategy="fixed" title="Om handlingsfilter">
                                    <div>
                                        <b>Krever handling</b>
                                        <br />
                                        <i>Trenger godkjenning</i> viser perioder du kan/må behandle nå.
                                        <br />
                                        <i>Vis åpne perioder</i> viser perioder som ikke er utbetalt ennå innenfor ditt ansvarsområde.
                                    </div>
                                </HelpText>
                            </div>
                        }
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
                    >
                        <option value="krever_handling">Trenger godkjenning</option>
                        <option value="ikke_utbetalt">Vis åpne perioder</option>
                        <option value="alle">Vis alle</option>
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
                                Vakter i forskjellig status kan ikke godkjennes samtidig.
                            </div>
                        </HelpText>
                    </div>
                    <Button
                        style={{ width: '100%', height: '50px' }}
                        disabled={!canBulkApprove}
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
            </div>

            <Table
                style={{
                    width: '100%',
                    backgroundColor: isDarkMode ? '#1a1a1a' : 'white',
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
                        {hasAnyRole(user, ['leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) && (
                            <Table.HeaderCell scope="col">Kostnad</Table.HeaderCell>
                        )}
                        <Table.HeaderCell scope="col">Audit</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {filteredListeAvVakter.length === 0 ? (
                        <Table.Row>
                            <Table.DataCell colSpan={tableColumnCount} style={{ textAlign: 'center', padding: '48px 16px' }}>
                                {loading ? (
                                    <Loader />
                                ) : actionFilter === 'krever_handling' ? (
                                    <div>
                                        <div style={{ fontSize: '4rem', lineHeight: 1, marginBottom: '12px' }} aria-hidden>
                                            ✅
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: isDarkMode ? '#7ddc83' : '#1f7a2e' }}>
                                            All good!
                                        </div>
                                        <div style={{ fontSize: '1.4rem', marginTop: '8px', color: isDarkMode ? '#b8d8b8' : '#2f5f34' }}>
                                            Ingen perioder trenger godkjenning.
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '1.2rem', color: isDarkMode ? '#b0b0b0' : '#666' }}>Ingen treff!</div>
                                )}
                            </Table.DataCell>
                        </Table.Row>
                    ) : (
                        filteredListeAvVakter
                    )}
                </Table.Body>
            </Table>
        </>
    )
}

export default AdminLeder
