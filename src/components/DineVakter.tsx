import { Button, Table, Loader, Select, MonthPicker, useMonthpicker, HelpText, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState, Dispatch } from 'react'
import { Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import MapApproveStatus from './utils/MapApproveStatus'
import { useTheme } from '../context/ThemeContext'

let today = Date.now() / 1000

const getStatusColor = (approveLevel: number, isDarkMode: boolean) => {
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

const confirm_schedule = async (schedule_id: string, setResponse: Dispatch<any>, setLoading: Dispatch<any>) => {
    setLoading(true)

    await fetch(`/api/confirm_schedule?schedule_id=${schedule_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false)
            setResponse(data)
        })
}

const disprove_schedule = async (schedule_id: string, setResponse: Dispatch<any>, setLoading: Dispatch<any>) => {
    setLoading(true)
    await fetch(`/api/disprove_schedule?schedule_id=${schedule_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false)
            setResponse(data)
        })
}

const DineVakter = () => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [response, setResponse] = useState()
    const [loading, setLoading] = useState(false)

    const [filterYear, setFilterYear] = useState(false)

    const [searchFilterAction, setSearchFilterAction] = useState(9)

    const currentDate = new Date()

    const { monthpickerProps, inputProps, selectedMonth, setSelected } = useMonthpicker({
        fromDate: new Date('Oct 01 2022'),
        toDate: new Date('Dec 31 2027'),
        defaultSelected: new Date(
            new Date().getDate() - 10 > 0
                ? moment().locale('en-GB').format('ll')
                : moment()
                      .locale('en-GB')
                      .month(moment().month() - 1)
                      .format('ll')
        ),
    })

    const mapVakter = (vaktliste: Schedules[]) => {
        const groupedByGroupName: Record<string, Schedules[]> = vaktliste.reduce(
            (acc: Record<string, Schedules[]>, current) => {
                const groupName = current.group.name || 'Gruppe ikke satt'
                if (!acc[groupName]) {
                    acc[groupName] = []
                }
                acc[groupName].push(current)
                return acc
            },
            {} as Record<string, Schedules[]>
        )

        Object.keys(groupedByGroupName).forEach((groupNameKey) => {
            groupedByGroupName[groupNameKey].sort((a, b) => a.start_timestamp - b.start_timestamp)
        })

        return Object.entries(groupedByGroupName).flatMap(([groupName, schedules]) => [
            <Table.Row key={`header-${groupName}`}>
                <Table.DataCell colSpan={6}>
                    <b>{groupName}</b>
                </Table.DataCell>
            </Table.Row>,
            ...schedules.map((vakter: Schedules, index: number) => {
                const vaktType = vakter.type === 'bakvakt' ? 'bistand' : vakter.type
                const getBadgeStyles = () => {
                    if (vaktType === 'bistand') {
                        return {
                            backgroundColor: isDarkMode ? '#1a3845' : '#e6f4f9',
                            color: isDarkMode ? '#a8d8ea' : '#005573',
                            border: isDarkMode ? '1px solid #2d5f7a' : '1px solid #99d9ea',
                        }
                    }
                    if (vaktType === 'bytte') {
                        return {
                            backgroundColor: isDarkMode ? '#3d3820' : '#fff4cc',
                            color: isDarkMode ? '#ffd966' : '#856404',
                            border: isDarkMode ? '1px solid #6b6020' : '1px solid #ffe066',
                        }
                    }
                    return {}
                }

                return (
                    <Table.Row key={vakter.id}>
                        <Table.DataCell
                            style={{ minWidth: '240px', padding: '12px', backgroundColor: getStatusColor(vakter.approve_level, isDarkMode) }}
                        >
                            <div className="leading-relaxed">
                                <div className="mb-2">
                                    <MapApproveStatus status={vakter.approve_level} error={vakter.error_messages} />
                                </div>
                                <div className="text-sm font-bold mb-1 flex items-center gap-1">
                                    <span className="px-1.5 py-0.5 rounded" style={getBadgeStyles()}>
                                        {vakter.type}
                                    </span>
                                </div>
                                <div className="text-sm mb-1">
                                    <b>Uke:</b> {moment(vakter.start_timestamp * 1000).week()}{' '}
                                    {moment(vakter.start_timestamp * 1000).week() < moment(vakter.end_timestamp * 1000).week()
                                        ? ' - ' + moment(vakter.end_timestamp * 1000).week()
                                        : ''}
                                </div>
                                <div className="text-sm">
                                    <b>Fra:</b>{' '}
                                    {new Date(vakter.start_timestamp * 1000).toLocaleString('no-NB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                                <div className="text-sm mt-1">
                                    <b>Til:</b>{' '}
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
                        <Table.DataCell className="min-w-[180px] p-3">
                            {vakter.vakter.length > 0 ? (
                                <div className="leading-normal">
                                    {vakter.vakter.map((endringer, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`${idx < vakter.vakter.length - 1 ? 'mb-3 pb-3 border-b border-border-subtle' : ''}`}
                                        >
                                            <div className="text-sm font-bold mb-0.5">{endringer.type}</div>
                                            <div className="text-sm mb-1">{endringer.user.name}</div>
                                            <div className="text-xs text-text-subtle">
                                                {new Date(endringer.start_timestamp * 1000).toLocaleString('no-NB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                            <div className="text-xs text-text-subtle">
                                                {new Date(endringer.end_timestamp * 1000).toLocaleString('no-NB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-sm text-text-subtle">Ingen endringer</span>
                            )}
                        </Table.DataCell>
                        <Table.DataCell className="min-w-[140px] p-2">
                            <div className="flex flex-col gap-1">
                                <button
                                    disabled={vakter.approve_level != 0 || vakter.end_timestamp > today}
                                    className="h-9 w-full px-4 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: isDarkMode ? '#2d5a3d' : '#43a047',
                                    }}
                                    onClick={() => confirm_schedule(vakter.id, setResponse, setLoading)}
                                >
                                    {loading ? <Loader /> : 'Godkjenn'}
                                </button>

                                <button
                                    disabled={vakter.approve_level != 1}
                                    className="h-9 w-full px-4 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        backgroundColor: isDarkMode ? '#6b2c2c' : '#f96c6c',
                                    }}
                                    onClick={() => disprove_schedule(vakter.id, setResponse, setLoading)}
                                >
                                    {loading ? <Loader /> : 'Avgodkjenn'}
                                </button>
                            </div>
                        </Table.DataCell>
                        <Table.DataCell className="p-2 min-w-[260px]">
                            {vakter.cost.length !== 0 ? (
                                <div
                                    className="p-2 rounded"
                                    style={{
                                        backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                                        border: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0',
                                    }}
                                >
                                    <MapCost vakt={vakter}></MapCost>
                                </div>
                            ) : (
                                <span className="text-sm text-text-subtle">Ingen beregning foreligger</span>
                            )}
                        </Table.DataCell>
                        <Table.DataCell className="p-2">
                            <div
                                className="p-2 rounded"
                                style={{
                                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                                    border: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0',
                                }}
                            >
                                {vakter.audits.length !== 0 ? (
                                    <MapAudit audits={vakter.audits} />
                                ) : (
                                    <span className="text-xs text-text-subtle">Ingen hendelser</span>
                                )}
                            </div>
                        </Table.DataCell>
                    </Table.Row>
                )
            }),
        ])
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [scheduleRes] = await Promise.all([fetch('/api/get_current_user_schedules')])
                const schedulejson = await scheduleRes.json()
                schedulejson.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)
                setItemData(schedulejson)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [response])

    // if (loading === true) return <Loader></Loader>
    if (selectedMonth === undefined) setSelected(new Date())
    if (itemData === undefined) return <></>

    currentDate.setMonth(currentDate.getMonth() + 1) // Move to the next month
    currentDate.setDate(0) // Go to the last day of the previous month (last day of the current month)
    currentDate.setHours(23, 59) // Set to 23:59

    if (!selectedMonth) return null

    const selectedYear = selectedMonth.getFullYear()
    const selectedMonthIndex = selectedMonth.getMonth()

    const filteredVakter = itemData.filter((value: Schedules) => {
        const scheduleDate = new Date(value.start_timestamp * 1000)

        const isPast = scheduleDate < currentDate
        const isInSelectedMonth = scheduleDate.getMonth() === selectedMonthIndex && scheduleDate.getFullYear() === selectedYear
        const isInSelectedYear = scheduleDate.getFullYear() === selectedYear

        let isRelevant = false

        if (filterYear) {
            isRelevant = isInSelectedYear
        } else {
            isRelevant = (value.approve_level < 4 && isPast) || isInSelectedMonth
        }

        const matchesSearch = searchFilterAction === 9 || value.approve_level === searchFilterAction

        return isRelevant && matchesSearch
    })

    let listeAvVakter = mapVakter(filteredVakter)

    // if listeAvVakter is empty, return a message
    return (
        <>
            <div
                className="min-w-[900px] mb-[3vh] grid content-center mx-auto"
                style={{
                    backgroundColor: isDarkMode ? '#1a1a1a' : 'white',
                }}
            >
                <div className="flex">
                    <MonthPicker {...monthpickerProps}>
                        <div className="grid gap-4">
                            <MonthPicker.Input {...inputProps} label="Velg måned" />
                        </div>
                    </MonthPicker>

                    <div></div>

                    <div className="w-[200px] ml-[30px]">
                        <Select label="Filtrer på status" onChange={(e) => setSearchFilterAction(Number(e.target.value))}>
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
                    <div className="w-[200px] ml-[30px]">
                        <CheckboxGroup
                            legend="Vis hele året"
                            onChange={(val: string[]) => setFilterYear(val.includes('true'))}
                            defaultValue={['false']}
                        >
                            <Checkbox value="true">Vis alle vakter for {selectedMonth.getFullYear()} </Checkbox>
                        </CheckboxGroup>
                    </div>
                </div>
                <Table>
                    <Table.Header>
                        <Table.Row>
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
                                        <b>Hvem vises i vaktplanen:</b> Kun den personen med aktiv vakt vises i vaktplanen. Endringen vil legge seg
                                        oppå opprinnelig vakt for angitte periode
                                    </HelpText>
                                </div>
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">Actions</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Godtgjørelse</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Audit</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {listeAvVakter.length > 0 ? (
                            listeAvVakter
                        ) : (
                            <Table.Row>
                                <Table.DataCell>{loading ? <Loader /> : 'Ingen vakter funnet!'}</Table.DataCell>
                            </Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>
        </>
    )
}

export default DineVakter
