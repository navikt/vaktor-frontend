import { Table, Loader, UNSAFE_MonthPicker, UNSAFE_useMonthpicker, Search, Select, Button, Popover, ReadMore } from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'

let today = Date.now() / 1000

const mapApproveStatus = (status: number) => {
    let statusText = ''
    let statusColor = ''
    switch (status) {
        case 1:
            statusText = 'Godkjent av ansatt'
            statusColor = '#66CBEC'
            break
        case 2:
            statusText = 'Venter på utregning'
            statusColor = '#99DEAD'
            break
        case 3:
            statusText = 'Godkjent av vaktsjef'
            statusColor = '#99DEAD'
            break
        case 4:
            statusText = 'Overført til lønn'
            statusColor = '#E18071'
            break
        case 5:
            statusText = 'Venter på utregning av diff'
            statusColor = '#99DEAD'
            break
        case 6:
            statusText = 'Utregning fullført med diff'
            statusColor = '#99DEAD'
            break
        case 7:
            statusText = 'Overført til lønn etter rekjøring'
            statusColor = '#E18071'
            break
        default:
            statusText = 'Trenger godkjenning'
            statusColor = '#FFFFFF'
            break
    }

    return (
        <Table.DataCell
            style={{
                backgroundColor: statusColor,
                maxWidth: '150',
                minWidth: '150',
            }}
        >
            {statusText}
        </Table.DataCell>
    )
}

const AvstemmingOkonomi = () => {
    const { user } = useAuth()
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [loading, setLoading] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [response, setResponse] = useState([])
    const [responseError, setResponseError] = useState('')

    const [actionReason, setActionReason] = useState(Number)
    const [approveLevel, setApproveLevel] = useState(Number)

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterRole, setSearchFilterRole] = useState('')
    const [searchFilterAction, setSearchFilterAction] = useState(5)

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
                setLoading(false)
            })
    }, [response])

    //if (loading === true) return <Loader></Loader>

    if (itemData === undefined) return <></>
    if (selectedMonth === undefined) setSelected(new Date())
    let listeAvVakter = mapVakter(
        itemData.filter(
            (value: Schedules) =>
                new Date(value.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
                new Date(value.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear() &&
                value.user.name.toLowerCase().includes(searchFilter) &&
                value.user.role.toLowerCase().includes(searchFilterRole.toLowerCase()) &&
                (searchFilterAction === 5 ? true : value.approve_level === searchFilterAction)
        )
    )

    // Calculate the total cost
    let totalCost_filtered = itemData.filter(
        (value: Schedules) =>
            new Date(value.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
            new Date(value.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear() &&
            value.user.name.toLowerCase().includes(searchFilter) &&
            value.user.role.toLowerCase().includes(searchFilterRole.toLowerCase()) &&
            (searchFilterAction === 5 ? true : value.approve_level === searchFilterAction)
    )

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
            <div style={{ textAlign: 'end', display: 'grid', justifyContent: 'end', gap: '10px' }}>
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
                        <option value={4}>Overført til lønn</option>
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
                                    const end_timestamp = Math.floor(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)).getTime() / 1000)
                                    recalculateSchedules(start_timestamp, end_timestamp, actionReason, approveLevel, setResponse, setResponseError)
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

            <div style={{ textAlign: 'end', display: 'flex', justifyContent: 'end' }}>
                <h3>Total kostnad: {totalCost.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</h3>
            </div>

            <div className="min-h-96" style={{ display: 'flex' }}>
                <UNSAFE_MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <UNSAFE_MonthPicker.Input {...inputProps} label="Velg måned" />
                    </div>
                </UNSAFE_MonthPicker>
                <form style={{ width: '300px', marginLeft: '30px' }}>
                    <Search label="Søk etter person" hideLabel={false} variant="simple" onChange={(text) => setSearchFilter(text)} />
                </form>
                <div style={{ width: '200px', marginLeft: '30px' }}>
                    <Select label="Velg rolle" onChange={(e) => setSearchFilterRole(e.target.value)}>
                        <option value="">Alle</option>
                        <option value="vakthaver">Vakthaver</option>
                        <option value="vaktsjef">Vaktsjef</option>
                    </Select>
                </div>
                <div style={{ width: '200px', marginLeft: '30px' }}>
                    <Select label="Filter på status" onChange={(e) => setSearchFilterAction(Number(e.target.value))}>
                        <option value={5}>Alle</option>
                        <option value={0}>Trenger godkjenning</option>
                        <option value={1}>Godkjent av ansatt</option>
                        <option value={2}>Venter på utregning</option>
                        <option value={3}>Godkjent av vaktsjef</option>
                        <option value={4}>Overført til lønn</option>
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

export default AvstemmingOkonomi
