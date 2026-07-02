import { Table, Select, Button } from '@navikt/ds-react'
import { FirstAidKitIcon, RecycleIcon } from '@navikt/aksel-icons'
import moment from 'moment'
import { Dispatch, SetStateAction } from 'react'
import { Schedules, OverlappingSchedule } from '../../types/types'
import MapApproveStatus from './MapApproveStatus'
import MapCost from './mapCost'
import MapAudit from './mapAudit'
import DeleteVaktButton from './DeleteVaktButton'
import ConfirmStatusSelect from './ConfirmStatusSelect'
import { ReactNode } from 'react'

interface MapVakterAdminProps {
    vaktliste: Schedules[]
    isDarkMode: boolean
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
    setResponse: (response: any) => void
    setResponseError: (error: string) => void
    setSchedule: (schedule: Schedules) => void
    setIsOpen: (isOpen: boolean) => void
    setIsAuditOpen: (isOpen: boolean) => void
    setIsLoading: (loading: boolean) => void
    update_schedule: (schedule: Schedules, setResponse: any, setResponseError: any) => Promise<void>
    delete_schedule: (scheduleId: string, setResponse: any, setResponseError: any) => Promise<void>
    showErrorModal: (message: string) => void
    showActions?: boolean
    isAdmin?: boolean
    renderGroupHeader?: (groupName: string, schedules: Schedules[]) => ReactNode
    groupBy?: 'group' | 'koststed' | 'none'
    groupKeyFn?: (s: Schedules) => string
}

