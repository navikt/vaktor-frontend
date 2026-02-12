import { Table, Loader, MonthPicker, useMonthpicker, Search, Select, Button, Popover, ExpansionCard, CheckboxGroup, Checkbox } from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Schedules } from '../types/types'
import { mapVakter } from './utils/mapVakter'

const AvstemmingOkonomi = () => {
    const { user } = useAuth()
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [groupNames, setGroupNames] = useState<string[]>([])
    const [distinctFilenames, setDistinctFilenames] = useState<string[]>([])
    const [selectedFilename, setSelectedFilename] = useState<string>('')

    const [response, setResponse] = useState([])
    const [responseError, setResponseError] = useState('')

    const [actionReason, setActionReason] = useState(Number)

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterGroup, setSearchFilterGroup] = useState('')
    const [searchFilterAction, setSearchFilterAction] = useState(9)

    const [FilterOnDoubleSchedules, setFilterOnDoubleSchedules] = useState(false)

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

    const recalculateSchedules = async (
        schedule_ids: string[],
        action_reason: number,
        setResponse: Dispatch<any>,
        setResponseError: Dispatch<string>
    ) => {
        var url = `/api/recalculate_schedules?action_reason=${action_reason}`
        var fetchOptions = {
            method: 'POST',
            body: JSON.stringify(schedule_ids),
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

    useEffect(() => {
        setLoading(true)
        const path = `/api/all_schedules_with_limit?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`
        fetch(path)
            .then(async (scheduleRes) => scheduleRes.json())
            .then((itemData) => {
                itemData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)

                setItemData(itemData.filter((data: Schedules) => data.user.ekstern === false))

                if (FilterOnDoubleSchedules === true) {
                    setItemData(itemData.filter((data: Schedules) => data.is_double === true))
                }

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
    }, [response, selectedMonth, FilterOnDoubleSchedules])

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

        return isMonthMatch && isNameMatch && isGroupMatch && isApproveLevelMatch && isFilenameMatch
    })

    let listeAvVakter = mapVakter({
        vaktliste: filteredVakter,
        isDarkMode,
    })

    let totalCost_filtered = filteredVakter

    const totalCost = totalCost_filtered.reduce((accumulator, currentSchedule) => {
        if (!currentSchedule || !Array.isArray(currentSchedule.cost)) return accumulator
        const lastCost =
            currentSchedule.cost.length > 0 && currentSchedule.cost[currentSchedule.cost.length - 1].total_cost
                ? Number(currentSchedule.cost[currentSchedule.cost.length - 1].total_cost)
                : 0
        return accumulator + lastCost
    }, 0)

    const totalCostDiff = totalCost_filtered.reduce((accumulator, currentSchedule) => {
        if (!currentSchedule || !Array.isArray(currentSchedule.cost) || currentSchedule.cost.length < 2) return accumulator
        const latestCost = Number(currentSchedule.cost[currentSchedule.cost.length - 1].total_cost) || 0
        const secondLatestCost = Number(currentSchedule.cost[currentSchedule.cost.length - 2].total_cost) || 0
        return accumulator + (latestCost - secondLatestCost)
    }, 0)

    return (
        <>
            <div style={{ textAlign: 'end', display: 'grid', justifyContent: 'end' }}>
                <ExpansionCard aria-label="reberegning-av-vakter" size="small" style={{ justifyContent: 'center', width: '280px' }}>
                    <ExpansionCard.Header>
                        <ExpansionCard.Title>Reberegning</ExpansionCard.Title>
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                        <div style={{ display: 'grid', justifyContent: 'center', gap: '10px' }}>
                            <div style={{ maxWidth: '210px', marginLeft: '30px' }}>
                                <Select label="Velg Action Reason" onChange={(e) => setActionReason(Number(e.target.value))}>
                                    <option value="">Gjør et valg</option>
                                    <option value={1}>Ordinær kjøring</option>
                                    <option value={2}>Lønnsendring</option>
                                    <option value={3}>Feilutregning/Feil i Vaktor</option>
                                    <option value={4}>Sekundærkjøring</option>
                                </Select>
                            </div>

                            <Button
                                onClick={() => {
                                    setOpenState(true)
                                }}
                                style={{
                                    maxWidth: '210px',
                                    marginLeft: '30px',
                                    marginTop: '5px',
                                    marginBottom: '5px',
                                }}
                                disabled={isLoading || !actionReason} // disable button when loading
                                ref={buttonRef}
                            >
                                Reberegn {selectedMonth ? selectedMonth.toLocaleString('default', { month: 'long' }) : ''}
                            </Button>
                            <Popover open={openState} onClose={() => setOpenState(false)} anchorEl={buttonRef.current}>
                                <Popover.Content
                                    style={{
                                        textAlign: 'center',
                                        backgroundColor: isDarkMode ? '#2a2a2a' : 'rgba(241, 241, 241, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        maxWidth: '250px',
                                    }}
                                >
                                    Er du sikker på vil reberegne perioder for{' '}
                                    {selectedMonth ? selectedMonth.toLocaleString('default', { month: 'long' }) : ''} for{' '}
                                    <b>{filteredVakter ? filteredVakter.map((s) => <div key={s.id}>{s.user.name}</div>) : ''} ? </b>
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            if (selectedMonth) {
                                                recalculateSchedules(
                                                    filteredVakter.map((s) => s.id),
                                                    actionReason,
                                                    setResponse,
                                                    setResponseError
                                                )
                                                setIsLoading(true)
                                            } else {
                                                console.log('SelectedMonth not set')
                                            }
                                        }}
                                        disabled={isLoading || !actionReason} // disable button when loading
                                    >
                                        {isLoading ? <Loader /> : 'Rekalkuler nå!'}
                                    </Button>
                                </Popover.Content>
                            </Popover>
                        </div>
                    </ExpansionCard.Content>
                </ExpansionCard>
            </div>

            <div style={{ textAlign: 'end', display: 'grid', justifyContent: 'end', columnGap: '15px', marginTop: '15px' }}>
                <div>
                    <b>Total kostnad: {totalCost.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</b>
                </div>
                <div>
                    <b>Diff: {totalCostDiff.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</b>
                </div>
                <div>
                    <b>Antall vakter: {filteredVakter.length}</b>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <MonthPicker.Input {...inputProps} label="Velg måned" />
                    </div>
                </MonthPicker>
                <form style={{ width: '300px' }}>
                    <Search label="Søk etter person" hideLabel={false} variant="simple" onChange={(text) => setSearchFilter(text.toLowerCase())} />
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
                        <option value={-1}>Ikke overført lønn</option>
                    </Select>
                </div>
                <div style={{ width: '200px' }}>
                    <CheckboxGroup legend="Dobbel vakt" onChange={(val: string[]) => setFilterOnDoubleSchedules(val.includes('true'))}>
                        <Checkbox value="true">Er dobbeltvakt</Checkbox>
                    </CheckboxGroup>
                </div>
            </div>
            <div>
                <Table zebraStripes>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell style={{ padding: '6px', width: '40px' }}>#</Table.HeaderCell>
                            <Table.HeaderCell scope="col" style={{ padding: '12px', width: '200px' }}>
                                Navn
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                scope="col"
                                style={{
                                    padding: '12px',
                                    minWidth: '200px',
                                }}
                            >
                                Periode
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                scope="col"
                                style={{
                                    padding: '12px',
                                    minWidth: '250px',
                                }}
                            >
                                Kost
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                scope="col"
                                style={{
                                    padding: '12px',
                                    minWidth: '200px',
                                }}
                            >
                                Audit
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {loading ? <Loader /> : null}
                        {listeAvVakter.length === 0 && !loading ? (
                            <Table.Row>
                                <Table.DataCell colSpan={5}>
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
