import {
    Button,
    Table,
    Loader,
    MonthPicker,
    useMonthpicker,
    Search,
    Select,
    HelpText,
    Timeline,
    TimelinePeriodProps,
    ExpansionCard,
} from '@navikt/ds-react'
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
import { hasAnyRole } from '../utils/roles'

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
    const [searchFilterRole, setSearchFilterRole] = useState('')
    const [searchFilterAction, setSearchFilterAction] = useState(9)
    const [searchFilterGroup, setSearchFilterGroup] = useState('')

    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

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

    const DoubleOverlapTimeline = ({ schedules }: { schedules: Schedules[] }) => {
        const sorted = [...schedules].sort((a, b) => {
            if (a.start_timestamp !== b.start_timestamp) return a.start_timestamp - b.start_timestamp
            const durDiff = b.end_timestamp - b.start_timestamp - (a.end_timestamp - a.start_timestamp)
            if (durDiff !== 0) return durDiff
            const aHasCost = a.cost.length > 0 && Number(a.cost[a.cost.length - 1].total_cost) > 0
            return aHasCost ? -1 : 1
        })

        const clusterMin = Math.min(...sorted.map((s) => s.start_timestamp))
        const clusterMax = Math.max(...sorted.map((s) => s.end_timestamp))
        const duration = clusterMax - clusterMin || 1

        const pct = (ts: number) => `${((ts - clusterMin) / duration) * 100}%`
        const wPct = (s: number, e: number) => `${Math.max(((e - s) / duration) * 100, 0.3)}%`
        const fmt = (ts: number) =>
            new Date(ts * 1000)
                .toLocaleString('no-NB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                .replace(',', '')
        const fmtH = (sec: number) => {
            const h = sec / 3600
            return Number.isInteger(h) ? `${h}t` : `${Math.floor(h)}t ${Math.round((h % 1) * 60)}m`
        }

        const primary = sorted[0]

        return (
            <div style={{ marginTop: '12px', marginBottom: '4px', minWidth: '600px', paddingBottom: '4px' }}>
                {sorted.map((s, i) => {
                    const isPrimary = i === 0
                    const overlapEnd = isPrimary ? s.end_timestamp : Math.min(primary.end_timestamp, s.end_timestamp)
                    const overlapStart = isPrimary ? s.start_timestamp : Math.max(primary.start_timestamp, s.start_timestamp)
                    const compStart = isPrimary ? s.start_timestamp : overlapEnd
                    const compEnd = s.end_timestamp
                    const hasComp = compEnd > compStart
                    const compHours = fmtH(Math.max(0, compEnd - compStart))
                    const totalHours = fmtH(s.end_timestamp - s.start_timestamp)
                    const barColor = isPrimary ? (isDarkMode ? '#2d7a4f' : '#287d44') : isDarkMode ? '#2d5f7a' : '#1a6b8a'

                    return (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '14px', gap: '10px' }}>
                            <div style={{ width: '130px', flexShrink: 0 }}>
                                <div
                                    style={{
                                        fontSize: '0.8em',
                                        fontWeight: 700,
                                        color: isDarkMode ? '#e0e0e0' : '#222',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {s.user.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: '0.75em',
                                        fontWeight: 700,
                                        color: isPrimary ? (isDarkMode ? '#7ecf9a' : '#1a5c2e') : isDarkMode ? '#66cbec' : '#1a6b8a',
                                        marginTop: '1px',
                                    }}
                                >
                                    {isPrimary ? 'Primær' : 'Sekundær'}
                                </div>
                                <div style={{ fontSize: '0.72em', fontWeight: 600, color: isDarkMode ? '#b0b0b0' : '#444', marginTop: '1px' }}>
                                    {isPrimary ? `${totalHours} kompensert` : hasComp ? `${compHours} kompensert` : 'ingen kompensasjon'}
                                </div>
                            </div>
                            <div style={{ flex: 1, position: 'relative', height: '18px' }}>
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        height: '2px',
                                        backgroundColor: isDarkMode ? '#333' : '#e0e0e0',
                                        borderRadius: '2px',
                                    }}
                                />
                                <div
                                    title={`Gå til ${s.user.name} — ${s.group.name}`}
                                    onClick={() => {
                                        const el = document.getElementById(`schedule-${s.id}`)
                                        if (el) {
                                            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                            el.style.outline = `2px solid ${barColor}`
                                            setTimeout(() => {
                                                el.style.outline = ''
                                            }, 2000)
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: pct(s.start_timestamp),
                                        width: wPct(s.start_timestamp, s.end_timestamp),
                                        height: '100%',
                                        backgroundColor: isDarkMode ? '#2a2a2a' : '#efefef',
                                        border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                                        borderRadius: '3px',
                                        boxSizing: 'border-box' as const,
                                        cursor: 'pointer',
                                    }}
                                />
                                {!isPrimary && overlapEnd > overlapStart && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: pct(overlapStart),
                                            width: wPct(overlapStart, overlapEnd),
                                            height: '100%',
                                            backgroundColor: isDarkMode ? '#5a1e1e' : '#f5c6cb',
                                            borderRadius: '3px 0 0 3px',
                                            boxSizing: 'border-box' as const,
                                            pointerEvents: 'none',
                                        }}
                                    />
                                )}
                                {hasComp && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: pct(compStart),
                                            width: wPct(compStart, compEnd),
                                            height: '100%',
                                            backgroundColor: barColor,
                                            borderRadius: isPrimary ? '3px' : '0 3px 3px 0',
                                            boxSizing: 'border-box' as const,
                                            pointerEvents: 'none',
                                        }}
                                    />
                                )}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: pct(s.start_timestamp),
                                        top: '100%',
                                        marginTop: '2px',
                                        fontSize: '0.65em',
                                        color: isDarkMode ? '#777' : '#888',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {fmt(s.start_timestamp)}
                                </div>
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: pct(s.end_timestamp),
                                        top: '100%',
                                        marginTop: '2px',
                                        fontSize: '0.65em',
                                        color: isDarkMode ? '#777' : '#888',
                                        whiteSpace: 'nowrap',
                                        transform: 'translateX(-100%)',
                                    }}
                                >
                                    {fmt(s.end_timestamp)}
                                </div>
                            </div>
                        </div>
                    )
                })}
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
        // Build a map: scheduleId → overlapping double partners (same user, different group)
        const doublePartners = new Map<string, Schedules[]>()
        const doubles = vaktliste.filter((s) => s.is_double)
        const byUser: Record<string, Schedules[]> = {}
        for (const s of doubles) {
            if (!byUser[s.user_id]) byUser[s.user_id] = []
            byUser[s.user_id].push(s)
        }
        for (const userShifts of Object.values(byUser)) {
            const sorted = [...userShifts].sort((a, b) => a.start_timestamp - b.start_timestamp)
            const clusters: { schedules: Schedules[]; maxEnd: number }[] = []
            for (const s of sorted) {
                let merged = false
                for (const cluster of clusters) {
                    if (s.start_timestamp < cluster.maxEnd) {
                        cluster.schedules.push(s)
                        cluster.maxEnd = Math.max(cluster.maxEnd, s.end_timestamp)
                        merged = true
                        break
                    }
                }
                if (!merged) clusters.push({ schedules: [s], maxEnd: s.end_timestamp })
            }
            for (const cluster of clusters) {
                if (cluster.schedules.length > 1) {
                    for (const s of cluster.schedules) {
                        doublePartners.set(s.id, cluster.schedules)
                    }
                }
            }
        }

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
                    <Table.Row key={`row-${vakter.id}-${i}`} id={`schedule-${vakter.id}`}>
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
                            {(() => {
                                const overlapping = (doublePartners.get(vakter.id) ?? []).filter((o) => o.id !== vakter.id)
                                const hasEndringer = vakter.vakter.length > 0
                                const hasOverlap = overlapping.length > 0

                                if (!hasEndringer && !hasOverlap) {
                                    return <span style={{ fontSize: '0.85em', color: getTextColor('subtle') }}>Ingen endringer</span>
                                }

                                return (
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
                                                        marginBottom: '8px',
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
                                        {hasOverlap && (
                                            <div>
                                                {hasEndringer && (
                                                    <div style={{ borderTop: isDarkMode ? '1px solid #555' : '1px solid #ccc', margin: '6px 0' }} />
                                                )}
                                                <div
                                                    style={{
                                                        fontSize: '0.75em',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.04em',
                                                        color: isDarkMode ? '#f08080' : '#b00',
                                                        marginBottom: '6px',
                                                    }}
                                                >
                                                    Dobbeltvakt
                                                </div>
                                                {overlapping.map((other, idx) => {
                                                    const overlapStart = Math.max(vakter.start_timestamp, other.start_timestamp)
                                                    const overlapEnd = Math.min(vakter.end_timestamp, other.end_timestamp)
                                                    const fmtDate = (ts: number) =>
                                                        new Date(ts * 1000)
                                                            .toLocaleString('no-NB', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })
                                                            .replace(',', '')
                                                    const totalHours = (vakter.end_timestamp - vakter.start_timestamp) / 3600
                                                    const overlapHours = (overlapEnd - overlapStart) / 3600
                                                    const uniqueHours = totalHours - overlapHours
                                                    const fmtH = (h: number) =>
                                                        Number.isInteger(h) ? `${h}t` : `${Math.floor(h)}t ${Math.round((h % 1) * 60)}m`
                                                    const startsFirst = vakter.start_timestamp < other.start_timestamp
                                                    const startsEqual = vakter.start_timestamp === other.start_timestamp
                                                    const isLonger =
                                                        vakter.end_timestamp - vakter.start_timestamp >= other.end_timestamp - other.start_timestamp
                                                    const isIdentical = startsEqual && vakter.end_timestamp === other.end_timestamp
                                                    const vakterHasCost =
                                                        vakter.cost.length > 0 && Number(vakter.cost[vakter.cost.length - 1].total_cost) > 0
                                                    const isPrimary = isIdentical ? vakterHasCost : startsFirst || (startsEqual && isLonger)
                                                    return (
                                                        <div
                                                            key={idx}
                                                            style={{
                                                                marginBottom: idx < overlapping.length - 1 ? '8px' : '0',
                                                                padding: '6px 8px',
                                                                borderRadius: '4px',
                                                                border: `1px solid ${isDarkMode ? '#6b3a35' : '#f5c6cb'}`,
                                                                backgroundColor: isDarkMode ? '#3a1e1e' : '#fff5f5',
                                                                fontSize: '0.8em',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    color: getTextColor('subtle'),
                                                                    marginBottom: '4px',
                                                                    cursor: 'pointer',
                                                                    border: `1px solid ${isDarkMode ? '#444' : '#ddd'}`,
                                                                    borderRadius: '3px',
                                                                    padding: '1px 5px',
                                                                    fontFamily: 'monospace',
                                                                    fontSize: '0.85em',
                                                                }}
                                                                title="Klikk for å kopiere ID"
                                                                onClick={() => navigator.clipboard.writeText(other.id)}
                                                            >
                                                                {other.id.slice(0, 8)}…
                                                            </div>
                                                            <div style={{ color: getTextColor('secondary'), marginBottom: '6px' }}>
                                                                <b>{other.group.name}</b>
                                                            </div>
                                                            {isPrimary ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                    <div
                                                                        style={{
                                                                            color: isDarkMode ? '#7ecf9a' : '#1a5c2e',
                                                                            fontWeight: 600,
                                                                            marginBottom: '2px',
                                                                        }}
                                                                    >
                                                                        Starter først — dekker overlappet
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span style={{ color: getTextColor('subtle') }}>Kompensert</span>
                                                                        <span style={{ fontWeight: 700 }}>{fmtH(totalHours)} (100%)</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                    <div
                                                                        style={{
                                                                            color: isDarkMode ? '#f08080' : '#b00',
                                                                            fontWeight: 600,
                                                                            marginBottom: '2px',
                                                                        }}
                                                                    >
                                                                        Andre vakt starter først — dekker overlappet
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                                                                        <span style={{ color: getTextColor('subtle') }}>Overlapp (ingen komp.)</span>
                                                                        <span style={{ color: isDarkMode ? '#f08080' : '#b00', fontWeight: 600 }}>
                                                                            {fmtH(overlapHours)}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                                                                        <span style={{ color: getTextColor('subtle') }}>Unik del (komp.)</span>
                                                                        <span style={{ fontWeight: 600, color: isDarkMode ? '#7ecf9a' : '#1a5c2e' }}>
                                                                            {fmtH(uniqueHours)}
                                                                        </span>
                                                                    </div>
                                                                    <div
                                                                        style={{
                                                                            borderTop: `1px solid ${isDarkMode ? '#555' : '#ddd'}`,
                                                                            paddingTop: '3px',
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            gap: '6px',
                                                                        }}
                                                                    >
                                                                        <span style={{ color: getTextColor('subtle') }}>Effektiv kompensasjon</span>
                                                                        <span style={{ fontWeight: 700 }}>{fmtH(uniqueHours)}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div
                                                                style={{
                                                                    marginTop: '6px',
                                                                    paddingTop: '5px',
                                                                    borderTop: `1px solid ${isDarkMode ? '#555' : '#eee'}`,
                                                                    color: isDarkMode ? '#7ecf9a' : '#1a5c2e',
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        fontSize: '0.75em',
                                                                        fontWeight: 700,
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.04em',
                                                                        marginBottom: '2px',
                                                                    }}
                                                                >
                                                                    Effektiv vakt
                                                                </div>
                                                                {isPrimary
                                                                    ? `${fmtDate(vakter.start_timestamp)} – ${fmtDate(vakter.end_timestamp)}`
                                                                    : `${fmtDate(overlapEnd)} – ${fmtDate(vakter.end_timestamp)}`}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}
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

    const doubleClustersByUser = (() => {
        const doubles = listeAvVakter.filter((s) => s.is_double)
        if (doubles.length === 0) return []
        // Group by user id first, then cluster overlapping shifts per user
        const byUser: Record<string, Schedules[]> = {}
        for (const s of doubles) {
            if (!byUser[s.user_id]) byUser[s.user_id] = []
            byUser[s.user_id].push(s)
        }
        const allClusters: Schedules[][] = []
        for (const userSchedules of Object.values(byUser)) {
            const sorted = [...userSchedules].sort((a, b) => a.start_timestamp - b.start_timestamp)
            const clusters: { schedules: Schedules[]; maxEnd: number }[] = []
            for (const s of sorted) {
                let merged = false
                for (const cluster of clusters) {
                    if (s.start_timestamp < cluster.maxEnd) {
                        cluster.schedules.push(s)
                        cluster.maxEnd = Math.max(cluster.maxEnd, s.end_timestamp)
                        merged = true
                        break
                    }
                }
                if (!merged) clusters.push({ schedules: [s], maxEnd: s.end_timestamp })
            }
            for (const cluster of clusters) {
                if (cluster.schedules.length > 1) allClusters.push(cluster.schedules)
            }
        }
        return allClusters
    })()

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
            </div>

            {doubleClustersByUser.length > 0 && (
                <ExpansionCard
                    aria-label="dobbeltvakter"
                    size="small"
                    style={
                        {
                            marginBottom: '16px',
                            width: '100%',
                            ...(mounted && isDarkMode
                                ? {
                                      /* @ts-ignore */
                                      '--ac-expansioncard-bg': '#1a1a1a',
                                      '--ac-expansioncard-border-color': '#444',
                                  }
                                : {}),
                        } as React.CSSProperties
                    }
                >
                    <ExpansionCard.Header>
                        <ExpansionCard.Title size="small">Dobbeltvakter ({doubleClustersByUser.length})</ExpansionCard.Title>
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                        {doubleClustersByUser.map((cluster, i) => (
                            <div
                                key={i}
                                style={{
                                    marginBottom: i < doubleClustersByUser.length - 1 ? '16px' : 0,
                                    paddingBottom: i < doubleClustersByUser.length - 1 ? '16px' : 0,
                                    borderBottom: i < doubleClustersByUser.length - 1 ? `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}` : 'none',
                                }}
                            >
                                <div style={{ fontSize: '0.8em', color: isDarkMode ? '#888' : '#777', marginBottom: '4px' }}>
                                    {cluster[0].user.name} — {cluster.map((s) => s.group.name).join(' & ')}
                                </div>
                                <DoubleOverlapTimeline schedules={cluster} />
                            </div>
                        ))}
                    </ExpansionCard.Content>
                </ExpansionCard>
            )}

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
