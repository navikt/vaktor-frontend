import { Table, Loader, UNSAFE_MonthPicker, UNSAFE_useMonthpicker, Search, Select, Button, Popover, ReadMore } from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'

const mapApproveStatus = (status: number): JSX.Element => {
    const statusMap: { [key: number]: { text: string; color: string } } = {
        1: { text: 'Godkjent av ansatt', color: '#66CBEC' },
        2: { text: 'Venter på utregning', color: '#99DEAD' },
        3: { text: 'Godkjent av vaktsjef', color: '#99DEAD' },
        4: { text: 'Overført til lønn', color: '#E18071' },
        5: { text: 'Venter på utregning av diff', color: '#99DEAD' },
        6: { text: 'Utregning fullført med diff', color: '#99DEAD' },
        7: { text: 'Overført til lønn etter rekjøring', color: '#E18071' },
    }

    const { text, color } = statusMap[status] || { text: 'Trenger godkjenning', color: '#FFFFFF' }

    return (
        <Table.DataCell
            style={{
                backgroundColor: color,
                maxWidth: '150',
                minWidth: '150',
            }}
        >
            {text}
        </Table.DataCell>
    )
}

const AvstemmingOkonomiAlle = () => {
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
    const [searchFilterAction, setSearchFilterAction] = useState(8)

    const { monthpickerProps, inputProps, selectedMonth, setSelected } = UNSAFE_useMonthpicker({
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

    const mapVakter = (vaktliste: Schedules[]) =>
        vaktliste
            .sort((a: Schedules, b: Schedules) =>
                a.start_timestamp !== b.start_timestamp ? a.start_timestamp - b.start_timestamp : a.user.name.localeCompare(b.user.name)
            )
            .map((vakter: Schedules, i: number) => (
                //approve_level = 2;

                <Table.Row key={i}>
                    <Table.DataCell>{i + 1}</Table.DataCell>
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
                    {mapApproveStatus(vakter.approve_level)}
                    {(['okonomi'].includes(user.role) || user.is_admin === true) && (
                        <Table.DataCell scope="row" style={{ maxWidth: '200px', minWidth: '150px' }}>
                            {vakter.cost.length !== 0 ? <MapCost vakt={vakter} avstemming={true}></MapCost> : 'ingen beregning foreligger'}
                        </Table.DataCell>
                    )}
                    <Table.DataCell scope="row" style={{ maxWidth: '250px', minWidth: '200px' }}>
                        {vakter.audits.length !== 0 ? <MapAudit audits={vakter.audits} /> : 'Ingen hendelser'}
                    </Table.DataCell>
                </Table.Row>
            ))

    useEffect(() => {
        setLoading(true)
        fetch('/vaktor/api/all_schedules')
            .then(async (scheduleRes) => scheduleRes.json())
            .then((itemData) => {
                itemData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)

                setItemData(itemData.filter((data: Schedules) => data.user.ekstern === false))
                const distinctGroupNames: string[] = Array.from(new Set(itemData.map((data: { group: { name: string } }) => data.group.name)))
                const sortedGroupNames = distinctGroupNames.sort((a, b) => a.localeCompare(b))
                setGroupNames(sortedGroupNames)

                const distinctFilenames: string[] = Array.from(
                    new Set(
                        itemData.flatMap((data: Schedules) => {
                            return data.audits
                                .map((audit: { action: string }) => {
                                    const regex = /(Overført til lønn ved fil|Sendt til utbetaling ved fil): (\w{3}-\d{2}-\d{4})( - Vaktor Lonn)?/
                                    const match = audit.action.match(regex)
                                    if (match) {
                                        const filename = match[2]
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
    }, [response])

    //if (loading === true) return <Loader></Loader>

    if (itemData === undefined) return <></>
    if (selectedMonth === undefined) setSelected(new Date())
    let listeAvVakter = mapVakter(
        itemData.filter((value: Schedules) => {
            // const isMonthMatch =
            //     new Date(value.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
            //     new Date(value.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear()

            const endMonth = new Date(value.end_timestamp * 1000) < new Date('2023-05-01')
            const isNameMatch = value.user.name.toLowerCase().includes(searchFilter)
            const isGroupMatch = value.group.name.includes(searchFilterGroup)
            const isApproveLevelMatch = searchFilterAction === 8 ? true : value.approve_level === searchFilterAction
            const isFilenameMatch = selectedFilename === '' || value.audits.some((audit) => audit.action.includes(selectedFilename))

            return endMonth && isNameMatch && isGroupMatch && isApproveLevelMatch && isFilenameMatch
        })
    )

    let totalCost_filtered = itemData.filter((value: Schedules) => {
        // const isMonthMatch =
        //     new Date(value.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
        //     new Date(value.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear()

        const endMonth = new Date(value.end_timestamp * 1000) < new Date('2023-05-01')
        const isNameMatch = value.user.name.toLowerCase().includes(searchFilter)
        const isGroupMatch = value.group.name.includes(searchFilterGroup)
        const isApproveLevelMatch = searchFilterAction === 8 ? true : value.approve_level === searchFilterAction
        const isFilenameMatch = selectedFilename === '' || value.audits.some((audit) => audit.action.includes(selectedFilename))

        return endMonth && isNameMatch && isGroupMatch && isApproveLevelMatch && isFilenameMatch
    })

    const totalCost = totalCost_filtered.reduce((accumulator, currentSchedule) => {
        return (
            accumulator +
            currentSchedule.cost.reduce((costAccumulator, currentCost, index) => {
                if (currentSchedule.cost.length === 1 || currentCost.type_id > 1) {
                    return costAccumulator + currentCost.total_cost
                } else {
                    return costAccumulator
                }
            }, 0)
        )
    }, 0)

    const totalDifference = totalCost_filtered.reduce((accumulator, currentSchedule) => {
        const costObjectsCount = currentSchedule.cost.length

        if (costObjectsCount === 1) {
            return accumulator // If there is only 1 cost object, do nothing
        }

        if (costObjectsCount === 2) {
            const costDifference = currentSchedule.cost.reduce((differenceAccumulator, currentCost) => {
                if (currentCost.type_id === 3) {
                    return differenceAccumulator + currentCost.total_cost // Add to total if type_id is 3
                } else {
                    return differenceAccumulator - currentCost.total_cost // Subtract from total if type_id is not 3
                }
            }, 0)

            return accumulator + costDifference
        }

        if (costObjectsCount === 3) {
            const costDifference = currentSchedule.cost.reduce((differenceAccumulator, currentCost) => {
                if (currentCost.order_id === 0) {
                    return differenceAccumulator // Do nothing if order_id is 0
                }
                if (currentCost.order_id === 1) {
                    return differenceAccumulator - currentCost.total_cost // Subtract from total if order_id is 1
                }
                if (currentCost.order_id === 2) {
                    return differenceAccumulator + currentCost.total_cost // Add to total if order_id is 2
                }
                return differenceAccumulator
            }, 0)

            return accumulator + costDifference
        }

        return accumulator
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
            <div style={{ textAlign: 'end', display: 'flex', justifyContent: 'end' }}>
                <h3>Total kostnad: {totalCost.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</h3>
            </div>

            <div style={{ textAlign: 'end', display: 'flex', justifyContent: 'end' }}>
                <h3>Total Diff: {totalDifference.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</h3>
            </div>

            <div className="min-h-96" style={{ display: 'flex' }}>
                {/* <UNSAFE_MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <UNSAFE_MonthPicker.Input {...inputProps} label="Velg måned" />
                    </div>
                </UNSAFE_MonthPicker> */}
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
                        <option value={8}>Alle</option>
                        <option value={0}>Trenger godkjenning</option>
                        <option value={1}>Godkjent av ansatt</option>
                        <option value={2}>Venter på utregning</option>
                        <option value={3}>Godkjent av vaktsjef</option>
                        <option value={4}>Overført til lønn</option>
                        <option value={5}>Venter på utregning av diff</option>
                        <option value={6}>Utregning fullført med diff</option>
                        <option value={7}>Overført til lønn etter rekjøring</option>
                    </Select>
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
                            {(['okonomi'].includes(user.role) || user.is_admin === true) && (
                                <Table.HeaderCell
                                    scope="col"
                                    style={{
                                        minWidth: '400px',
                                        maxWidth: '400px',
                                    }}
                                >
                                    Kost
                                </Table.HeaderCell>
                            )}
                            <Table.HeaderCell scope="col">Audit</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {loading ? <Loader /> : ''}
                        {listeAvVakter.length === 0 ? <h3 style={{ margin: 'auto', color: 'red' }}>Ingen treff</h3> : listeAvVakter}
                    </Table.Body>
                </Table>
            </div>
        </div>
    )
}

export default AvstemmingOkonomiAlle
