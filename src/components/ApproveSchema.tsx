import { Button, Table, Loader, Select, MonthPicker, useMonthpicker } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState, Dispatch } from 'react'
import { Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'

let today = Date.now() / 1000
//let today = 1668470400  // 15. November 2022 00:00:00

const confirm_schedule = async (schedule_id: string, setResponse: Dispatch<any>, setLoading: Dispatch<any>) => {
    setLoading(true)

    await fetch(`/vaktor/api/confirm_schedule?schedule_id=${schedule_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false)
            setResponse(data)
        })
}

const disprove_schedule = async (schedule_id: string, setResponse: Dispatch<any>, setLoading: Dispatch<any>) => {
    setLoading(true)
    await fetch(`/vaktor/api/disprove_schedule?schedule_id=${schedule_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false)
            setResponse(data)
        })
}

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
                maxWidth: '210px',
                minWidth: '200px',
            }}
        >
            {statusText}
        </Table.DataCell>
    )
}

const DineVakter = () => {
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [response, setResponse] = useState()
    const [loading, setLoading] = useState(false)

    const [searchFilterAction, setSearchFilterAction] = useState(5)

    const { monthpickerProps, inputProps, selectedMonth, setSelected } = useMonthpicker({
        fromDate: new Date('Oct 01 2022'),
        toDate: new Date('Aug 23 2025'),
        defaultSelected: new Date(
            new Date().getDate() - 10 > 0
                ? moment().locale('en-GB').format('ll')
                : moment()
                      .locale('en-GB')
                      .month(moment().month() - 1)
                      .format('ll')
        ),
    })

    const mapVakter = (vaktliste: Schedules[]) =>
        vaktliste.map((vakter: Schedules, index: number) => (
            //approve_level = 2;
            <Table.Row key={vakter.id}>
                <Table.HeaderCell scope="row">{vakter.group.name}</Table.HeaderCell>
                <Table.DataCell>
                    <b>{vakter.type}</b>
                    <br />
                    Uke {moment(vakter.start_timestamp * 1000).week()}{' '}
                    {moment(vakter.start_timestamp * 1000).week() < moment(vakter.end_timestamp * 1000).week()
                        ? ' - ' + moment(vakter.end_timestamp * 1000).week()
                        : ''}
                    <br />
                    Fra:{' '}
                    {new Date(vakter.start_timestamp * 1000).toLocaleString('no-NB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                    <br />
                    Til:{' '}
                    {new Date(vakter.end_timestamp * 1000).toLocaleString('no-NB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Table.DataCell>
                <Table.DataCell style={{ maxWidth: '230px' }}>
                    <div>
                        <Button
                            disabled={vakter.approve_level != 0 || vakter.end_timestamp > today}
                            style={{
                                height: '30px',
                                marginBottom: '5px',
                                minWidth: '210px',
                            }}
                            onClick={() => confirm_schedule(vakter.id, setResponse, setLoading)}
                        >
                            {' '}
                            {loading ? <Loader /> : 'Godkjenn'}
                        </Button>

                        <Button
                            disabled={vakter.approve_level != 1}
                            style={{
                                backgroundColor: '#f96c6c',
                                height: '30px',
                                minWidth: '210px',
                            }}
                            onClick={() => disprove_schedule(vakter.id, setResponse, setLoading)}
                        >
                            {' '}
                            {loading ? <Loader /> : 'Avgodkjenn'}
                        </Button>
                    </div>
                </Table.DataCell>
                {mapApproveStatus(vakter.approve_level)}
                <Table.DataCell style={{ minWidth: '300px' }}>
                    {vakter.cost.length !== 0 ? <MapCost vakt={vakter}></MapCost> : 'ingen beregning foreligger'}
                </Table.DataCell>
                <Table.DataCell>{vakter.audits.length !== 0 ? <MapAudit audits={vakter.audits} /> : 'Ingen hendelser'}</Table.DataCell>
            </Table.Row>
        ))

    useEffect(() => {
        setLoading(true)
        Promise.all([fetch('/vaktor/api/get_current_user_schedules')])
            .then(async ([scheduleRes]) => {
                const schedulejson = await scheduleRes.json()
                return [schedulejson]
            })
            .then(([itemData]) => {
                itemData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)

                setItemData(itemData)
                setLoading(false)
            })
    }, [response])

    // if (loading === true) return <Loader></Loader>
    if (selectedMonth === undefined) setSelected(new Date())
    if (itemData === undefined) return <></>

    let listeAvVakter = mapVakter(
        itemData.filter(
            (value: Schedules) =>
                // value.user_id.toLowerCase() !== user.id.toLowerCase() &&
                new Date(value.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
                new Date(value.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear() &&
                (searchFilterAction === 5 ? true : value.approve_level === searchFilterAction)
        )
    )

    return (
        <>
            <div
                style={{
                    minWidth: '900px',
                    maxWidth: '1200px',
                    backgroundColor: 'white',
                    marginBottom: '3vh',
                    display: 'grid',
                    alignContent: 'center',
                    margin: 'auto',
                }}
            >
                {' '}
                <div style={{ display: 'flex' }}>
                    <MonthPicker {...monthpickerProps}>
                        <div className="grid gap-4">
                            <MonthPicker.Input {...inputProps} label="Velg måned" />
                        </div>
                    </MonthPicker>
                    <div></div>

                    <div style={{ width: '200px', marginLeft: '30px' }}>
                        <Select label="Filtrer på status" onChange={(e) => setSearchFilterAction(Number(e.target.value))}>
                            <option value={5}>Alle</option>
                            <option value={0}>Trenger godkjenning</option>
                            <option value={1}>Godkjent av ansatt</option>
                            <option value={2}>Venter på utregning</option>
                            <option value={3}>Godkjent av vaktsjef</option>
                            <option value={4}>Overført til lønn</option>
                        </Select>
                    </div>
                </div>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">Gruppe</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Actions</Table.HeaderCell>
                            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
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
