import { Button, Table, Loader, UNSAFE_MonthPicker, UNSAFE_useMonthpicker, Search, Select, HelpText, Modal } from '@navikt/ds-react'
import moment from 'moment'
import { useEffect, useState, Dispatch } from 'react'
import { useAuth } from '../context/AuthContext'
import { Schedules } from '../types/types'
import ApproveButton from './utils/ApproveButton'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import ErrorModal from './utils/ErrorModal'

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

const AdminLeder = ({}) => {
    const { user } = useAuth()

    const [itemData, setItemData] = useState<Schedules[]>([])
    const [response, setResponse] = useState()
    const [loading, setLoading] = useState(false)
    const [openState, setOpenState] = useState(false)

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterRole, setSearchFilterRole] = useState('')
    const [searchFilterAction, setSearchFilterAction] = useState(5)

    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const showErrorModal = (message: string) => {
        setErrorMessage(message)
    }

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

    const confirm_schedule = async (schedule_id: string, setResponse: Dispatch<any>) => {
        try {
            const response = await fetch(`/vaktor/api/confirm_schedule?schedule_id=${schedule_id}`)
            const { data } = await response.json()
            setResponse(data)
            setItemData((prevData) =>
                prevData.map((vakter) => {
                    if (vakter.id === schedule_id) {
                        return {
                            ...vakter,
                            approve_level: vakter.approve_level === 0 ? 1 : 2,
                        }
                    }
                    return vakter
                })
            )
        } catch (error) {
            console.error(error)
            showErrorModal(`Feilet ved godkjenning av perioden: ${schedule_id}`)
        }
        setLoading(false)
        setOpenState(false)
    }

    const disprove_schedule = async (schedule_id: string, setResponse: Dispatch<any>) => {
        try {
            const response = await fetch(`/vaktor/api/disprove_schedule?schedule_id=${schedule_id}`)
            const data = await response.json()
            setResponse(data)
            setItemData((prevData) =>
                prevData.map((vakter) => {
                    if (vakter.id === schedule_id) {
                        vakter.approve_level = 0 // update the approve_level value to 0 after successful API call
                    }
                    return vakter
                })
            )
        } catch (error) {
            console.error(error)
            showErrorModal(`Feilet ved avvisning av perioden: ${error}`)
        }
    }

    const mapVakter = (vaktliste: Schedules[]) =>
        vaktliste.map((vakter: Schedules, i: number) => (
            //approve_level = 2;

            <Table.Row key={i}>
                <Table.HeaderCell scope="row">
                    {vakter.user.name}
                    <br />
                    {vakter.group.name}
                </Table.HeaderCell>
                <Table.DataCell scope="row">{vakter.type}</Table.DataCell>
                <Table.DataCell>
                    <div>
                        Uke {moment(vakter.start_timestamp * 1000).week()}{' '}
                        {moment(vakter.start_timestamp * 1000).week() < moment(vakter.end_timestamp * 1000).week()
                            ? ' - ' + moment(vakter.end_timestamp * 1000).week()
                            : ''}
                        <br />
                        {new Date(vakter.start_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                        <br />
                        {new Date(vakter.end_timestamp * 1000).toLocaleString('no-NB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
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
                <Table.DataCell style={{ maxWidth: '220px', minWidth: '220px' }}>
                    <div>
                        {vakter.user_id.toLowerCase() === user.id.toLowerCase() ? (
                            <></>
                        ) : (
                            <>
                                {vakter.approve_level === 0 ? (
                                    <>
                                        <ApproveButton
                                            vakt={vakter}
                                            setResponse={setResponse}
                                            confirmSchedule={confirm_schedule}
                                            setLoading={setLoading}
                                            loading={loading}
                                        />
                                    </>
                                ) : (
                                    <ApproveButton
                                        vakt={vakter}
                                        setResponse={setResponse}
                                        confirmSchedule={confirm_schedule}
                                        setLoading={setLoading}
                                        loading={loading}
                                    />
                                )}

                                <Button
                                    disabled={
                                        loading ||
                                        vakter.user_id.toLowerCase() === user.id.toLowerCase() ||
                                        vakter.approve_level === 0 ||
                                        vakter.approve_level === 2 ||
                                        vakter.approve_level === 4
                                    }
                                    style={{
                                        backgroundColor: '#f96c6c',
                                        height: '30px',
                                        minWidth: '210px',
                                    }}
                                    onClick={() => disprove_schedule(vakter.id, setResponse)}
                                >
                                    {' '}
                                    {loading ? <Loader /> : 'Avgodkjenn'}
                                </Button>
                            </>
                        )}
                    </div>
                </Table.DataCell>
                {mapApproveStatus(vakter.approve_level)}
                {['personalleder', 'leveranseleder', 'okonomi'].includes(user.role) || user.is_admin ? (
                    <Table.DataCell scope="row" style={{ maxWidth: '200px', minWidth: '300px' }}>
                        {vakter.cost.length !== 0 ? <MapCost cost={vakter.cost}></MapCost> : 'ingen beregning foreligger'}
                    </Table.DataCell>
                ) : null}

                <Table.DataCell scope="row" style={{ maxWidth: '250px', minWidth: '200px' }}>
                    {vakter.audits.length !== 0 ? <MapAudit audits={vakter.audits} /> : 'Ingen hendelser'}
                </Table.DataCell>
            </Table.Row>
        ))

    useEffect(() => {
        setLoading(true)
        Modal.setAppElement('#__next')
        fetch('/vaktor/api/leader_schedules')
            .then((scheduleRes) => scheduleRes.json())
            .then((itemData) => {
                itemData.sort((a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp)
                setItemData(itemData)
                setLoading(false)
            })
    }, [response])

    if (itemData === undefined) return <></>
    if (selectedMonth === undefined) setSelected(new Date())
    let listeAvVakter = mapVakter(
        itemData.filter(
            (value: Schedules) =>
                // value.user_id.toLowerCase() !== user.id.toLowerCase() &&
                new Date(value.start_timestamp * 1000).getMonth() === selectedMonth!.getMonth() &&
                new Date(value.start_timestamp * 1000).getFullYear() === selectedMonth!.getFullYear() &&
                value.user.name.toLowerCase().includes(searchFilter) &&
                value.user.role.toLowerCase().includes(searchFilterRole.toLowerCase()) &&
                (searchFilterAction === 5 ? true : value.approve_level === searchFilterAction)
        )
    )
    return (
        <>
            <ErrorModal errorMessage={errorMessage} onClose={() => setErrorMessage(null)} />

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
                    <Select label="Velg handling" onChange={(e) => setSearchFilterAction(Number(e.target.value))}>
                        <option value={5}>Alle</option>
                        <option value={0}>Trenger godkjenning</option>
                        <option value={1}>Godkjent av ansatt</option>
                        <option value={2}>Venter på utregning</option>
                        <option value={3}>Godkjent av vaktsjef</option>
                        <option value={4}>Overført til lønn</option>
                    </Select>
                </div>
            </div>

            <Table
                style={{
                    minWidth: '900px',
                    backgroundColor: 'white',
                    marginBottom: '3vh',
                    marginTop: '2vh',
                }}
            >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Type vakt</Table.HeaderCell>
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
                                    <b>Hvem vises i vaktplanen:</b> Kun den personen med aktiv vakt vises i vaktplanen. Endringen vil legge seg oppå
                                    opprinnelig vakt for angitte periode
                                </HelpText>
                            </div>
                        </Table.HeaderCell>
                        <Table.HeaderCell scope="col">Actions</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                        {['personalleder', 'leveranseleder'].includes(user!.role) || user.is_admin ? (
                            <Table.HeaderCell scope="col">Kostnad</Table.HeaderCell>
                        ) : null}

                        <Table.HeaderCell scope="col">Audit</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {listeAvVakter.length === 0 ? (
                        <h3 style={{ margin: 'auto', color: 'red' }}>{loading ? <Loader /> : 'Ingen treff!'}</h3>
                    ) : (
                        listeAvVakter
                    )}
                </Table.Body>
            </Table>
        </>
    )
}

export default AdminLeder
function setItemData(arg0: (prevData: { id: string; approve_level: number }[]) => { id: string; approve_level: number }[]) {
    throw new Error('Function not implemented.')
}
