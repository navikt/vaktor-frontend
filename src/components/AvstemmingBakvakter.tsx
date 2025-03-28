import { Table, Loader, MonthPicker, useMonthpicker, ReadMore, Search, Select } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Audit, Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapApproveStatus from './utils/MapApproveStatus'

const mapAudit = (audit: Audit[]) => {
    return audit
        .sort((a: Audit, b: Audit) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((audit: Audit, index) => {
            const tmp_timestamp = new Date(audit.timestamp).getTime() + 3600000
            const auditTimestamp = new Date(tmp_timestamp).toLocaleString()
            return (
                <div key={audit.id}>
                    <ReadMore
                        header={auditTimestamp.slice(0, 20).replace('T', ' ')}
                        size="small"
                        style={audit.action.includes('Avgodkjent') ? { color: 'red' } : { color: 'green' }}
                    >
                        {audit.action} - {audit.user.name}
                    </ReadMore>
                </div>
            )
        })
}

const AvstemmingBakvakter = () => {
    const { user } = useAuth()
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [response, setResponse] = useState()
    const [loading, setLoading] = useState(false)

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterType, setSearchFilterType] = useState('bakvakt')
    const [searchFilterAction, setSearchFilterAction] = useState(5)

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
                      .format('MMM Y')
        ),
    })

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
                    <Table.DataCell scope="row">{vakter.type}</Table.DataCell>
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
                    </Table.DataCell>
                    <MapApproveStatus status={vakter.approve_level} error={vakter.error_messages} />
                    {['personalleder', 'leveranseleder', 'okonomi'].includes(user.role) && (
                        <Table.DataCell scope="row" style={{ maxWidth: '200px', minWidth: '150px' }}>
                            {vakter.cost ? <MapCost cost={vakter.cost} avstemming={true}></MapCost> : 'ingen beregning foreligger'}
                        </Table.DataCell>
                    )}
                    <Table.DataCell scope="row" style={{ maxWidth: '250px', minWidth: '200px' }}>
                        {vakter.audits ? mapAudit(vakter.audits) : 'Ingen hendelser'}
                    </Table.DataCell>
                </Table.Row>
            ))

    useEffect(() => {
        setLoading(true)
        fetch(`/api/get_all_bakvakter?type=${searchFilterType}`)
            .then(async (scheduleRes) => scheduleRes.json())
            .then((itemData) => {
                itemData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)

                setItemData(itemData.filter((data: Schedules) => data.user.ekstern === false))
                setLoading(false)
            })
    }, [response, searchFilterType])

    if (loading === true) return <Loader></Loader>

    if (itemData === undefined) return <></>
    if (selectedMonth === undefined) setSelected(new Date())
    let listeAvVakter = mapVakter(
        itemData.filter(
            (value: Schedules) =>
                new Date(value.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
                new Date(value.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear() &&
                value.user.name.toLowerCase().includes(searchFilter) &&
                (searchFilterAction === 5 ? true : value.approve_level === searchFilterAction)
        )
    )
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
                    <Select label="Velg vakttype" onChange={(e) => setSearchFilterType(e.target.value)} value={searchFilterType}>
                        <option value="bakvakt">Bakvakt</option>
                        <option value="bistand">Bistand</option>
                        <option value="bytte">Bytte</option>
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
                            {['personalleder', 'leveranseleder', 'okonomi'].includes(user.role) && (
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
                        {listeAvVakter.length === 0 ? <h3 style={{ margin: 'auto', color: 'red' }}>Ingen treff</h3> : listeAvVakter}
                    </Table.Body>
                </Table>
            </div>
        </div>
    )
}

export default AvstemmingBakvakter