export const mapVakterAdmin = ({
    vaktliste,
    isDarkMode,
    loading,
    setLoading,
    setResponse,
    setResponseError,
    setSchedule,
    setIsOpen,
    setIsAuditOpen,
    setIsLoading,
    update_schedule,
    delete_schedule,
    showErrorModal,
    showActions = true,
    isAdmin = false,
    renderGroupHeader,
    groupBy = 'group',
    groupKeyFn,
}: MapVakterAdminProps) => {
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
            99: '#D3D3D3',
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
            99: '#4a4a4a',
            default: '#333333',
        }

        const colors = isDarkMode ? darkColors : lightColors
        return colors[approveLevel as keyof typeof colors] || colors.default
    }

    const getBistandBytteColor = (vaktType: string) => {
        if (vaktType === 'bistand' || vaktType === 'bakvakt') {
            return isDarkMode ? '#1a3845' : '#e6f4f9'
        }
        if (vaktType === 'bytte') {
            return isDarkMode ? '#3d3820' : '#fff4cc'
        }
        return 'transparent'
    }

    const getTextColor = (level: 'primary' | 'secondary' | 'subtle') => {
        if (!isDarkMode) {
            return level === 'primary' ? '#000' : level === 'secondary' ? '#666' : '#999'
        }
        return level === 'primary' ? '#e0e0e0' : level === 'secondary' ? '#b0b0b0' : '#888'
    }

    const getLatestCost = (schedule: Schedules) => {
        if (!schedule.cost || schedule.cost.length === 0) return undefined
        const sorted = [...schedule.cost].sort((a, b) => Number(a.order_id) - Number(b.order_id))
        return sorted[sorted.length - 1]
    }

    // Group schedules by group name
    const groupedByGroupName = vaktliste.reduce(
        (acc, current) => {
            const groupName = current.group.name
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

    // Build grouped map based on groupBy prop
    const buildGrouped = (): Record<string, Schedules[]> => {
        if (groupKeyFn) {
            return vaktliste.reduce(
                (acc, s) => {
                    const key = groupKeyFn(s)
                    if (!acc[key]) acc[key] = []
                    acc[key].push(s)
                    return acc
                },
                {} as Record<string, Schedules[]>
            )
        }
        if (groupBy === 'none') {
            return { '': [...vaktliste] }
        }
        if (groupBy === 'koststed') {
            return vaktliste.reduce(
                (acc, s) => {
                    const k = getLatestCost(s)?.koststed || 'Ukjent koststed'
                    if (!acc[k]) acc[k] = []
                    acc[k].push(s)
                    return acc
                },
                {} as Record<string, Schedules[]>
            )
        }
        return groupedByGroupName
    }
    const grouped = buildGrouped()

    // Build overlap map from backend-provided overlapping_schedules
    const groupNameByGroupId = new Map<string, string>(vaktliste.map((s) => [s.group_id, s.group.name]))
    const overlapMap = new Map<string, OverlappingSchedule[]>()
    for (const s of vaktliste) {
        if (s.overlapping_schedules && s.overlapping_schedules.length > 0) {
            overlapMap.set(s.id, s.overlapping_schedules)
        }
    }

    const renderDoubleShiftTimeline = (vakter: Schedules, overlapping: OverlappingSchedule[]) => {
        type Entry = { id: string; label: string; start: number; end: number; hasCost: boolean; isBase: boolean }

        const baseEntry: Entry = {
            id: vakter.id,
            label: `Ordinær (${vakter.group.name})`,
            start: vakter.start_timestamp,
            end: vakter.end_timestamp,
            hasCost: vakter.cost.length > 0 && Number(vakter.cost[vakter.cost.length - 1].total_cost) > 0,
            isBase: true,
        }

        const overlapEntries: Entry[] = overlapping.map((o) => ({
            id: o.id,
            label: groupNameByGroupId.get(o.group_id) ?? o.group_id,
            start: o.start_timestamp,
            end: o.end_timestamp,
            hasCost: false,
            isBase: false,
        }))

        const entries: Entry[] = [baseEntry, ...overlapEntries].sort((a, b) => {
            if (a.start !== b.start) return a.start - b.start
            const durationDiff = b.end - b.start - (a.end - a.start)
            if (durationDiff !== 0) return durationDiff
            if (a.hasCost !== b.hasCost) return a.hasCost ? -1 : 1
            return 0
        })

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

        const claimed: Array<[number, number]> = []
        const resultMap = new Map<
            string,
            {
                compensated: Array<[number, number]>
                blocked: Array<[number, number]>
                compSec: number
                blockedSec: number
                start: number
                end: number
            }
        >()

        entries.forEach((e) => {
            const blocked = unionIntervals(
                unionIntervals([...claimed])
                    .map(([cs, ce]): [number, number] => [Math.max(e.start, cs), Math.min(e.end, ce)])
                    .filter(([bs, be]) => be > bs)
            )
            const compensated = subtractIntervals([e.start, e.end], blocked)
            compensated.forEach((iv) => claimed.push(iv))
            const compSec = compensated.reduce((sum, [a, b]) => sum + (b - a), 0)
            const blockedSec = blocked.reduce((sum, [a, b]) => sum + (b - a), 0)
            resultMap.set(e.id, { compensated, blocked, compSec, blockedSec, start: e.start, end: e.end })
        })

        const axisMin = Math.min(...entries.map((e) => e.start))
        const axisMax = Math.max(...entries.map((e) => e.end))
        const axisDuration = Math.max(axisMax - axisMin, 1)
        const pct = (ts: number) => `${((ts - axisMin) / axisDuration) * 100}%`
        const widthPct = (s: number, e: number) => `${Math.max(((e - s) / axisDuration) * 100, 0.25)}%`
        const fmtH = (sec: number) => {
            const h = sec / 3600
            return Number.isInteger(h) ? `${h}t` : `${Math.floor(h)}t ${Math.round((h % 1) * 60)}m`
        }

        const green = isDarkMode ? '#2d7a4f' : '#287d44'
        const red = isDarkMode ? '#6b2c2c' : '#f5c6cb'
        const track = isDarkMode ? '#333' : '#e0e0e0'
        const ghost = isDarkMode ? '#2a2a2a' : '#efefef'
        const ghostBorder = isDarkMode ? '#555' : '#ccc'

        const baseResult = resultMap.get(vakter.id)
        if (!baseResult) return null
        const effectiveStart = baseResult.compensated[0]?.[0]
        const effectiveEnd = baseResult.compensated[baseResult.compensated.length - 1]?.[1]
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
            <div style={{ marginTop: '8px' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '120px', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.75em', fontWeight: 700, color: getTextColor('primary') }}>Effektiv vakt</div>
                        <div style={{ fontSize: '0.68em', color: getTextColor('subtle') }}>
                            {fmtH(baseResult.compSec)} komp / {fmtH(baseResult.blockedSec)} blokk
                        </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '14px' }}>
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
                                left: pct(baseResult.start),
                                width: widthPct(baseResult.start, baseResult.end),
                                height: '100%',
                                backgroundColor: ghost,
                                border: `1px solid ${ghostBorder}`,
                                borderRadius: '3px',
                                boxSizing: 'border-box',
                            }}
                        />
                        {baseResult.blocked.map(([bs, be], idx) => (
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
                        {baseResult.compensated.map(([cs, ce], idx) => (
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
            </div>
        )
    }

    let rowCount = 0
    const totalCols = showActions ? 7 : 5
    const groupedRows = Object.entries(grouped).flatMap(([groupKey, schedules]) => {
        const kostseder = Array.from(
            new Set(schedules.flatMap((s) => (getLatestCost(s)?.koststed ? [getLatestCost(s)!.koststed] : [])).filter(Boolean))
        )
        const showHeader = groupBy !== 'none' || groupKeyFn !== undefined
        return [
            // This is the row for the group header
            ...(showHeader
                ? [
                      <Table.Row key={`header-${groupKey}`}>
                          <Table.DataCell colSpan={totalCols}>
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                  <b style={{ fontSize: '1.05em' }}>{groupKey}</b>
                                  {groupBy === 'group' &&
                                      kostseder.map((k) => (
                                          <span
                                              key={k}
                                              style={{
                                                  fontSize: '0.78em',
                                                  fontWeight: 600,
                                                  letterSpacing: '0.03em',
                                                  textTransform: 'uppercase',
                                                  padding: '2px 8px',
                                                  borderRadius: '4px',
                                                  backgroundColor: isDarkMode ? '#1e3a28' : '#d4edda',
                                                  color: isDarkMode ? '#7ecf9a' : '#1a5c2e',
                                                  border: isDarkMode ? '1px solid #3a6b4a' : '1px solid #a8d5b5',
                                              }}
                                          >
                                              Koststed: {k}
                                          </span>
                                      ))}
                              </div>
                              {renderGroupHeader && renderGroupHeader(groupKey, schedules)}
                          </Table.DataCell>
                      </Table.Row>,
                  ]
                : []),
            ...schedules.map((vakter: Schedules, i: number) => {
                rowCount++
                return (
                    <Table.Row key={`row-${vakter.id}-${i}`}>
                        <Table.DataCell>{rowCount}</Table.DataCell>
                        <Table.DataCell
                            scope="row"
                            style={{
                                padding: '12px',
                                backgroundColor: getBistandBytteColor(vakter.type),
                            }}
                        >
                            {vakter.user.ekstern === true && <div style={{ color: 'red', fontWeight: 'bold', marginBottom: '4px' }}>EKSTERN</div>}
                            <div style={{ lineHeight: '1.5' }}>
                                <div style={{ fontSize: '1em', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                                    {vakter.type === 'bakvakt' || vakter.type === 'bistand' ? (
                                        <FirstAidKitIcon aria-hidden style={{ marginRight: '8px' }} />
                                    ) : vakter.type === 'bytte' ? (
                                        <RecycleIcon aria-hidden style={{ marginRight: '8px' }} />
                                    ) : null}
                                    {vakter.user.name}
                                </div>
                                <div style={{ fontSize: '0.85em', color: getTextColor('secondary') }}>{vakter.user.id.toUpperCase()}</div>
                                <div style={{ fontSize: '0.85em', color: getTextColor('secondary') }}>{vakter.group.name}</div>
                                <div style={{ fontSize: '0.85em', color: getTextColor('subtle'), marginTop: '4px', fontStyle: 'italic' }}>
                                    {vakter.type === 'bakvakt' ? 'bistand' : vakter.type}
                                </div>
                            </div>
                        </Table.DataCell>
                        <Table.DataCell style={{ minWidth: '200px', padding: '12px', backgroundColor: getStatusColor(vakter.approve_level) }}>
                            <div style={{ lineHeight: '1.6' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <MapApproveStatus status={vakter.approve_level} error={vakter.error_messages} />
                                </div>
                                <div style={{ fontSize: '0.85em', color: getTextColor('secondary'), marginBottom: '4px' }}>
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
                        {showActions && (
                            <Table.DataCell style={{ minWidth: '180px', padding: '12px' }}>
                                {(() => {
                                    const overlapping: OverlappingSchedule[] = overlapMap.get(vakter.id) ?? []
                                    const hasEndringer = vakter.vakter.length > 0
                                    const hasOverlap = overlapping.length > 0

                                    if (!hasEndringer && !hasOverlap) {
                                        return <span style={{ fontSize: '0.85em', color: getTextColor('subtle') }}>Ingen endringer</span>
                                    }

                                    return (
                                        <div style={{ lineHeight: '1.5' }}>
                                            {vakter.vakter.map((endringer, idx: number) => {
                                                const endringType = endringer.type === 'bakvakt' ? 'bistand' : endringer.type
                                                const endringBgColor = getBistandBytteColor(endringType)
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
                                                        <div style={{ fontSize: '0.85em', color: getTextColor('secondary'), marginBottom: '2px' }}>
                                                            <b>ID:</b> {endringer.id}
                                                        </div>
                                                        <div style={{ fontSize: '0.9em', fontWeight: 'bold', marginBottom: '2px' }}>
                                                            {endringer.type === 'bakvakt' ? 'bistand' : endringer.type}
                                                        </div>
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
                                                        <div
                                                            style={{
                                                                borderTop: isDarkMode ? '1px solid #555' : '1px solid #ccc',
                                                                margin: '6px 0',
                                                            }}
                                                        />
                                                    )}
                                                    {renderDoubleShiftTimeline(vakter, overlapping)}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}
                            </Table.DataCell>
                        )}
                        {showActions && (
                            <Table.DataCell style={{ minWidth: '180px', padding: '8px' }}>
                                <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                                    <ConfirmStatusSelect
                                        vakt={vakter}
                                        isDarkMode={isDarkMode}
                                        setIsLoading={setIsLoading}
                                        update_schedule={update_schedule}
                                        setResponse={setResponse}
                                        setResponseError={setResponseError}
                                    />
                                    <Button
                                        size="xsmall"
                                        style={{
                                            height: '36px',
                                            width: '150px',
                                            marginBottom: '5px',
                                        }}
                                        onClick={() => {
                                            setSchedule(vakter)
                                            setIsOpen(true)
                                        }}
                                        disabled={!isAdmin && vakter.approve_level > 0}
                                    >
                                        Gjør endringer
                                    </Button>

                                    <DeleteVaktButton
                                        vakt={vakter}
                                        loading={loading}
                                        setLoading={setLoading}
                                        setResponse={setResponse}
                                        onError={showErrorModal}
                                        isDarkMode={isDarkMode}
                                        delete_schedule={(scheduleId, setResponse) => delete_schedule(scheduleId, setResponse, setResponseError)}
                                        isAdmin={isAdmin}
                                    />
                                </div>
                            </Table.DataCell>
                        )}
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
                                    <MapCost vakt={vakter} avstemming={true}></MapCost>
                                </div>
                            ) : (
                                <span style={{ fontSize: '0.85em', color: getTextColor('subtle') }}>Ingen beregning foreligger</span>
                            )}
                        </Table.DataCell>
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
                            {showActions && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setSchedule(vakter)
                                        setIsAuditOpen(true)
                                    }}
                                    style={{ marginTop: '8px' }}
                                >
                                    Legg til audit
                                </Button>
                            )}
                        </Table.DataCell>
                    </Table.Row>
                )
            }),
        ]
    })
    return groupedRows
}
