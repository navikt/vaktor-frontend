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

    const DoubleOverlapTimeline = ({ schedules }: { schedules: Schedules[] }) => {
        type Entry = { id: string; start_timestamp: number; end_timestamp: number; hasCost: boolean }

        const unionIntervals = (intervals: Array<[number, number]>): Array<[number, number]> => {
            if (intervals.length === 0) return []
            const s = [...intervals].sort((a, b) => a[0] - b[0])
            const res: Array<[number, number]> = [[s[0][0], s[0][1]]]
            for (let i = 1; i < s.length; i++) {
                const last = res[res.length - 1]
                if (s[i][0] <= last[1]) last[1] = Math.max(last[1], s[i][1])
                else res.push([s[i][0], s[i][1]])
            }
            return res
        }

        const subtractIntervals = (range: [number, number], blocked: Array<[number, number]>): Array<[number, number]> => {
            let rem: Array<[number, number]> = [[range[0], range[1]]]
            for (const [bs, be] of blocked) {
                const next: Array<[number, number]> = []
                for (const [rs, re] of rem) {
                    if (be <= rs || bs >= re) next.push([rs, re])
                    else {
                        if (rs < bs) next.push([rs, bs])
                        if (be < re) next.push([be, re])
                    }
                }
                rem = next
            }
            return rem
        }

        const seenIds = new Set(schedules.map((s) => s.id))
        const fromSchedules: Entry[] = schedules.map((s) => ({
            id: s.id,
            start_timestamp: s.start_timestamp,
            end_timestamp: s.end_timestamp,
            hasCost: s.cost.length > 0 && Number(s.cost[s.cost.length - 1].total_cost) > 0,
        }))
        const extraById = new Map<string, Entry>()
        for (const s of schedules) {
            for (const o of s.overlapping_schedules ?? []) {
                if (!seenIds.has(o.id) && !extraById.has(o.id)) {
                    extraById.set(o.id, { id: o.id, start_timestamp: o.start_timestamp, end_timestamp: o.end_timestamp, hasCost: false })
                }
            }
        }

        const all: Entry[] = [...fromSchedules, ...Array.from(extraById.values())]
        const sorted = all.sort((a, b) => {
            if (a.start_timestamp !== b.start_timestamp) return a.start_timestamp - b.start_timestamp
            const durDiff = b.end_timestamp - b.start_timestamp - (a.end_timestamp - a.start_timestamp)
            if (durDiff !== 0) return durDiff
            if (a.hasCost !== b.hasCost) return a.hasCost ? -1 : 1
            return 0
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

        const claimedSoFar: Array<[number, number]> = []
        const entryData = sorted.map((entry, i) => {
            const range: [number, number] = [entry.start_timestamp, entry.end_timestamp]
            let compensated: Array<[number, number]>
            let blocked: Array<[number, number]>

            if (i === 0) {
                compensated = [range]
                blocked = []
            } else {
                const allClaimed = unionIntervals([...claimedSoFar])
                blocked = unionIntervals(
                    allClaimed
                        .map(([cs, ce]): [number, number] => [Math.max(entry.start_timestamp, cs), Math.min(entry.end_timestamp, ce)])
                        .filter(([bs, be]) => be > bs)
                )
                compensated = subtractIntervals(range, blocked)
            }

            const compensatedDuration = compensated.reduce((sum, [a, b]) => sum + (b - a), 0)
            for (const iv of compensated) claimedSoFar.push(iv)

            return { ...entry, isPrimary: i === 0, compensated, blocked, totalDuration: range[1] - range[0], compensatedDuration }
        })

        const greenColor = isDarkMode ? '#2d7a4f' : '#287d44'
        const redColor = isDarkMode ? '#5a1e1e' : '#f5c6cb'

        return (
            <div style={{ marginTop: '12px', marginBottom: '4px', minWidth: '600px', paddingBottom: '4px' }}>
                {entryData.map((s) => {
                    const hasComp = s.compensatedDuration > 0
                    const compHours = fmtH(s.compensatedDuration)
                    const totalHours = fmtH(s.totalDuration)

                    return (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '14px', gap: '10px' }}>
                            <div style={{ width: '130px', flexShrink: 0 }}>
                                <div
                                    style={{
                                        fontSize: '0.8em',
                                        fontWeight: 700,
                                        color: s.isPrimary ? (isDarkMode ? '#7ecf9a' : '#1a5c2e') : isDarkMode ? '#b0b0b0' : '#555',
                                    }}
                                >
                                    {s.isPrimary ? 'Primær' : 'Sekundær'}
                                </div>
                                <div style={{ fontSize: '0.72em', color: isDarkMode ? '#b0b0b0' : '#444', marginTop: '1px', fontWeight: 600 }}>
                                    {s.isPrimary ? `${totalHours} kompensert` : hasComp ? `${compHours} kompensert` : 'ingen kompensasjon'}
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
                                    style={{
                                        position: 'absolute',
                                        left: pct(s.start_timestamp),
                                        width: wPct(s.start_timestamp, s.end_timestamp),
                                        height: '100%',
                                        backgroundColor: isDarkMode ? '#2a2a2a' : '#efefef',
                                        border: `1px solid ${isDarkMode ? '#555' : '#ccc'}`,
                                        borderRadius: '3px',
                                        boxSizing: 'border-box' as const,
                                    }}
                                />
                                {s.blocked.map(([bs, be], idx) => (
                                    <div
                                        key={`b${idx}`}
                                        style={{
                                            position: 'absolute',
                                            left: pct(bs),
                                            width: wPct(bs, be),
                                            height: '100%',
                                            backgroundColor: redColor,
                                            borderRadius: '2px',
                                            boxSizing: 'border-box' as const,
                                        }}
                                    />
                                ))}
                                {s.compensated.map(([cs, ce], idx) => (
                                    <div
                                        key={`c${idx}`}
                                        style={{
                                            position: 'absolute',
                                            left: pct(cs),
                                            width: wPct(cs, ce),
                                            height: '100%',
                                            backgroundColor: greenColor,
                                            borderRadius: '2px',
                                            boxSizing: 'border-box' as const,
                                        }}
                                    />
                                ))}
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

    const renderAffectedPeriodsCell = (baseSchedule: Schedules) => {
        const changeOverlaps = (baseSchedule.vakter ?? []).filter((change) => {
            const overlapsBase = change.start_timestamp < baseSchedule.end_timestamp && change.end_timestamp > baseSchedule.start_timestamp
            const samePersonDifferentGroup = change.user_id === baseSchedule.user_id && change.group_id !== baseSchedule.group_id
            return overlapsBase && (change.is_double || samePersonDifferentGroup)
        })

        const backendOverlaps = (baseSchedule.overlapping_schedules ?? [])
            .filter((overlap) => overlap.start_timestamp < baseSchedule.end_timestamp && overlap.end_timestamp > baseSchedule.start_timestamp)
            .map((overlap) => ({
                id: overlap.id,
                label: itemData.find((s) => s.group_id === overlap.group_id)?.group.name ?? overlap.group_id,
                start_timestamp: overlap.start_timestamp,
                end_timestamp: overlap.end_timestamp,
            }))

        const overlapMap = new Map<string, { id: string; label: string; start_timestamp: number; end_timestamp: number }>()
        changeOverlaps.forEach((change) =>
            overlapMap.set(change.id, {
                id: change.id,
                label: change.user.name,
                start_timestamp: change.start_timestamp,
                end_timestamp: change.end_timestamp,
            })
        )
        backendOverlaps.forEach((overlap) => overlapMap.set(overlap.id, overlap))
        const overlaps = Array.from(overlapMap.values())

        if (overlaps.length === 0) {
            return (
                <Table.DataCell style={{ minWidth: '180px', padding: '12px' }}>
                    <span style={{ fontSize: '0.85em', color: getTextColor('subtle') }}>Ingen endringer</span>
                </Table.DataCell>
            )
        }

        type TimelineEntry = {
            key: string
            start: number
            end: number
        }

        const baseStart = baseSchedule.start_timestamp
        const baseEnd = baseSchedule.end_timestamp
        const axisDuration = Math.max(baseEnd - baseStart, 1)

        const entries: TimelineEntry[] = [
            { key: `base-${baseSchedule.id}`, start: baseStart, end: baseEnd },
            ...overlaps.map((change) => ({
                key: `overlap-${change.id}`,
                start: change.start_timestamp,
                end: change.end_timestamp,
            })),
        ].filter((entry) => entry.end > entry.start)

        const unionIntervals = (intervals: Array<[number, number]>): Array<[number, number]> => {
            if (intervals.length === 0) return []
            const sorted = [...intervals].sort((a, b) => a[0] - b[0])
            const merged: Array<[number, number]> = [[sorted[0][0], sorted[0][1]]]
            for (let i = 1; i < sorted.length; i++) {
                const last = merged[merged.length - 1]
                if (sorted[i][0] <= last[1]) last[1] = Math.max(last[1], sorted[i][1])
                else merged.push([sorted[i][0], sorted[i][1]])
            }
            return merged
        }

        const subtractIntervals = (range: [number, number], blocked: Array<[number, number]>): Array<[number, number]> => {
            let rem: Array<[number, number]> = [[range[0], range[1]]]
            for (const [bs, be] of blocked) {
                const next: Array<[number, number]> = []
                for (const [rs, re] of rem) {
                    if (be <= rs || bs >= re) next.push([rs, re])
                    else {
                        if (rs < bs) next.push([rs, bs])
                        if (be < re) next.push([be, re])
                    }
                }
                rem = next
            }
            return rem
        }

        const sortedByPriority = [...entries].sort((a, b) => {
            if (a.start !== b.start) return a.start - b.start
            return b.end - b.start - (a.end - a.start)
        })

        const claimedSoFar: Array<[number, number]> = []
        const entrySegments = new Map<
            string,
            {
                compensated: Array<[number, number]>
                blocked: Array<[number, number]>
                compensatedDuration: number
                blockedDuration: number
            }
        >()

        sortedByPriority.forEach((entry) => {
            const range: [number, number] = [entry.start, entry.end]
            const blocked = unionIntervals(
                unionIntervals([...claimedSoFar])
                    .map(([cs, ce]): [number, number] => [Math.max(entry.start, cs), Math.min(entry.end, ce)])
                    .filter(([bs, be]) => be > bs)
            )
            const compensated = subtractIntervals(range, blocked)
            const compensatedDuration = compensated.reduce((sum, [a, b]) => sum + (b - a), 0)
            const blockedDuration = blocked.reduce((sum, [a, b]) => sum + (b - a), 0)
            compensated.forEach((iv) => claimedSoFar.push(iv))
            entrySegments.set(entry.key, { compensated, blocked, compensatedDuration, blockedDuration })
        })

        const pct = (ts: number) => `${((ts - baseStart) / axisDuration) * 100}%`
        const widthPct = (start: number, end: number) => `${Math.max(((end - start) / axisDuration) * 100, 0.25)}%`
        const formatHours = (seconds: number) => {
            const h = seconds / 3600
            return Number.isInteger(h) ? `${h}t` : `${Math.floor(h)}t ${Math.round((h % 1) * 60)}m`
        }

        const green = isDarkMode ? '#2d7a4f' : '#287d44'
        const red = isDarkMode ? '#6b2c2c' : '#f5c6cb'
        const track = isDarkMode ? '#333' : '#e0e0e0'
        const ghost = isDarkMode ? '#2a2a2a' : '#efefef'
        const ghostBorder = isDarkMode ? '#555' : '#ccc'

        const baseKey = `base-${baseSchedule.id}`
        const baseSeg = entrySegments.get(baseKey)
        if (!baseSeg) {
            return (
                <Table.DataCell style={{ minWidth: '180px', padding: '12px' }}>
                    <span style={{ fontSize: '0.85em', color: getTextColor('subtle') }}>Ingen endringer</span>
                </Table.DataCell>
            )
        }

        const effectiveStart = baseSeg.compensated[0]?.[0]
        const effectiveEnd = baseSeg.compensated[baseSeg.compensated.length - 1]?.[1]
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

        return (
            <Table.DataCell style={{ minWidth: '280px', padding: '12px' }}>
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '95px', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.78em', fontWeight: 700 }}>Effektiv vakt</div>
                        <div style={{ fontSize: '0.68em', color: getTextColor('secondary') }}>
                            {formatHours(baseSeg.compensatedDuration)} / {formatHours(baseSeg.blockedDuration)}
                        </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '16px' }}>
                        <div
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                height: '2px',
                                backgroundColor: track,
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                left: pct(baseStart),
                                width: widthPct(baseStart, baseEnd),
                                height: '100%',
                                backgroundColor: ghost,
                                border: `1px solid ${ghostBorder}`,
                                borderRadius: '3px',
                                boxSizing: 'border-box',
                            }}
                        />
                        {baseSeg.blocked.map(([bs, be], idx) => (
                            <div
                                key={`b-base-${idx}`}
                                style={{
                                    position: 'absolute',
                                    left: pct(bs),
                                    width: widthPct(bs, be),
                                    height: '100%',
                                    backgroundColor: red,
                                    borderRadius: '2px',
                                }}
                            />
                        ))}
                        {baseSeg.compensated.map(([cs, ce], idx) => (
                            <div
                                key={`c-base-${idx}`}
                                style={{
                                    position: 'absolute',
                                    left: pct(cs),
                                    width: widthPct(cs, ce),
                                    height: '100%',
                                    backgroundColor: green,
                                    borderRadius: '2px',
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div style={{ marginTop: '4px', fontSize: '0.68em', color: getTextColor('secondary') }}>
                    {effectiveStart && effectiveEnd ? `${fmtDate(effectiveStart)} – ${fmtDate(effectiveEnd)}` : 'Ingen kompensert periode'}
                </div>
            </Table.DataCell>
        )
    }

    const mapVakter = (vaktliste: Schedules[]) => {
        // Show all schedules in regular grouping. Double-shift impact is shown under "Endringer".
        const ordinary = vaktliste

        let rowCount = 0
        const canViewCost = hasAnyRole(user, ['leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm'])
        const columnCount = canViewCost ? 8 : 7

        const allRows: JSX.Element[] = []

        // Group ordinary shifts by vaktlag (group name)
        const groupedByGroupName: Record<string, Schedules[]> = ordinary.reduce(
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

        // Render ordinary shifts
        Object.entries(groupedByGroupName).forEach(([koststed, schedules]) => {
            allRows.push(
                <Table.Row key={`header-${koststed}`}>
                    <Table.DataCell colSpan={columnCount}>
                        <b>{koststed}</b>
                        <TimeLine schedules={schedules} />
                    </Table.DataCell>
                </Table.Row>
            )

            schedules.forEach((vakter) => {
                rowCount++
                const vaktType = vakter.type === 'bakvakt' ? 'bistand' : vakter.type
                const backgroundColor = getBistandBytteColor(vaktType)
                const icon =
                    vaktType === 'bistand' ? (
                        <FirstAidKitIcon aria-hidden style={{ marginRight: '8px' }} />
                    ) : vaktType === 'bytte' ? (
                        <RecycleIcon aria-hidden style={{ marginRight: '8px' }} />
                    ) : null

                allRows.push(
                    <Table.Row key={`row-${vakter.id}`}>
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
                        {renderAffectedPeriodsCell(vakter)}
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
                                        <MapCost vakt={vakter} avstemming={undefined} />
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '0.85em', color: getTextColor('subtle') }}>Ingen kostnad</span>
                                )}
                            </Table.DataCell>
                        )}
                        <Table.DataCell style={{ padding: '8px', minWidth: '200px' }}>
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
            })
        })

        return allRows
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
    const canBulkApprove =
        uniqueApproveLevels.length === 1 && (uniqueApproveLevels[0] === 1 || uniqueApproveLevels[0] === 3) && listeAvVakter.length > 0
    const tableColumnCount = hasAnyRole(user, ['leveranseleder', 'personalleder', 'okonomi', 'admin', 'bdm']) ? 8 : 7

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
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: isDarkMode ? '#7ddc83' : '#1f7a2e' }}>All good!</div>
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
