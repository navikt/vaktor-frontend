import {
    Table,
    Loader,
    MonthPicker,
    useMonthpicker,
    Search,
    Select,
    Button,
    Modal,
    ExpansionCard,
    CheckboxGroup,
    Checkbox,
    Timeline,
    TimelinePeriodProps,
    Alert,
} from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Schedules } from '../types/types'
import { mapVakterAdmin } from './utils/mapVakterAdmin'
import EndreVaktButton from './utils/AdminAdjustDate'
import VarsleModal from './VarsleModal'
import ErrorModal from './utils/ErrorModal'
import AuditModal from './AuditModal'
import { hasAnyRole } from '../utils/roles'
import { FirstAidKitIcon, RecycleIcon, Buildings3Icon, WaitingRoomIcon } from '@navikt/aksel-icons'

const AvstemmingOkonomi = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
    const isAdmin = hasAnyRole(user, ['admin'])

    const [itemData, setItemData] = useState<Schedules[]>([])
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [groupNames, setGroupNames] = useState<string[]>([])
    const [distinctFilenames, setDistinctFilenames] = useState<string[]>([])
    const [selectedFilename, setSelectedFilename] = useState<string>('')

    const [response, setResponse] = useState([])
    const [responseError, setResponseError] = useState('')

    const [actionReason, setActionReason] = useState<number>(0)
    const [reberegningError, setReberegningError] = useState<string | null>(null)

    const [openState, setOpenState] = useState<boolean>(false)

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterGroup, setSearchFilterGroup] = useState('')
    const [searchFilterAction, setSearchFilterAction] = useState(9)

    const [FilterOnDoubleSchedules, setFilterOnDoubleSchedules] = useState(false)
    const [FilterExternal, setFilterExternal] = useState(false)

    const [idSearchResults, setIdSearchResults] = useState<Schedules[] | null>(null)
    const [idSearchLoading, setIdSearchLoading] = useState(false)
    const [idSearchError, setIdSearchError] = useState<string | null>(null)

    // Admin-only state
    const [selectedSchedule, setSchedule] = useState<Schedules>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [varsleModalOpen, setVarsleModalOpen] = useState(false)

    const showErrorModal = (message: string) => setErrorMessage(message)

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

    const delete_schedule = async (schedule_id: string, setResponse: Dispatch<any>, setResponseError: Dispatch<string>) => {
        try {
            const response = await fetch(`/api/delete_schedule?schedule_id=${schedule_id}`)
            const data = await response.json()
            setResponse(data)
        } catch (error) {
            showErrorModal(`Feilet ved sletting av perioden: ${schedule_id}`)
        }
        setLoading(false)
    }

    const update_schedule = async (schedulelulu: Schedules, setResponse: Dispatch<any>, setResponseError: Dispatch<string>) => {
        var url = `/api/admin_update_schedule`
        var fetchOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
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
                setIsLoading(false)
            })
    }

    const { monthpickerProps, inputProps, selectedMonth, setSelected } = useMonthpicker({
        fromDate: new Date('Oct 01 2022'),
        toDate: new Date('Aug 23 2027'),
        defaultSelected: new Date().getDate() - 10 > 0 ? new Date() : new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
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

    const recalculateSchedules = async (schedule_ids: string[], action_reason: number): Promise<boolean> => {
        const url = `/api/recalculate_schedules?action_reason=${action_reason}`
        try {
            const r = await fetch(url, { method: 'POST', body: JSON.stringify(schedule_ids) })
            if (!r.ok) {
                const rText = await r.json()
                setReberegningError(rText.detail || 'Reberegning feilet')
                return false
            } else {
                const data = await r.json()
                setResponse(data)
                setReberegningError(null)
                return true
            }
        } catch {
            setReberegningError('Nettverksfeil under reberegning')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    const searchByIds = async (input: string) => {
        const ids = input
            .split(/[\s,]+/)
            .map((s) => s.trim())
            .filter((s) => UUID_REGEX.test(s))

        if (ids.length === 0) {
            setIdSearchResults(null)
            setIdSearchError(null)
            return
        }

        setIdSearchLoading(true)
        setIdSearchError(null)

        try {
            const r = await fetch('/api/schedules_by_ids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ids),
            })
            if (!r.ok) {
                const err = await r.json()
                setIdSearchError(err.message || 'Fant ingen vakter')
                setIdSearchResults([])
            } else {
                const data = await r.json()
                setIdSearchResults(data)
            }
        } catch {
            setIdSearchError('Nettverksfeil')
            setIdSearchResults([])
        } finally {
            setIdSearchLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        const path = `/api/all_schedules_with_limit?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`
        fetch(path)
            .then(async (scheduleRes) => scheduleRes.json())
            .then((itemData) => {
                itemData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)

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
        const isDoubleMatch = !FilterOnDoubleSchedules || value.is_double === true
        const isExternalMatch = isAdmin ? !FilterExternal || !value.user.ekstern : !value.user.ekstern

        return isMonthMatch && isNameMatch && isGroupMatch && isApproveLevelMatch && isFilenameMatch && isDoubleMatch && isExternalMatch
    })

    // Bruk ID-søk-resultater hvis de finnes, ellers vanlig månedsfilter
    const displayedVakter = idSearchResults !== null ? idSearchResults : filteredVakter

    let listeAvVakter = mapVakterAdmin({
        vaktliste: displayedVakter,
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
        showActions: isAdmin,
        isAdmin,
        renderGroupHeader: (groupName, schedules) => <TimeLine schedules={schedules} />,
    })

    const { totalCost, totalCostDiff } = displayedVakter.reduce(
        (acc, schedule) => {
            if (!schedule || !Array.isArray(schedule.cost) || schedule.cost.length === 0) return acc
            const costs = schedule.cost
            acc.totalCost += Number(costs[costs.length - 1].total_cost) || 0
            if (costs.length >= 2) {
                // Diff: siste beregning minus nest siste (kun siste rekjøring)
                acc.totalCostDiff += (Number(costs[costs.length - 1].total_cost) || 0) - (Number(costs[costs.length - 2].total_cost) || 0)
            }
            return acc
        },
        { totalCost: 0, totalCostDiff: 0 }
    )

    return (
        <>
            {isAdmin && <ErrorModal errorMessage={errorMessage} onClose={() => setErrorMessage(null)} />}
            {isAdmin && varsleModalOpen && (
                <VarsleModal listeAvVakter={displayedVakter} handleClose={() => setVarsleModalOpen(false)} month={selectedMonth || new Date()} />
            )}
            {isAdmin && isAuditOpen && selectedSchedule && (
                <AuditModal open={isAuditOpen} onClose={() => setIsAuditOpen(false)} scheduleId={selectedSchedule.id} />
            )}
            {isAdmin && selectedSchedule && (
                <EndreVaktButton
                    vakt={selectedSchedule}
                    isOpen={isOpen}
                    setResponse={setResponse}
                    setResponseError={setResponseError}
                    setIsOpen={setIsOpen}
                    update_schedule={update_schedule}
                    setLoading={setLoading}
                    isAdmin={isAdmin}
                />
            )}

            {/* Header bar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    border: isDarkMode ? '1px solid #444' : '1px solid #e0e0e0',
                }}
            >
                <div>
                    <div style={{ fontSize: '1.1em', fontWeight: 700 }}>Avstemming ØT</div>
                    <div style={{ fontSize: '0.85em', color: isDarkMode ? '#b0b0b0' : '#666', marginTop: '2px' }}>
                        {displayedVakter.length} vakter &nbsp;·&nbsp; Kostnad:{' '}
                        <b>{totalCost.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</b>
                        {totalCostDiff !== 0 && (
                            <span
                                style={{
                                    marginLeft: '8px',
                                    color: totalCostDiff < 0 ? (isDarkMode ? '#f08080' : '#c00') : isDarkMode ? '#7ecf9a' : '#1a5c2e',
                                }}
                            >
                                (diff: {totalCostDiff > 0 ? '+' : ''}
                                {totalCostDiff.toLocaleString('no-NO', { minimumFractionDigits: 2 })})
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {isAdmin && (
                        <Button variant="secondary" size="medium" disabled={displayedVakter.length <= 0} onClick={() => setVarsleModalOpen(true)}>
                            Send påminnelse
                        </Button>
                    )}
                    <ExpansionCard aria-label="reberegning-av-vakter" size="small">
                        <ExpansionCard.Header>
                            <ExpansionCard.Title size="small">Reberegning</ExpansionCard.Title>
                        </ExpansionCard.Header>
                        <ExpansionCard.Content>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Select label="Årsak" size="small" onChange={(e) => setActionReason(Number(e.target.value))}>
                                    <option value="">Gjør et valg</option>
                                    <option value={1}>Ordinær kjøring</option>
                                    <option value={2}>Lønnsendring</option>
                                    <option value={3}>Feilutregning/Feil i Vaktor</option>
                                    <option value={4}>Sekundærkjøring</option>
                                </Select>
                                <Button
                                    size="small"
                                    disabled={!actionReason}
                                    onClick={() => {
                                        setReberegningError(null)
                                        setOpenState(true)
                                    }}
                                >
                                    Reberegn {selectedMonth ? selectedMonth.toLocaleString('no-NO', { month: 'long' }) : ''}
                                </Button>
                                <Modal open={openState} onClose={() => setOpenState(false)} header={{ heading: 'Bekreft reberegning' }} width={500}>
                                    <Modal.Body>
                                        {reberegningError && (
                                            <Alert variant="error" style={{ marginBottom: '1rem' }}>
                                                {reberegningError}
                                            </Alert>
                                        )}
                                        <p>
                                            Er du sikker på at du vil reberegne <b>{displayedVakter.length} perioder</b> i{' '}
                                            <b>{selectedMonth ? selectedMonth.toLocaleString('no-NO', { month: 'long' }) : ''}</b>?
                                        </p>
                                        <div
                                            style={{
                                                padding: '8px',
                                                border: isDarkMode ? '1px solid #444' : '1px solid #ccc',
                                                borderRadius: '5px',
                                                backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                                                maxHeight: '250px',
                                                overflowY: 'auto',
                                            }}
                                        >
                                            {displayedVakter.map((s, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        background: isDarkMode ? '#1a1a1a' : '#f0f0f0',
                                                        margin: '4px 0',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85em',
                                                    }}
                                                >
                                                    {s.user.name}
                                                </div>
                                            ))}
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button
                                            variant="danger"
                                            disabled={isLoading}
                                            loading={isLoading}
                                            onClick={() => {
                                                if (selectedMonth) {
                                                    setIsLoading(true)
                                                    recalculateSchedules(
                                                        displayedVakter.map((s) => s.id),
                                                        actionReason
                                                    ).then((ok) => {
                                                        if (ok) setOpenState(false)
                                                    })
                                                }
                                            }}
                                        >
                                            Rekalkuler nå!
                                        </Button>
                                        <Button variant="tertiary" onClick={() => setOpenState(false)} disabled={isLoading}>
                                            Avbryt
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </ExpansionCard.Content>
                    </ExpansionCard>
                </div>
            </div>

            {/* Filter section */}
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    alignItems: 'flex-end',
                    padding: '12px 16px',
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                    border: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0',
                    borderRadius: '6px',
                    marginBottom: '16px',
                }}
            >
                <MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <MonthPicker.Input {...inputProps} label="Måned" />
                    </div>
                </MonthPicker>
                <div style={{ width: '280px' }}>
                    <Search
                        label="Søk etter person eller vakt-ID"
                        hideLabel={false}
                        variant="simple"
                        onChange={(text) => {
                            setSearchFilter(text.toLowerCase())
                            if (!text.trim()) {
                                setIdSearchResults(null)
                                setIdSearchError(null)
                            }
                        }}
                        onSearchClick={() => searchByIds(searchFilter)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') searchByIds(searchFilter)
                        }}
                    />
                    {idSearchLoading && <span style={{ fontSize: '0.8em' }}>Søker...</span>}
                    {idSearchError && <span style={{ fontSize: '0.8em', color: '#c00' }}>{idSearchError}</span>}
                </div>
                <div style={{ width: '180px' }}>
                    <Select label="Gruppe" onChange={(e) => setSearchFilterGroup(e.target.value)}>
                        <option value="">Alle</option>
                        {groupNames.map((groupName) => (
                            <option key={groupName} value={groupName}>
                                {groupName}
                            </option>
                        ))}
                    </Select>
                </div>
                <div style={{ width: '180px' }}>
                    <Select label="Utbetaling" onChange={(e) => setSelectedFilename(e.target.value)}>
                        <option value="">Alle</option>
                        {distinctFilenames.map((filename) => (
                            <option key={filename} value={filename}>
                                {filename}
                            </option>
                        ))}
                    </Select>
                </div>
                <div style={{ width: '220px' }}>
                    <Select label="Status" onChange={(e) => setSearchFilterAction(Number(e.target.value))}>
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
                        <option value={-1}>Ikke overført lønn</option>
                    </Select>
                </div>
                <CheckboxGroup
                    legend=""
                    hideLegend
                    onChange={(val: string[]) => {
                        setFilterOnDoubleSchedules(val.includes('double'))
                        if (isAdmin) setFilterExternal(val.includes('hideExternal'))
                    }}
                >
                    <Checkbox value="double">Kun dobbeltvakter</Checkbox>
                    {isAdmin && <Checkbox value="hideExternal">Skjul eksterne</Checkbox>}
                </CheckboxGroup>
            </div>
            <div>
                <Table
                    zebraStripes
                    style={{ width: '100%', backgroundColor: isDarkMode ? '#1a1a1a' : 'white', marginBottom: '3vh', marginTop: '2vh' }}
                >
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell style={{ padding: '6px', width: '40px' }}>#</Table.HeaderCell>
                            <Table.HeaderCell scope="col" style={{ padding: '12px', width: '200px' }}>
                                Navn
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" style={{ padding: '12px', minWidth: '200px' }}>
                                Periode
                            </Table.HeaderCell>
                            {isAdmin && (
                                <Table.HeaderCell scope="col" style={{ padding: '12px', minWidth: '180px' }}>
                                    Endringer
                                </Table.HeaderCell>
                            )}
                            {isAdmin && (
                                <Table.HeaderCell scope="col" style={{ padding: '12px', minWidth: '180px' }}>
                                    Actions
                                </Table.HeaderCell>
                            )}
                            <Table.HeaderCell scope="col" style={{ padding: '12px', minWidth: '250px' }}>
                                Kost
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" style={{ padding: '12px', minWidth: '200px' }}>
                                Audit
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {loading ? <Loader /> : null}
                        {listeAvVakter.length === 0 && !loading ? (
                            <Table.Row>
                                <Table.DataCell colSpan={isAdmin ? 7 : 5}>
                                    <h3 style={{ margin: 'auto', color: 'red' }}>Ingen treff</h3>
                                </Table.DataCell>
                            </Table.Row>
                        ) : (
                            listeAvVakter
                        )}
                    </Table.Body>
                </Table>
            </div>
        </>
    )
}

export default AvstemmingOkonomi
