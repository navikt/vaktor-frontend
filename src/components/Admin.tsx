import {
    Table,
    Loader,
    MonthPicker,
    useMonthpicker,
    Search,
    Select,
    Button,
    Checkbox,
    CheckboxGroup,
    Timeline,
    TimelinePeriodProps,
} from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import DeleteVaktButton from './utils/DeleteVaktButton'
import EndreVaktButton from './utils/AdminAdjustDate'
import MapApproveStatus from './utils/MapApproveStatus'
import VarsleModal from './VarsleModal'
import ErrorModal from './utils/ErrorModal'
import AuditModal from './AuditModal'
import { FirstAidKitIcon, RecycleIcon, Buildings3Icon, WaitingRoomIcon } from '@navikt/aksel-icons'

const Admin = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [groupNames, setGroupNames] = useState<string[]>([])
    const [distinctFilenames, setDistinctFilenames] = useState<string[]>([])
    const [selectedFilename, setSelectedFilename] = useState<string>('')

    const [response, setResponse] = useState<ResponseType | null>(null)
    const [responseError, setResponseError] = useState('')

    const [selectedSchedule, setSchedule] = useState<Schedules>()
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false)

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterGroup, setSearchFilterGroup] = useState('')
    const [searchFilterAction, setSearchFilterAction] = useState(9)
    const [FilterExternal, setFilterExternal] = useState(false)

    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [varsleModalOpen, setVarsleModalOpen] = useState(false)

    const showErrorModal = (message: string) => {
        setErrorMessage(message)
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

    const TimeLine = ({ schedules }: { schedules: Schedules[] }) => {
        const vakter: TimelinePeriodProps[] = schedules
            .filter((s) => s.type === 'ordinær vakt')
            .map((schedule) => ({
                start: new Date(Number(schedule.start_timestamp) * 1000),
                end: new Date(Number(schedule.end_timestamp) * 1000),
                status: 'success',
                icon: <WaitingRoomIcon aria-hidden />,
                statusLabel: 'Vakt',
                children: (
                    <div>
                        <b>{schedule.user.name}</b>
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
            .filter((s) => s.type === 'bistand')
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
            .filter((s) => s.type === 'bytte')
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
            <div
                className="min-w-[800px]"
                style={{
                    /* @ts-ignore */
                    '--ac-timeline-bar-border-radius': '0px',
                }}
            >
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

    const { monthpickerProps, inputProps, selectedMonth, setSelected } = useMonthpicker({
        fromDate: new Date('Oct 01 2022'),
        toDate: new Date('Aug 23 2027'),
        defaultSelected: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
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

    if (selectedMonth !== undefined) {
        const timestamps = getMonthTimestamps(selectedMonth)
        startTimestamp = timestamps.startTimestamp
        endTimestamp = timestamps.endTimestamp
    } else {
        const now = new Date()
        startTimestamp = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime() / 1000
        endTimestamp = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0).getTime() / 1000
    }

    const delete_schedule = async (schedule_id: string, setResponse: Dispatch<any>, setResponseError: Dispatch<string>) => {
        try {
            const response = await fetch(`/api/delete_schedule?schedule_id=${schedule_id}`)
            const data = await response.json()
            setResponse(data)
            console.log(`Sletter periode med id: ${schedule_id}`)
        } catch (error) {
            console.error(error)
            showErrorModal(`Feilet ved sletting perioden: ${schedule_id}`)
        }
        setLoading(false)
    }

    const update_schedule = async (schedulelulu: Schedules, setResponse: Dispatch<any>, setResponseError: Dispatch<string>) => {
        var url = `/api/admin_update_schedule`
        console.log('Updating period with id: ', schedulelulu.id)
        var fetchOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(schedulelulu),
        }

        await fetch(url, fetchOptions)
            .then(async (r) => {
                if (!r.ok) {
                    const rText = await r.json()
                    setResponseError(rText.detail)
                    return []
                }
                return r.json()
            })
            .then((data: Schedules) => {
                setResponse(data)
                setIsLoading(false)
            })
            .catch((error: Error) => {
                console.error(error.name, error.message)
                setIsLoading(false)
            })
    }

    const mapVakter = (vaktliste: Schedules[]) => {
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
                    <TimeLine schedules={schedules} />
                </Table.DataCell>
            </Table.Row>,
            // These are the individual rows for the schedules
            ...schedules.map((vakter: Schedules, i: number) => {
                rowCount++
                return (
                    //approve_level = 2;

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
                                                        idx < vakter.vakter.length - 1
                                                            ? isDarkMode
                                                                ? '1px solid #444'
                                                                : '1px solid #e0e0e0'
                                                            : 'none',
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
                                                        year: '2-digit',
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
                                    <option value={5} disabled>5 - Overført til lønn</option>
                                    <option value={6} disabled>6 - Venter på diff-utregning</option>
                                    <option value={7} disabled>7 - Diff utregnet</option>
                                    <option value={8} disabled>8 - Overført etter rekjøring</option>
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

    useEffect(() => {
        setLoading(true)
        const path = `/api/all_schedules_with_limit?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`
        fetch(path)
            .then(async (scheduleRes) => scheduleRes.json())
            .then((itemData) => {
                itemData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)

                // setItemData(itemData.filter((data: Schedules) => data.user.ekstern === false))
                setItemData(itemData)
                const distinctGroupNames: string[] = Array.from(new Set(itemData.map((data: { group: { name: string } }) => data.group.name)))
                const sortedGroupNames = distinctGroupNames.sort((a, b) => a.localeCompare(b))
                setGroupNames(sortedGroupNames)

                const distinctFilenames: string[] = Array.from(
                    new Set(
                        itemData.flatMap((data: Schedules) => {
                            return data.audits
                                .map((audit: { action: string }) => {
                                    const regex =
                                        /^((?:Diff|ordinary|rest)\s)?(?:[Oo]verført til lønn ved fil|Sendt til utbetaling ved fil): (vaktor_)?(\w{3}-\d{2}-\d{4}(?:-[a-zA-Z]+)*)\.txt(?: - Vaktor Lonn)?$/
                                    const match = audit.action.match(regex)
                                    if (match) {
                                        const prefix = match[2] || ''
                                        const filenamePart = match[3]
                                        return `${prefix}${filenamePart}.txt`.trim()
                                    }
                                    return null
                                })
                                .filter((filename): filename is string => !!filename)
                        })
                    )
                )
                // Sort the filenames by date
                const sortedFilenames = distinctFilenames.sort((a, b) => {
                    const dateA = new Date(a.split('-').reverse().join('-'))
                    const dateB = new Date(b.split('-').reverse().join('-'))
                    return dateA.getTime() - dateB.getTime()
                })

                setDistinctFilenames(sortedFilenames)
                setLoading(false)
            })
    }, [response, selectedMonth])

    //if (loading === true) return <Loader></Loader>

    if (itemData === undefined) return <></>
    if (selectedMonth === undefined) setSelected(new Date())
    const filteredVakter = itemData.filter((value: Schedules) => {
        const isMonthMatch =
            new Date(value.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
            new Date(value.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear()

        const isNameMatch = value.user.name.toLowerCase().includes(searchFilter)
        const isGroupMatch = value.group.name.endsWith(searchFilterGroup)
        const isApproveLevelMatch = searchFilterAction === 9 ? true : value.approve_level === searchFilterAction
        const isFilenameMatch = selectedFilename === '' || value.audits.some((audit) => audit.action.includes(selectedFilename))
        const isExternalMatch = !FilterExternal || !value.user.ekstern

        return isMonthMatch && isNameMatch && isGroupMatch && isApproveLevelMatch && isFilenameMatch && isExternalMatch
    })

    let listeAvVakter = mapVakter(filteredVakter)

    return (
        <>
            <ErrorModal errorMessage={errorMessage} onClose={() => setErrorMessage(null)} />
            {varsleModalOpen && (
                <VarsleModal listeAvVakter={filteredVakter} handleClose={() => setVarsleModalOpen(false)} month={selectedMonth || new Date()} />
            )}
            {isAuditOpen && selectedSchedule && (
                <AuditModal open={isAuditOpen} onClose={() => setIsAuditOpen(false)} scheduleId={selectedSchedule.id} />
            )}
            {selectedSchedule ? (
                <>
                    <EndreVaktButton
                        vakt={selectedSchedule}
                        isOpen={isOpen}
                        setResponse={setResponse}
                        setResponseError={setResponseError}
                        setIsOpen={setIsOpen}
                        update_schedule={update_schedule}
                        setLoading={setLoading}
                    />
                </>
            ) : (
                <></>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
                <MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <MonthPicker.Input {...inputProps} label="Velg måned" />
                    </div>
                </MonthPicker>
                <form style={{ width: '300px' }}>
                    <Search label="Søk etter person" hideLabel={false} variant="simple" onChange={(text) => setSearchFilter(text)} />
                </form>
                <div style={{ width: '200px' }}>
                    <Select label="Velg Gruppe" onChange={(e) => setSearchFilterGroup(e.target.value)}>
                        <option value="">Alle</option>
                        {groupNames.map((groupName) => (
                            <option key={groupName} value={groupName}>
                                {groupName}
                            </option>
                        ))}
                    </Select>
                </div>
                <div style={{ width: '200px' }}>
                    <Select label="Velg Utbetaling" onChange={(e) => setSelectedFilename(e.target.value)}>
                        <option value="">Alle</option>
                        {distinctFilenames.map((filename) => (
                            <option key={filename} value={filename}>
                                {filename}
                            </option>
                        ))}
                    </Select>
                </div>

                <div style={{ width: '200px' }}>
                    <Select label="Filter på status" onChange={(e) => setSearchFilterAction(Number(e.target.value))}>
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
                <div style={{ width: '200px' }}>
                    <CheckboxGroup legend="Eksterne" onChange={(val: string[]) => setFilterExternal(val.includes('true'))}>
                        <Checkbox value="true">Skjul Eksterne</Checkbox>
                    </CheckboxGroup>
                </div>
                <div style={{ width: '200px', display: 'flex', alignItems: 'flex-end' }}>
                    <Button disabled={filteredVakter.length <= 0} onClick={() => setVarsleModalOpen(true)}>
                        Send påminnelse
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
                        <Table.HeaderCell scope="col">Kost</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Audit</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {loading ? <Loader /> : ''}
                    {listeAvVakter.length === 0 ? <h3 style={{ margin: 'auto', color: 'red' }}>Ingen treff</h3> : listeAvVakter}
                </Table.Body>
            </Table>
        </>
    )
}

export default Admin
