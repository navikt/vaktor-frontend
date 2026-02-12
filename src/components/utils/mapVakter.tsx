import { Table } from '@navikt/ds-react'
import { FirstAidKitIcon, RecycleIcon } from '@navikt/aksel-icons'
import moment from 'moment'
import { Schedules } from '../../types/types'
import MapApproveStatus from './MapApproveStatus'
import MapCost from './mapCost'
import MapAudit from './mapAudit'

interface MapVakterProps {
    vaktliste: Schedules[]
    isDarkMode: boolean
    rowCountStart?: number
}

export const mapVakter = ({ vaktliste, isDarkMode, rowCountStart = 0 }: MapVakterProps) => {
    let rowCount = rowCountStart

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

    // Use a record type to map the koststed to the corresponding array of Schedules
    const groupedByKoststed: Record<string, Schedules[]> = vaktliste.reduce(
        (acc: Record<string, Schedules[]>, current) => {
            const koststed = current.cost.length === 0 ? 'koststed not set' : current.cost[current.cost.length - 1].koststed
            if (!acc[koststed]) {
                acc[koststed] = []
            }
            acc[koststed].push(current)
            return acc
        },
        {} as Record<string, Schedules[]>
    )

    // Sort each group by start_timestamp
    Object.keys(groupedByKoststed).forEach((koststedKey) => {
        groupedByKoststed[koststedKey].sort((a, b) => a.start_timestamp - b.start_timestamp)
    })

    // Convert the grouped and sorted schedules into an array of JSX elements
    const groupedRows = Object.entries(groupedByKoststed).flatMap(([koststed, schedules], index) => [
        // This is the row for the group header
        <Table.Row key={`header-${koststed}`}>
            <Table.DataCell colSpan={5}>
                <b>Koststed: {koststed}</b>
            </Table.DataCell>
        </Table.Row>,
        // These are the individual rows for the schedules
        ...schedules.map((vakter, i) => {
            const vaktType = vakter.type === 'bakvakt' ? 'bistand' : vakter.type
            const isSpecialType = vaktType === 'bistand' || vaktType === 'bytte'
            const backgroundColor = isSpecialType ? getBistandBytteColor(vaktType) : 'transparent'
            const icon =
                vaktType === 'bistand' ? (
                    <FirstAidKitIcon aria-hidden style={{ marginRight: '8px' }} />
                ) : vaktType === 'bytte' ? (
                    <RecycleIcon aria-hidden style={{ marginRight: '8px' }} />
                ) : null

            return (
                <Table.Row key={`row-${vakter.id}-${i}`}>
                    <Table.DataCell style={{ padding: '6px', width: '40px' }}>{++rowCount}</Table.DataCell>
                    <Table.DataCell scope="row" style={{ padding: '12px', width: '200px', backgroundColor }}>
                        <div style={{ lineHeight: '1.5' }}>
                            <div style={{ fontSize: '1em', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                                {icon}
                                {vakter.user.name}
                            </div>
                            <div style={{ fontSize: '0.85em', color: getTextColor('secondary') }}>{vakter.user.id.toUpperCase()}</div>
                            <div style={{ fontSize: '0.85em', color: getTextColor('secondary') }}>{vakter.group.name}</div>
                            {isSpecialType && (
                                <div style={{ fontSize: '0.85em', color: getTextColor('subtle'), marginTop: '4px', fontStyle: 'italic' }}>
                                    {vaktType}
                                </div>
                            )}
                        </div>
                    </Table.DataCell>
                    <Table.DataCell style={{ minWidth: '200px', padding: '12px', backgroundColor: getStatusColor(vakter.approve_level) }}>
                        <div style={{ lineHeight: '1.6' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <MapApproveStatus status={vakter.approve_level} error={vakter.error_messages} />
                            </div>
                            <div style={{ fontSize: '0.85em', color: getTextColor('secondary'), marginBottom: '4px' }}>
                                <b>ID:</b>{' '}
                                <span
                                    style={{
                                        display: 'inline-block',
                                        border: isDarkMode ? '1px solid #444' : '1px solid #ccc',
                                        padding: '2px 5px',
                                        cursor: 'pointer',
                                        backgroundColor: isDarkMode ? '#2a2a2a' : '#f9f9f9',
                                        fontSize: '0.85em',
                                    }}
                                    onClick={() => navigator.clipboard.writeText(vakter.id)}
                                    title="Click to copy"
                                >
                                    {vakter.id}
                                </span>
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
                            {vakter.vakter.length > 0 && (
                                <div style={{ marginTop: '8px' }}>
                                    <b style={{ fontSize: '0.85em' }}>Endringer:</b>
                                    {vakter.vakter.map((endringer, idx: number) => {
                                        const endringType = endringer.type === 'bakvakt' ? 'bistand' : endringer.type
                                        const endringBgColor = getBistandBytteColor(endringType)
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    marginTop: '6px',
                                                    fontSize: '0.75em',
                                                    backgroundColor: endringBgColor !== 'transparent' ? endringBgColor : 'transparent',
                                                    padding: endringBgColor !== 'transparent' ? '6px' : '0',
                                                    borderRadius: endringBgColor !== 'transparent' ? '4px' : '0',
                                                }}
                                            >
                                                <div>
                                                    <b>ID:</b>{' '}
                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            border: isDarkMode ? '1px solid #444' : '1px solid #ccc',
                                                            padding: '1px 3px',
                                                            cursor: 'pointer',
                                                            backgroundColor: isDarkMode ? '#2a2a2a' : '#f9f9f9',
                                                            fontSize: '0.9em',
                                                        }}
                                                        onClick={() => navigator.clipboard.writeText(endringer.id)}
                                                        title="Click to copy"
                                                    >
                                                        {endringer.id}
                                                    </span>
                                                </div>
                                                <div>
                                                    <b>{endringType}:</b> {endringer.user.name}
                                                </div>
                                                <div>
                                                    <b>Start:</b>{' '}
                                                    {new Date(endringer.start_timestamp * 1000).toLocaleString('no-NB', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </div>
                                                <div>
                                                    <b>Slutt:</b>{' '}
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
                            )}
                        </div>
                    </Table.DataCell>
                    <Table.DataCell scope="row" style={{ padding: '12px', minWidth: '250px' }}>
                        <div style={{ lineHeight: '1.6' }}>
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
                                'ingen beregning foreligger'
                            )}
                        </div>
                    </Table.DataCell>
                    <Table.DataCell scope="row" style={{ padding: '12px', minWidth: '200px' }}>
                        <div style={{ lineHeight: '1.6' }}>
                            {vakter.audits.length !== 0 ? (
                                <div
                                    style={{
                                        padding: '8px',
                                        backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                                        borderRadius: '4px',
                                        border: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0',
                                    }}
                                >
                                    <MapAudit audits={vakter.audits} />
                                </div>
                            ) : (
                                'Ingen hendelser'
                            )}
                        </div>
                    </Table.DataCell>
                </Table.Row>
            )
        }),
    ])
    return groupedRows
}
