import { Table, Loader, MonthPicker, useMonthpicker, Search, Select, Button, Popover, ExpansionCard, CheckboxGroup, Checkbox } from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import MapApproveStatus from './utils/MapApproveStatus'

const AvstemmingOkonomi = () => {
    const { user } = useAuth()
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [groupNames, setGroupNames] = useState<string[]>([])
    const [distinctFilenames, setDistinctFilenames] = useState<string[]>([])
    const [selectedFilename, setSelectedFilename] = useState<string>('')

    const [response, setResponse] = useState([])
    const [responseError, setResponseError] = useState('')

    const [actionReason, setActionReason] = useState(Number)
    const [approveLevel, setApproveLevel] = useState(Number)

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterGroup, setSearchFilterGroup] = useState('')
    const [searchFilterAction, setSearchFilterAction] = useState(9)

    const [FilterOnDoubleSchedules, setFilterOnDoubleSchedules] = useState(false)

    const { monthpickerProps, inputProps, selectedMonth, setSelected } = useMonthpicker({
        fromDate: new Date('Oct 01 2022'),
        toDate: new Date('Aug 23 2025'),
        //defaultSelected: new Date("Oct 2022")
        defaultSelected: new Date(
            new Date().getDate() - 10 > 0
                ? moment().locale('en-GB').format('L')
                : moment()
                      .locale('en-GB')
                      .month(moment().month() - 1)
                      .format('L')
        ),
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
        start_timestamp: number,
        end_timestamp: number,
        action_reason: number,
        approve_level: number,
        setResponse: Dispatch<any>,
        setResponseError: Dispatch<string>
    ) => {
        var url = `/vaktor/api/recalculate_schedules?start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}&action_reason=${action_reason}&approve_level=${approve_level}`
        console.log('Recalculating: ', start_timestamp, end_timestamp, action_reason, approve_level)
        var fetchOptions = {
            method: 'POST',
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

    let rowCount = 0

    const mapVakter = (vaktliste: Schedules[]) => {
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

        // Sort each group by start_timestamp
        Object.keys(groupedByKoststed).forEach((koststedKey) => {
            groupedByKoststed[koststedKey].sort((a, b) => a.start_timestamp - b.start_timestamp)
        })

        // Convert the grouped and sorted schedules into an array of JSX elements
        const groupedRows = Object.entries(groupedByKoststed).flatMap(([koststed, schedules], index) => [
            // This is the row for the group header
            <Table.Row key={`header-${koststed}`}>
                <Table.DataCell colSpan={8}>
                    <b>Koststed: {koststed}</b>
                </Table.DataCell>
            </Table.Row>,
            // These are the individual rows for the schedules
            ...schedules.map((vakter, i) => (
                <Table.Row key={`row-${vakter.id}-${i}`}>
                    <Table.DataCell>{++rowCount}</Table.DataCell>
                    <Table.DataCell scope="row">
                        <b> {vakter.user.name}</b>
                        <br />
                        {vakter.user.id.toUpperCase()}
                        <br />
                        {vakter.group.name}
                    </Table.DataCell>
                    <Table.DataCell scope="row">{vakter.type === 'bakvakt' ? 'bistand' : vakter.type}</Table.DataCell>
                    <Table.DataCell>
                        <b>ID: {vakter.id} </b>
                        <br />
                        Uke {moment(vakter.start_timestamp * 1000).week()}{' '}
                        {moment(vakter.start_timestamp * 1000).week() < moment(vakter.end_timestamp * 1000).week()
                            ? ' - ' + moment(vakter.end_timestamp * 1000).week()
                            : ''}
                        <br />
                        Start:{' '}
                        {new Date(vakter.start_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        <br />
                        Slutt:{' '}
                        {new Date(vakter.end_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        <br />
                        <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                            {vakter.vakter.length !== 0 ? 'Endringer:' : ''}
                            {vakter.vakter.map((endringer, idx: number) => (
                                <div key={idx}>
                                    <b>ID: {endringer.id}</b>
                                    <br />
                                    <b> {endringer.type === 'bakvakt' ? 'bistand' : endringer.type}:</b> {endringer.user.name}
                                    <br />
                                    Start:{' '}
                                    {new Date(endringer.start_timestamp * 1000).toLocaleString('no-NB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                    <br />
                                    Slutt:{' '}
                                    {new Date(endringer.end_timestamp * 1000).toLocaleString('no-NB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </div>
                            ))}
                            <br />
                        </div>
                    </Table.DataCell>
                    <MapApproveStatus status={vakter.approve_level} />
                    <Table.DataCell scope="row" style={{ maxWidth: '200px', minWidth: '150px' }}>
                        {vakter.cost.length !== 0 ? <MapCost vakt={vakter} avstemming={true}></MapCost> : 'ingen beregning foreligger'}
                    </Table.DataCell>

                    <Table.DataCell scope="row" style={{ maxWidth: '250px', minWidth: '200px' }}>
                        {vakter.audits.length !== 0 ? <MapAudit audits={vakter.audits} /> : 'Ingen hendelser'}
                    </Table.DataCell>
                </Table.Row>
            )),
        ])
        return groupedRows
    }

    useEffect(() => {
        setLoading(true)
        const path = `/vaktor/api/all_schedules_with_limit?start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`
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
                                        /(Overført til lønn ved fil|Sendt til utbetaling ved fil): (\w{3}-\d{2}-\d{4})(-?\w*)\.txt( - Vaktor Lonn)?/
                                    const match = audit.action.match(regex)
                                    if (match) {
                                        const datePart = match[2]
                                        const optionalSuffix = match[3] || '' // Will be empty string if not present
                                        const filename = `${datePart}${optionalSuffix}.txt`
                                        return filename.trim()
                                    }
                                    return null
                                })
                                .filter((filename) => filename) // Filter out null or empty filenames
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

    function matchesFilterCriteria(value: Schedules): boolean {
        const isMonthMatch =
            new Date(value.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
            new Date(value.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear()

        const isNameMatch = value.user.name.toLowerCase().includes(searchFilter)
        const isGroupMatch = value.group.name.endsWith(searchFilterGroup)
        const isApproveLevelMatch =
            searchFilterAction === 9
                ? true
                : searchFilterAction === -1
                  ? value.approve_level !== 5 && value.approve_level !== 8
                  : value.approve_level === searchFilterAction
        const isFilenameMatch = selectedFilename === '' || value.audits.some((audit) => audit.action.includes(selectedFilename))

        return isMonthMatch && isNameMatch && isGroupMatch && isApproveLevelMatch && isFilenameMatch
    }

    let listeAvVakter = mapVakter(itemData.filter(matchesFilterCriteria))
    let totalCost_filtered = itemData.filter(matchesFilterCriteria)

    const totalCost = totalCost_filtered.reduce((accumulator, currentSchedule) => {
        return accumulator + (currentSchedule.cost.length > 0 ? currentSchedule.cost[currentSchedule.cost.length - 1].total_cost : 0)
    }, 0)

    return (
        <div
            style={{
                minWidth: '900px',
                maxWidth: '90vw',
                backgroundColor: 'white',
                marginBottom: '3vh',
                display: 'grid',
                alignContent: 'center',
                margin: 'auto',
            }}
        >
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
                            <div style={{ maxWidth: '210px', marginLeft: '30px' }}>
                                <Select label="Velg Approve Level" onChange={(e) => setApproveLevel(Number(e.target.value))}>
                                    <option value="">Gjør et valg</option>
                                    <option value={1}>Godkjent av ansatt</option>
                                    <option value={3}>Godkjent av vaktsjef</option>
                                    <option value={4}>Godkjent av BDM</option>
                                    <option value={5}>Overført til lønn</option>
                                    <option value={7}>Utregning fullført med diff</option>
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
                                disabled={isLoading || !approveLevel || !actionReason} // disable button when loading
                                ref={buttonRef}
                            >
                                Rekalkuler {selectedMonth ? selectedMonth.toLocaleString('default', { month: 'long' }) : ''}
                            </Button>
                            <Popover open={openState} onClose={() => setOpenState(false)} anchorEl={buttonRef.current}>
                                <Popover.Content
                                    style={{
                                        textAlign: 'center',
                                        backgroundColor: 'rgba(241, 241, 241, 1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                        maxWidth: '250px',
                                    }}
                                >
                                    Er du sikker på at du vil rekalkulere alle perioder for{' '}
                                    <b>{selectedMonth ? selectedMonth.toLocaleString('default', { month: 'long' }) : ''}?</b>
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            if (selectedMonth) {
                                                const start_timestamp = Math.floor(selectedMonth.getTime() / 1000)
                                                const end_timestamp = Math.floor(
                                                    new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)).getTime() / 1000
                                                )
                                                recalculateSchedules(
                                                    start_timestamp,
                                                    end_timestamp,
                                                    actionReason,
                                                    approveLevel,
                                                    setResponse,
                                                    setResponseError
                                                )
                                                setIsLoading(true)
                                            } else {
                                                console.log('SelectedMonth not set')
                                            }
                                        }}
                                        disabled={isLoading || !approveLevel || !actionReason} // disable button when loading
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
                    <b>Antall vakter: {rowCount}</b>
                </div>
            </div>

            <div className="min-h-96" style={{ display: 'flex' }}>
                <MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <MonthPicker.Input {...inputProps} label="Velg måned" />
                    </div>
                </MonthPicker>
                <form style={{ width: '300px', marginLeft: '30px' }}>
                    <Search label="Søk etter person" hideLabel={false} variant="simple" onChange={(text) => setSearchFilter(text)} />
                </form>
                <div style={{ width: '200px', marginLeft: '30px' }}>
                    <Select label="Velg Gruppe" onChange={(e) => setSearchFilterGroup(e.target.value)}>
                        <option value="">Alle</option>
                        {groupNames.map((groupName) => (
                            <option key={groupName} value={groupName}>
                                {groupName}
                            </option>
                        ))}
                    </Select>
                </div>
                <div style={{ width: '200px', marginLeft: '30px' }}>
                    <Select label="Velg Utbetaling" onChange={(e) => setSelectedFilename(e.target.value)}>
                        <option value="">Alle</option>
                        {distinctFilenames.map((filename) => (
                            <option key={filename} value={filename}>
                                {filename}
                            </option>
                        ))}
                    </Select>
                </div>

                <div style={{ width: '200px', marginLeft: '30px' }}>
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
                <div style={{ width: '200px', marginLeft: '30px' }}>
                    <CheckboxGroup legend="Dobbel vakt" onChange={(val: string[]) => setFilterOnDoubleSchedules(val.includes('true'))}>
                        <Checkbox value="true">Er dobbeltvakt</Checkbox>
                    </CheckboxGroup>
                </div>
            </div>
            <div>
                <Table zebraStripes>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>#</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Type vakt</Table.HeaderCell>
                            <Table.HeaderCell
                                scope="col"
                                style={{
                                    minWidth: '400px',
                                    maxWidth: '400px',
                                }}
                            >
                                Periode
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                            <Table.HeaderCell
                                scope="col"
                                style={{
                                    minWidth: '400px',
                                    maxWidth: '400px',
                                }}
                            >
                                Kost
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">Audit</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {loading ? <Loader /> : null}
                        {listeAvVakter.length === 0 && !loading ? (
                            <Table.Row>
                                <Table.DataCell colSpan={7}>
                                    <h3 style={{ margin: 'auto', color: 'red' }}>Ingen treff</h3>
                                </Table.DataCell>
                            </Table.Row>
                        ) : (
                            listeAvVakter
                        )}
                    </Table.Body>
                </Table>
            </div>
        </div>
    )
}

export default AvstemmingOkonomi
