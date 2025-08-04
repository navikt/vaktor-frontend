import { Table, Loader, MonthPicker, useMonthpicker, Search, Select, Button, Checkbox, CheckboxGroup } from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import DeleteVaktButton from './utils/DeleteVaktButton'
import EndreVaktButton from './utils/AdminAdjustDate'
import MapApproveStatus from './utils/MapApproveStatus'
import VarsleModal from './VarsleModal'
import ErrorModal from './utils/ErrorModal'
import AuditModal from './AuditModal'

const Admin = () => {
    const { user } = useAuth()
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
                        {vakter.user.ekstern === true ? (
                            <>
                                <b style={{ color: 'red' }}>EKSTERN</b>
                                <br />
                            </>
                        ) : (
                            <></>
                        )}
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
                        <div style={{ textAlign: 'center', display: 'grid', justifyContent: 'left', gap: '5px' }}>
                            <Button
                                size="small"
                                style={{
                                    height: '25px',
                                    minWidth: '170px',
                                    maxWidth: '2000px',
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
                    <MapApproveStatus status={vakter.approve_level} error={vakter.error_messages} />
                    <Table.DataCell scope="row" style={{ maxWidth: '200px', minWidth: '150px' }}>
                        {vakter.cost.length !== 0 ? <MapCost vakt={vakter} avstemming={true}></MapCost> : 'ingen beregning foreligger'}
                    </Table.DataCell>
                    <Table.DataCell scope="row" style={{ maxWidth: '250px', minWidth: '200px' }}>
                        {vakter.audits.length !== 0 ? <MapAudit audits={vakter.audits} /> : 'Ingen hendelser'}
                        {/* need to add new audits*/}
                        <br />
                        <Button
                            size="small"
                            onClick={() => {
                                setSchedule(vakter)
                                setIsAuditOpen(true)
                            }}
                        >
                            {' '}
                            Legg til audit
                        </Button>
                    </Table.DataCell>
                </Table.Row>
            ))

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
                    </Select>
                </div>
                <div style={{ width: '200px', marginLeft: '30px' }}>
                    <CheckboxGroup legend="Eksterne" onChange={(val: string[]) => setFilterExternal(val.includes('true'))}>
                        <Checkbox value="true">Skjul Eksterne</Checkbox>
                    </CheckboxGroup>
                </div>
                <div style={{ width: '200px', marginLeft: '30px', marginTop: '30px' }}>
                    <Button disabled={filteredVakter.length <= 0} onClick={() => setVarsleModalOpen(true)}>
                        Send påminnelse
                    </Button>
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
                        {loading ? <Loader /> : ''}
                        {listeAvVakter.length === 0 ? <h3 style={{ margin: 'auto', color: 'red' }}>Ingen treff</h3> : listeAvVakter}
                    </Table.Body>
                </Table>
            </div>
        </div>
    )
}

export default Admin
