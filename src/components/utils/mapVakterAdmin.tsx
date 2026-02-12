import { Table, Select, Button } from '@navikt/ds-react'
import { FirstAidKitIcon, RecycleIcon } from '@navikt/aksel-icons'
import moment from 'moment'
import { Dispatch, SetStateAction } from 'react'
import { Schedules } from '../../types/types'
import MapApproveStatus from './MapApproveStatus'
import MapCost from './mapCost'
import MapAudit from './mapAudit'
import DeleteVaktButton from './DeleteVaktButton'
import { ReactNode } from 'react'

import { Dispatch, SetStateAction } from 'react'

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
    renderGroupHeader?: (groupName: string, schedules: Schedules[]) => ReactNode
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
    renderGroupHeader,
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

    // Convert the grouped and sorted schedules into an array of JSX elements
    let rowCount = 0
    const groupedRows = Object.entries(groupedByGroupName).flatMap(([groupName, schedules]) => [
        // This is the row for the group header
        <Table.Row key={`header-${groupName}`}>
            <Table.DataCell colSpan={7}>
                <b>{groupName}</b>
                {renderGroupHeader && renderGroupHeader(groupName, schedules)}
            </Table.DataCell>
        </Table.Row>,
        // These are the individual rows for the schedules
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
                            {vakter.user.roles && vakter.user.roles.length > 0 && (
                                <div style={{ fontSize: '0.85em', color: getTextColor('secondary'), marginTop: '4px' }}>
                                    Roller: {vakter.user.roles.map((r) => r.title).join(', ')}
                                </div>
                            )}
                            {vakter.user.group_roles && vakter.user.group_roles.length > 0 && (
                                <div style={{ fontSize: '0.85em', color: getTextColor('secondary') }}>
                                    Grupperoller: {vakter.user.group_roles.map((gr) => `${gr.role.title} (${gr.group_name})`).join(', ')}
                                </div>
                            )}
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
                    <Table.DataCell style={{ minWidth: '180px', padding: '12px' }}>
                        {vakter.vakter.length > 0 ? (
                            <div style={{ lineHeight: '1.5' }}>
                                {vakter.vakter.map((endringer, idx: number) => {
                                    const endringType = endringer.type === 'bakvakt' ? 'bistand' : endringer.type
                                    const endringBgColor = getBistandBytteColor(endringType)
                                    return (
                                        <div
                                            key={idx}
                                            style={{
                                                marginBottom: idx < vakter.vakter.length - 1 ? '12px' : '0',
                                                paddingBottom: idx < vakter.vakter.length - 1 ? '12px' : '0',
                                                borderBottom:
                                                    idx < vakter.vakter.length - 1 ? (isDarkMode ? '1px solid #444' : '1px solid #e0e0e0') : 'none',
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
                            </div>
                        ) : (
                            <span style={{ fontSize: '0.85em', color: getTextColor('subtle') }}>Ingen endringer</span>
                        )}
                    </Table.DataCell>
                    <Table.DataCell style={{ minWidth: '180px', padding: '8px' }}>
                        <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
                            <Select
                                label="Sett status"
                                size="small"
                                value={vakter.approve_level}
                                disabled={vakter.approve_level >= 5}
                                onChange={async (e) => {
                                    const newLevel = Number(e.target.value)
                                    const updatedSchedule = {
                                        ...vakter,
                                        approve_level: newLevel,
                                    }
                                    setIsLoading(true)
                                    await update_schedule(updatedSchedule, setResponse, setResponseError)
                                }}
                            >
                                <option value={0}>0 - Trenger godkjenning</option>
                                <option value={1}>1 - Godkjent av ansatt</option>
                                <option value={2}>2 - Venter på utregning</option>
                                <option value={3}>3 - Godkjent av vaktsjef</option>
                                <option value={4}>4 - Godkjent av BDM</option>
                                <option value={5} disabled>
                                    5 - Overført til lønn
                                </option>
                                <option value={6} disabled>
                                    6 - Venter på diff-utregning
                                </option>
                                <option value={7} disabled>
                                    7 - Diff utregnet
                                </option>
                                <option value={8} disabled>
                                    8 - Overført etter rekjøring
                                </option>
                            </Select>
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
                                disabled={vakter.approve_level > 0}
                            >
                                Gjør endringer
                            </Button>

                            <DeleteVaktButton
                                vakt={vakter}
                                loading={loading}
                                setLoading={setLoading}
                                setResponse={setResponse}
                                onError={showErrorModal}
                                delete_schedule={(scheduleId, setResponse) => delete_schedule(scheduleId, setResponse, setResponseError)}
                            ></DeleteVaktButton>
                        </div>
                    </Table.DataCell>
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
                    </Table.DataCell>
                </Table.Row>
            )
        }),
    ])
    return groupedRows
}
