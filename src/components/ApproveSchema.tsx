import { Button, Table, Loader, Select, MonthPicker, useMonthpicker, HelpText, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState, Dispatch } from 'react'
import { Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import MapApproveStatus from './utils/MapApproveStatus'

let today = Date.now() / 1000

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
                <Table.DataCell>
                    <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                        {/* {vakter.vakter.length !== 0 ? "Endringer:" : ""} */}
                        {vakter.vakter.map((endringer, idx: number) => (
                            <div key={idx}>
                                <b> {endringer.type}:</b> {endringer.user.name} <br />
                                {new Date(endringer.start_timestamp * 1000).toLocaleString('no-NB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                                <br />
                                {new Date(endringer.end_timestamp * 1000).toLocaleString('no-NB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                        ))}
                    </div>
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
                <MapApproveStatus status={vakter.approve_level} error={vakter.error_messages} />
                <Table.DataCell style={{ minWidth: '300px' }}>
                    {vakter.cost.length !== 0 ? <MapCost vakt={vakter}></MapCost> : 'ingen beregning foreligger'}
                </Table.DataCell>
                <Table.DataCell>{vakter.audits.length !== 0 ? <MapAudit audits={vakter.audits} /> : 'Ingen hendelser'}</Table.DataCell>
            </Table.Row>
        ))

    useEffect(() => {
        setLoading(true)
        Promise.all([fetch('/api/get_current_user_schedules')])
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

    currentDate.setMonth(currentDate.getMonth() + 1) // Move to the next month
    currentDate.setDate(0) // Go to the last day of the previous month (last day of the current month)
    currentDate.setHours(23, 59) // Set to 23:59

    if (!selectedMonth) return []

    if (!selectedMonth) return []

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
    if (listeAvVakter.length === 0) return <>Ingen vakter funnet</>
    return (
        <>
            <div
                style={{
                    minWidth: '900px',
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
                    <div style={{ width: '200px', marginLeft: '30px' }}>
                        <CheckboxGroup legend="Vis hele året" onChange={(val: string[]) => setFilterYear(val.includes('true'))}>
                            <Checkbox value="true">Vis alle vakter for {selectedMonth.getFullYear()} </Checkbox>
                        </CheckboxGroup>
                    </div>
                </div>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">Gruppe</Table.HeaderCell>
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
