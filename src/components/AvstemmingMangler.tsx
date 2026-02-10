import { Table, Loader, Search, Select, CheckboxGroup, Checkbox, Button, Popover, ExpansionCard, useMonthpicker } from '@navikt/ds-react'
import moment from 'moment'
import { Dispatch, useEffect, useRef, useState } from 'react'
import { Schedules } from '../types/types'
import MapCost from './utils/mapCost'
import MapAudit from './utils/mapAudit'
import MapApproveStatus from './utils/MapApproveStatus'
import VarsleModal from './VarsleModal'

const AvstemmingMangler = () => {
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [loading, setLoading] = useState(false)

    const [groupNames, setGroupNames] = useState<string[]>([])
    const [distinctFilenames, setDistinctFilenames] = useState<string[]>([])
    const [selectedFilename, setSelectedFilename] = useState<string>('')

    const [response, setResponse] = useState([])

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterGroup, setSearchFilterGroup] = useState('')
    const [searchFilterAction, setSearchFilterAction] = useState(9)

    const [FilterOnDoubleSchedules, setFilterOnDoubleSchedules] = useState(false)
    const [FilterExcludeCurrentMonth, setFilterExcludeCurrentMonth] = useState(false)
    const [limit300, setLimit300] = useState(false)

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)
    const [fileType, setFileType] = useState(Number)
    const [isLoading, setIsLoading] = useState(false)
    const [responseError, setResponseError] = useState('')

    const [varsleModalOpen, setVarsleModalOpen] = useState(false)

    const currentDate = new Date()
    const selectedMonth = currentDate.getMonth()

    let rowCount = 0

    const generateFile = async (schedule_ids: string[], fileType: number, setResponse: Dispatch<any>, setResponseError: Dispatch<string>) => {
        const url = `/api/generate_transactions?file_type=${fileType}`

        const fetchOptions = {
            method: 'POST',
            body: JSON.stringify(schedule_ids),
        }

        console.log('Type file: ', fileType)
        console.log('Schedule IDs: ', schedule_ids)

        await fetch(url, fetchOptions)
            .then(async (response) => {
                if (!response.ok) {
                    const rText = await response.json()
                    setResponseError(rText.detail)
                    return null // Return null instead of [] to indicate an error
                }

                // Check if the response has a file to download
                const blob = await response.blob()
                const contentDisposition = response.headers.get('Content-Disposition')
                let filename = 'downloaded-file.txt' // Default filename

                if (contentDisposition) {
                    const match = contentDisposition.match(/filename="(.+)"/)
                    if (match && match.length > 1) {
                        filename = match[1]
                    }
                }

                // Create a download link for the file
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', filename)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)

                return response.json() // Continue with processing the response as JSON if needed
            })
            .then((data) => {
                if (data) {
                    // Check if data is not null
                    setResponse(data)
                }
                setIsLoading(false)
            })
            .catch((error: Error) => {
                console.error(error.name, error.message)
                setIsLoading(false)
            })
    }

    const getStatusColor = (approveLevel: number) => {
        switch (approveLevel) {
            case 1:
                return '#66CBEC'
            case 2:
                return '#99DEAD'
            case 3:
                return '#99DEAD'
            case 4:
                return '#E18071'
            case 5:
                return '#E18071'
            case 6:
                return '#99DEAD'
            case 7:
                return '#99DEAD'
            case 8:
                return '#E18071'
            default:
                return '#FFFFFF'
        }
    }

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
                <Table.DataCell colSpan={7}>
                    <b>Koststed: {koststed}</b>
                </Table.DataCell>
            </Table.Row>,
            // These are the individual rows for the schedules
            ...schedules.map((vakter, i) => (
                <Table.Row key={`row-${vakter.id}-${i}`}>
                    <Table.DataCell style={{ padding: '6px', width: '40px' }}>{++rowCount}</Table.DataCell>
                    <Table.DataCell scope="row" style={{ padding: '8px', width: '200px' }}>
                        <div style={{ lineHeight: '1.4' }}>
                            <div style={{ fontSize: '0.9em', fontWeight: 'bold', marginBottom: '2px' }}>{vakter.user.name}</div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>{vakter.user.id.toUpperCase()}</div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>{vakter.group.name}</div>
                        </div>
                    </Table.DataCell>
                    <Table.DataCell scope="row" style={{ padding: '6px', width: '70px', fontSize: '0.85em' }}>
                        {vakter.type === 'bakvakt' ? 'bistand' : vakter.type}
                    </Table.DataCell>
                    <Table.DataCell style={{ padding: '8px', width: '220px', backgroundColor: getStatusColor(vakter.approve_level) }}>
                        <div style={{ lineHeight: '1.4' }}>
                            <div style={{ marginBottom: '4px' }}>
                                <MapApproveStatus status={vakter.approve_level} error={vakter.error_messages} />
                            </div>
                            <div style={{ fontSize: '0.8em', color: '#666', marginBottom: '2px' }}>
                                <b>ID:</b>{' '}
                                <span
                                    style={{
                                        display: 'inline-block',
                                        border: '1px solid #ccc',
                                        padding: '2px 5px',
                                        cursor: 'pointer',
                                        backgroundColor: '#f9f9f9',
                                        fontSize: '0.85em',
                                    }}
                                    onClick={() => navigator.clipboard.writeText(vakter.id)}
                                    title="Click to copy"
                                >
                                    {vakter.id}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.8em', marginBottom: '2px' }}>
                                <b>Uke:</b> {moment(vakter.start_timestamp * 1000).week()}{' '}
                                {moment(vakter.start_timestamp * 1000).week() < moment(vakter.end_timestamp * 1000).week()
                                    ? ' - ' + moment(vakter.end_timestamp * 1000).week()
                                    : ''}
                            </div>
                            <div style={{ fontSize: '0.8em' }}>
                                <b>Start:</b>{' '}
                                {new Date(vakter.start_timestamp * 1000).toLocaleString('no-NB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                            <div style={{ fontSize: '0.8em', marginTop: '2px' }}>
                                <b>Slutt:</b>{' '}
                                {new Date(vakter.end_timestamp * 1000).toLocaleString('no-NB', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </div>
                            {vakter.vakter.length !== 0 && (
                                <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                                    <b style={{ fontSize: '0.8em' }}>Endringer:</b>
                                    {vakter.vakter.map((endringer, idx: number) => (
                                        <div key={idx} style={{ marginTop: '4px', fontSize: '0.75em' }}>
                                            <div>
                                                <b>ID:</b>{' '}
                                                <span
                                                    style={{
                                                        display: 'inline-block',
                                                        border: '1px solid #ccc',
                                                        padding: '1px 3px',
                                                        cursor: 'pointer',
                                                        backgroundColor: '#f9f9f9',
                                                        fontSize: '0.9em',
                                                    }}
                                                    onClick={() => navigator.clipboard.writeText(endringer.id)}
                                                    title="Click to copy"
                                                >
                                                    {endringer.id}
                                                </span>
                                            </div>
                                            <div>
                                                <b>{endringer.type === 'bakvakt' ? 'bistand' : endringer.type}:</b> {endringer.user.name}
                                            </div>
                                            <div>
                                                <b>Start:</b>{' '}
                                                {new Date(endringer.start_timestamp * 1000).toLocaleString('no-NB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                            <div>
                                                <b>Slutt:</b>{' '}
                                                {new Date(endringer.end_timestamp * 1000).toLocaleString('no-NB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Table.DataCell>
                    <Table.DataCell scope="row" style={{ padding: '8px', width: '250px', maxWidth: '250px' }}>
                        {vakter.cost.length !== 0 ? <MapCost vakt={vakter} avstemming={true}></MapCost> : 'ingen beregning foreligger'}
                    </Table.DataCell>

                    <Table.DataCell scope="row" style={{ padding: '8px', width: '200px', maxWidth: '200px', overflow: 'hidden' }}>
                        {vakter.audits.length !== 0 ? <MapAudit audits={vakter.audits} /> : 'Ingen hendelser'}
                    </Table.DataCell>
                </Table.Row>
            )),
        ])
        return groupedRows
    }

    useEffect(() => {
        setLoading(true)
        const path = `/api/unfinished_schedules`
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
                                        /(Diff )?([Oo]verført til lønn ved fil|Sendt til utbetaling ved fil): (\w{3}-\d{2}-\d{4})(-[a-zA-Z]+(?:-diff)?)?\.txt( - Vaktor Lonn)?/
                                    const match = audit.action.match(regex)
                                    if (match) {
                                        const datePart = match[3]
                                        const optionalSuffix = match[4] || '' // Will be empty string if not present
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
    }, [response, FilterOnDoubleSchedules])

    if (itemData === undefined) return <></>

    let filteredVakter = itemData.filter((value: Schedules) => {
        const isNotCurrentMonth =
            !FilterExcludeCurrentMonth ||
            (() => {
                const currentDate = new Date()
                const currentMonth = currentDate.getMonth()
                const currentYear = currentDate.getFullYear()

                const valueDate = new Date(value.start_timestamp * 1000)
                const valueMonth = valueDate.getMonth()
                const valueYear = valueDate.getFullYear()

                return valueMonth !== currentMonth || valueYear !== currentYear
            })()

        const isNameMatch = value.user.name.toLowerCase().includes(searchFilter)
        const isGroupMatch = value.group.name.endsWith(searchFilterGroup)
        const isApproveLevelMatch =
            searchFilterAction === 9
                ? true
                : searchFilterAction === -1
                  ? value.approve_level !== 5 && value.approve_level !== 8
                  : value.approve_level === searchFilterAction
        const isFilenameMatch = selectedFilename === '' || value.audits.some((audit) => audit.action.includes(selectedFilename))
        const isLimit300Match = !limit300 || value.cost.length <= 500

        return isNotCurrentMonth && isNameMatch && isGroupMatch && isApproveLevelMatch && isFilenameMatch && isLimit300Match
    })
    // Limit the filtered schedules to 300
    if (limit300 && filteredVakter.length > 500) {
        filteredVakter = filteredVakter.slice(0, 500)
    }
    let listeAvVakter = mapVakter(filteredVakter)
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
                <ExpansionCard aria-label="generer-pr28-fil" size="small" style={{ justifyContent: 'center', width: '280px' }}>
                    <ExpansionCard.Header>
                        <ExpansionCard.Title>Generer pr28-fil</ExpansionCard.Title>
                    </ExpansionCard.Header>
                    <ExpansionCard.Content>
                        <div style={{ display: 'grid', justifyContent: 'center', gap: '10px' }}>
                            <div style={{ maxWidth: '210px', marginLeft: '30px' }}>
                                <Select label="Velg type fil" onChange={(e) => setFileType(Number(e.target.value))}>
                                    <option value="">Gjør et valg</option>
                                    <option value={1}>Ordinær kjøring</option>
                                    <option value={2}>Diff-fil</option>
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
                                disabled={isLoading || !fileType} // disable button when loading
                                ref={buttonRef}
                            >
                                Generer pr28-fil
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
                                    Er du sikker på vil generere fil for for for{' '}
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            if (filteredVakter) {
                                                generateFile(
                                                    filteredVakter.map((s) => s.id),
                                                    fileType,
                                                    setResponse,
                                                    setResponseError
                                                )
                                                setIsLoading(true)
                                            } else {
                                                console.log('Noe gikk galt :shrug:')
                                            }
                                        }}
                                        disabled={isLoading || !fileType} // disable button when loading
                                    >
                                        {isLoading ? <Loader /> : 'Generer fil nå!'}
                                    </Button>
                                    <b>{filteredVakter ? filteredVakter.map((s) => <div key={s.id}>{s.user.name}</div>) : ''} ? </b>
                                    <Button
                                        variant="danger"
                                        onClick={() => {
                                            if (filteredVakter) {
                                                generateFile(
                                                    filteredVakter.map((s) => s.id),
                                                    fileType,
                                                    setResponse,
                                                    setResponseError
                                                )
                                                setIsLoading(true)
                                            } else {
                                                console.log('Noe gikk galt :shrug:')
                                            }
                                        }}
                                        disabled={isLoading || !fileType} // disable button when loading
                                    >
                                        {isLoading ? <Loader /> : 'Generer fil nå!'}
                                    </Button>
                                </Popover.Content>
                            </Popover>
                        </div>
                    </ExpansionCard.Content>
                </ExpansionCard>
            </div>

            <div>
                {varsleModalOpen && (
                    <VarsleModal listeAvVakter={filteredVakter} handleClose={() => setVarsleModalOpen(false)} month={currentDate || new Date()} />
                )}
            </div>

            <div style={{ textAlign: 'end', display: 'grid', justifyContent: 'end', columnGap: '15px', marginTop: '15px' }}>
                <div>
                    <b>Total kostnad: {totalCost.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</b>
                </div>
                <div>
                    <b>Diff: {totalCostDiff.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</b>
                </div>
                <div>
                    <b>Antall vakter: {rowCount}</b>
                </div>
            </div>

            <div className="min-h-96" style={{ display: 'flex' }}>
                <form style={{ width: '300px', marginLeft: '15px' }}>
                    <Search label="Søk etter person" hideLabel={false} variant="simple" onChange={(text) => setSearchFilter(text)} />
                </form>
                <div style={{ width: '200px', marginLeft: '15px' }}>
                    <Select label="Velg Gruppe" onChange={(e) => setSearchFilterGroup(e.target.value)}>
                        <option value="">Alle</option>
                        {groupNames.map((groupName) => (
                            <option key={groupName} value={groupName}>
                                {groupName}
                            </option>
                        ))}
                    </Select>
                </div>
                <div style={{ width: '200px', marginLeft: '15px' }}>
                    <Select label="Velg Utbetaling" onChange={(e) => setSelectedFilename(e.target.value)}>
                        <option value="">Alle</option>
                        {distinctFilenames.map((filename) => (
                            <option key={filename} value={filename}>
                                {filename}
                            </option>
                        ))}
                    </Select>
                </div>

                <div style={{ width: '200px', marginLeft: '15px' }}>
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
                <div style={{ width: '200px', marginLeft: '15px' }}>
                    <CheckboxGroup legend="Begrens til 300" onChange={(val: string[]) => setLimit300(val.includes('true'))}>
                        <Checkbox value="true">Begrens til 500</Checkbox>
                    </CheckboxGroup>
                </div>
                <div style={{ width: '200px', marginLeft: '15px' }}>
                    <CheckboxGroup legend="Dobbel vakt" onChange={(val: string[]) => setFilterOnDoubleSchedules(val.includes('true'))}>
                        <Checkbox value="true">Er dobbeltvakt</Checkbox>
                    </CheckboxGroup>
                </div>
                <div style={{ width: '200px', marginLeft: '15px' }}>
                    <CheckboxGroup legend="!= denne måned" onChange={(val: string[]) => setFilterExcludeCurrentMonth(val.includes('true'))}>
                        <Checkbox value="true">!= denne måned</Checkbox>
                    </CheckboxGroup>
                </div>
                <div style={{ width: '200px', marginLeft: '15px', marginTop: '30px' }}>
                    <Button disabled={filteredVakter.length <= 0} onClick={() => setVarsleModalOpen(true)}>
                        Send påminnelse
                    </Button>
                </div>
            </div>
            <div>
                <Table zebraStripes>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell style={{ padding: '6px', width: '40px' }}>#</Table.HeaderCell>
                            <Table.HeaderCell scope="col" style={{ padding: '8px', width: '200px' }}>
                                Navn
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" style={{ padding: '6px', width: '70px' }}>
                                Type vakt
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                scope="col"
                                style={{
                                    padding: '8px',
                                    width: '220px',
                                }}
                            >
                                Periode
                            </Table.HeaderCell>
                            <Table.HeaderCell
                                scope="col"
                                style={{
                                    padding: '8px',
                                    width: '250px',
                                }}
                            >
                                Kost
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" style={{ padding: '8px', width: '200px', maxWidth: '200px' }}>
                                Audit
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {loading ? <Loader /> : null}
                        {listeAvVakter.length === 0 && !loading ? (
                            <Table.Row>
                                <Table.DataCell colSpan={6}>
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

export default AvstemmingMangler
