import {
    Table,
    Loader,
    Search,
    Select,
    CheckboxGroup,
    Checkbox,
    Button,
    Modal,
    Alert,
    ExpansionCard,
    GuidePanel,
    UNSAFE_Combobox,
} from '@navikt/ds-react'
import { FunnelIcon } from '@navikt/aksel-icons'
import { Dispatch, useEffect, useState } from 'react'
import { Schedules } from '../types/types'
import { mapVakter } from './utils/mapVakter'
import VarsleModal from './VarsleModal'
import { useTheme } from '../context/ThemeContext'

const SKIP_REASON_LABELS: Record<string, string> = {
    too_few_costs: 'Mangler diff (færre enn to kostberegninger)',
    wrong_approve_level: 'Feil status (ikke "Utregning fullført med diff")',
    no_approver: 'Mangler godkjenning (ingen BDM-/vaktsjef-audit)',
}

interface DiffPreviewIncluded {
    schedule_id: string
    user_name: string
    koststed: string
    diff: string
}

interface DiffPreviewSkipped {
    schedule_id: string
    reason: string
}

interface DiffPreview {
    included: DiffPreviewIncluded[]
    skipped: DiffPreviewSkipped[]
    total_diff: string
    included_count: number
    skipped_count: number
}

const STATUS_OPTIONS = [
    { value: 0, label: 'Trenger godkjenning' },
    { value: 1, label: 'Godkjent av ansatt' },
    { value: 2, label: 'Venter på utregning' },
    { value: 3, label: 'Godkjent av vaktsjef' },
    { value: 4, label: 'Godkjent av BDM' },
    { value: 5, label: 'Overført til lønn' },
    { value: 6, label: 'Venter på utregning av diff' },
    { value: 7, label: 'Utregning fullført med diff' },
    { value: 8, label: 'Overført til lønn etter rekjøring' },
    { value: -1, label: 'Ikke overført lønn' },
]

const AvstemmingMangler = () => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [loading, setLoading] = useState(false)

    const [groupNames, setGroupNames] = useState<string[]>([])
    const [distinctFilenames, setDistinctFilenames] = useState<string[]>([])
    const [selectedFilename, setSelectedFilename] = useState<string>('')

    const [response, setResponse] = useState([])

    const [searchFilter, setSearchFilter] = useState('')
    const [searchFilterGroup, setSearchFilterGroup] = useState('')
    const [searchFilterActions, setSearchFilterActions] = useState<string[]>([])

    const [FilterOnDoubleSchedules, setFilterOnDoubleSchedules] = useState(false)
    const [FilterExcludeCurrentMonth, setFilterExcludeCurrentMonth] = useState(false)
    const [sluttetFilter, setSluttetFilter] = useState<'alle' | 'sluttet' | 'ikke'>('alle')
    const [limit300, setLimit300] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

    const yearOptions = Array.from({ length: new Date().getFullYear() - 2022 + 1 }, (_, i) => 2022 + i).reverse()

    const [idSearchResults, setIdSearchResults] = useState<Schedules[] | null>(null)
    const [idSearchLoading, setIdSearchLoading] = useState(false)
    const [idSearchError, setIdSearchError] = useState<string | null>(null)

    const [openState, setOpenState] = useState<boolean>(false)
    const [fileType, setFileType] = useState(Number)
    const [isLoading, setIsLoading] = useState(false)
    const [responseError, setResponseError] = useState('')

    // Diff-forhåndsvisning før opplasting til ØT
    const [diffPreview, setDiffPreview] = useState<DiffPreview | null>(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewError, setPreviewError] = useState<string | null>(null)

    const [varsleModalOpen, setVarsleModalOpen] = useState(false)

    const currentDate = new Date()
    const selectedMonth = currentDate.getMonth()

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
                    // 409: en annen pod/bruker kjører allerede en diff-kjøring
                    setResponseError(rText.detail || rText.message || 'Noe gikk galt under generering av fil')
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

                // Filen er lastet ned + lastet opp til ØT. Lukk modal og nullstill preview.
                setOpenState(false)
                setDiffPreview(null)

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

    // Hent forhåndsvisning av diff-fila (les-only, ingen opplasting) og åpne modal.
    const openGenerateModal = async () => {
        setResponseError('')
        setOpenState(true)

        // Forhåndsvisning gjelder kun diff-fil (fileType 2). Ordinær kjøring
        // har ingen preview-endepunkt, så da viser vi bare bekreftelse.
        if (fileType !== 2) {
            setDiffPreview(null)
            setPreviewError(null)
            return
        }

        setPreviewLoading(true)
        setPreviewError(null)
        setDiffPreview(null)
        try {
            const r = await fetch('/api/preview_transactions_diff', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(displayedVakter.map((s) => s.id)),
            })
            if (!r.ok) {
                const err = await r.json()
                setPreviewError(err.message || 'Kunne ikke hente forhåndsvisning')
            } else {
                setDiffPreview(await r.json())
            }
        } catch {
            setPreviewError('Nettverksfeil under forhåndsvisning')
        } finally {
            setPreviewLoading(false)
        }
    }

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    const searchByIds = async (input: string) => {
        const ids = input
            .split(/[\s,]+/)
            .map((s) => s.trim())
            .filter((s) => UUID_REGEX.test(s))

        if (ids.length === 0) {
            setIdSearchResults(null)
            setIdSearchError(null)
            return
        }

        setIdSearchLoading(true)
        setIdSearchError(null)

        try {
            const r = await fetch('/api/schedules_by_ids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ids),
            })
            if (!r.ok) {
                const err = await r.json()
                setIdSearchError(err.message || 'Fant ingen vakter')
                setIdSearchResults([])
            } else {
                const data = await r.json()
                setIdSearchResults(data)
            }
        } catch {
            setIdSearchError('Nettverksfeil')
            setIdSearchResults([])
        } finally {
            setIdSearchLoading(false)
        }
    }

    useEffect(() => {
        const fetchSchedules = async () => {
            setLoading(true)
            const path = `/api/unfinished_schedules?year=${selectedYear}`
            try {
                const scheduleRes = await fetch(path)
                const itemData = await scheduleRes.json()

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
            } catch (error) {
                console.error('Failed to fetch schedules:', error)
                setLoading(false)
            }
        }

        fetchSchedules()
    }, [response, FilterOnDoubleSchedules, selectedYear])

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
            searchFilterActions.length === 0 || STATUS_OPTIONS.some((s) => searchFilterActions.includes(s.label) && s.value === value.approve_level)
        const isFilenameMatch = selectedFilename === '' || value.audits.some((audit) => audit.action.includes(selectedFilename))
        const isLimit300Match = !limit300 || value.cost.length <= 500
        const isSluttetMatch = sluttetFilter === 'alle' || (sluttetFilter === 'sluttet' ? !!value.user.sluttet_dato : !value.user.sluttet_dato)

        return isNotCurrentMonth && isNameMatch && isGroupMatch && isApproveLevelMatch && isFilenameMatch && isLimit300Match && isSluttetMatch
    })
    // Limit the filtered schedules to 300
    if (limit300 && filteredVakter.length > 500) {
        filteredVakter = filteredVakter.slice(0, 500)
    }

    const displayedVakter = idSearchResults !== null ? idSearchResults : filteredVakter

    let listeAvVakter = mapVakter({
        vaktliste: displayedVakter,
        isDarkMode,
    })

    const { totalCost, totalCostDiff } = displayedVakter.reduce(
        (acc, schedule) => {
            if (!schedule || !Array.isArray(schedule.cost) || schedule.cost.length === 0) return acc
            // Sorter på order_id slik at "siste/nest siste" er konsistent med
            // backend (select_diff_costs), uavhengig av rekkefølgen API-et gir.
            const costs = [...schedule.cost].sort((a, b) => Number(a.order_id) - Number(b.order_id))
            acc.totalCost += Number(costs[costs.length - 1].total_cost) || 0
            // Diff teller kun vakter som faktisk havner i diff-fila: status 7
            // (Utregning fullført med diff) + minst to kostberegninger. Slik
            // matcher denne summen preview-/fil-diffen, ikke hele utvalget.
            if (costs.length >= 2 && schedule.approve_level === 7) {
                acc.totalCostDiff += (Number(costs[costs.length - 1].total_cost) || 0) - (Number(costs[costs.length - 2].total_cost) || 0)
            }
            return acc
        },
        { totalCost: 0, totalCostDiff: 0 }
    )

    const activeFilterCount = [
        searchFilterGroup !== '',
        selectedFilename !== '',
        searchFilterActions.length > 0,
        FilterOnDoubleSchedules,
        FilterExcludeCurrentMonth,
        sluttetFilter !== 'alle',
        limit300,
    ].filter(Boolean).length

    const resetFilters = () => {
        setSearchFilterGroup('')
        setSelectedFilename('')
        setSearchFilterActions([])
        setFilterOnDoubleSchedules(false)
        setFilterExcludeCurrentMonth(false)
        setSluttetFilter('alle')
        setLimit300(false)
    }

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
                <GuidePanel style={{ height: 'fit-content', maxWidth: '400px' }}>
                    <p>Sjekk vaktperioder som mangler utbetaling og generer PR28-fil for innsending til ØT.</p>
                </GuidePanel>

                <div
                    style={{
                        display: 'grid',
                        gap: '8px',
                        padding: '15px',
                        backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                        borderRadius: '4px',
                        minWidth: '220px',
                        justifySelf: 'center',
                    }}
                >
                    <div style={{ fontSize: '0.9em', fontWeight: 'bold', marginBottom: '5px' }}>Oppsummering</div>
                    <div>
                        <b>Total kostnad: {totalCost.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</b>
                    </div>
                    <div title="Sum diff for vakter som havner i diff-fila (status 7). Samme tall som forhåndsvisningen.">
                        <b>Diff (til fil): {totalCostDiff.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</b>
                    </div>
                    <div>
                        <b>Antall vakter: {displayedVakter.length}</b>
                    </div>
                </div>

                <div style={{ width: '280px' }}>
                    <ExpansionCard aria-label="generer-pr28-fil" size="small">
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
                                    onClick={openGenerateModal}
                                    style={{
                                        maxWidth: '210px',
                                        marginLeft: '30px',
                                        marginTop: '5px',
                                        marginBottom: '5px',
                                    }}
                                    disabled={isLoading || !fileType || displayedVakter.length === 0}
                                >
                                    {fileType === 2 ? 'Forhåndsvis diff' : 'Generer pr28-fil'}
                                </Button>
                            </div>
                        </ExpansionCard.Content>
                    </ExpansionCard>
                </div>
            </div>

            <Modal
                open={openState}
                onClose={() => setOpenState(false)}
                header={{ heading: fileType === 2 ? 'Forhåndsvis diff-fil' : 'Bekreft generering av pr28-fil' }}
                width={fileType === 2 ? 700 : 450}
            >
                <Modal.Body>
                    {responseError && (
                        <Alert variant="error" style={{ marginBottom: '1rem' }}>
                            {responseError}
                        </Alert>
                    )}

                    {fileType === 2 ? (
                        <>
                            {previewLoading && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Loader size="small" /> Henter forhåndsvisning...
                                </div>
                            )}
                            {previewError && <Alert variant="error">{previewError}</Alert>}
                            {!previewLoading && !previewError && diffPreview && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                        <div>
                                            <b>Blir med i fila:</b> {diffPreview.included_count}
                                        </div>
                                        <div>
                                            <b>Hoppes over:</b> {diffPreview.skipped_count}
                                        </div>
                                        <div>
                                            <b>Total diff:</b> {Number(diffPreview.total_diff).toLocaleString('no-NO', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>

                                    {diffPreview.skipped_count > 0 && (
                                        <Alert variant="warning" size="small">
                                            {diffPreview.skipped_count} vakt(er) blir <b>ikke</b> med i fila. Se «Hoppes over» under.
                                        </Alert>
                                    )}

                                    {diffPreview.included_count > 0 && (
                                        <div>
                                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Blir med ({diffPreview.included_count})</div>
                                            <div
                                                style={{
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
                                                    borderRadius: '4px',
                                                }}
                                            >
                                                <Table size="small" zebraStripes>
                                                    <Table.Header>
                                                        <Table.Row>
                                                            <Table.HeaderCell>Navn</Table.HeaderCell>
                                                            <Table.HeaderCell>Koststed</Table.HeaderCell>
                                                            <Table.HeaderCell align="right">Diff</Table.HeaderCell>
                                                        </Table.Row>
                                                    </Table.Header>
                                                    <Table.Body>
                                                        {diffPreview.included.map((row) => (
                                                            <Table.Row key={row.schedule_id}>
                                                                <Table.DataCell>{row.user_name}</Table.DataCell>
                                                                <Table.DataCell>{row.koststed || '—'}</Table.DataCell>
                                                                <Table.DataCell align="right">
                                                                    {Number(row.diff).toLocaleString('no-NO', { minimumFractionDigits: 2 })}
                                                                </Table.DataCell>
                                                            </Table.Row>
                                                        ))}
                                                    </Table.Body>
                                                </Table>
                                            </div>
                                        </div>
                                    )}

                                    {diffPreview.skipped_count > 0 && (
                                        <div>
                                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Hoppes over ({diffPreview.skipped_count})</div>
                                            <div
                                                style={{
                                                    maxHeight: '160px',
                                                    overflowY: 'auto',
                                                    border: isDarkMode ? '1px solid #444' : '1px solid #ddd',
                                                    borderRadius: '4px',
                                                }}
                                            >
                                                <Table size="small" zebraStripes>
                                                    <Table.Header>
                                                        <Table.Row>
                                                            <Table.HeaderCell>Vakt-ID</Table.HeaderCell>
                                                            <Table.HeaderCell>Grunn</Table.HeaderCell>
                                                        </Table.Row>
                                                    </Table.Header>
                                                    <Table.Body>
                                                        {diffPreview.skipped.map((row) => (
                                                            <Table.Row key={row.schedule_id}>
                                                                <Table.DataCell style={{ fontFamily: 'monospace', fontSize: '0.8em' }}>
                                                                    {row.schedule_id}
                                                                </Table.DataCell>
                                                                <Table.DataCell>{SKIP_REASON_LABELS[row.reason] || row.reason}</Table.DataCell>
                                                            </Table.Row>
                                                        ))}
                                                    </Table.Body>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p>
                            Er du sikker på at du vil generere pr28-fil (ordinær kjøring) for <b>{displayedVakter.length}</b> vakt(er)?
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="danger"
                        loading={isLoading}
                        disabled={
                            isLoading ||
                            !fileType ||
                            (fileType === 2 && (previewLoading || !!previewError || !diffPreview || diffPreview.included_count === 0))
                        }
                        onClick={() => {
                            setIsLoading(true)
                            generateFile(
                                displayedVakter.map((s) => s.id),
                                fileType,
                                setResponse,
                                setResponseError
                            )
                        }}
                    >
                        {fileType === 2 ? 'Last opp til ØT' : 'Generer fil nå!'}
                    </Button>
                    <Button variant="tertiary" onClick={() => setOpenState(false)} disabled={isLoading}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>

            <div>
                {varsleModalOpen && (
                    <VarsleModal listeAvVakter={displayedVakter} handleClose={() => setVarsleModalOpen(false)} month={currentDate || new Date()} />
                )}
            </div>

            {/* Filter section */}
            <div
                style={{
                    padding: '12px 16px',
                    backgroundColor: isDarkMode ? '#1f1f1f' : '#fff',
                    border: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0',
                    borderRadius: '6px',
                    marginBottom: '16px',
                }}
            >
                {/* Primary row - always visible */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
                    <div style={{ width: '120px' }}>
                        <Select label="År" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ width: '280px' }}>
                        <Search
                            label="Søk etter person eller vakt-ID"
                            hideLabel={false}
                            variant="simple"
                            onChange={(text) => {
                                setSearchFilter(text)
                                if (!text.trim()) {
                                    setIdSearchResults(null)
                                    setIdSearchError(null)
                                }
                            }}
                            onSearchClick={() => searchByIds(searchFilter)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') searchByIds(searchFilter)
                            }}
                        />
                        {idSearchLoading && <span style={{ fontSize: '0.8em' }}>Søker...</span>}
                        {idSearchError && <span style={{ fontSize: '0.8em', color: '#c00' }}>{idSearchError}</span>}
                    </div>
                    <Button
                        variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
                        size="medium"
                        icon={<FunnelIcon aria-hidden />}
                        onClick={() => setShowFilters((v) => !v)}
                    >
                        Filtre{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                    </Button>
                    {activeFilterCount > 0 && (
                        <Button variant="tertiary" size="medium" onClick={resetFilters}>
                            Nullstill filtre
                        </Button>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                        <Button disabled={displayedVakter.length <= 0} onClick={() => setVarsleModalOpen(true)} variant="secondary">
                            Send påminnelse
                        </Button>
                    </div>
                </div>

                {/* Secondary row - expandable */}
                {showFilters && (
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '12px',
                            alignItems: 'flex-end',
                            marginTop: '12px',
                            paddingTop: '12px',
                            borderTop: isDarkMode ? '1px solid #333' : '1px solid #e0e0e0',
                        }}
                    >
                        <div style={{ width: '180px' }}>
                            <Select label="Gruppe" value={searchFilterGroup} onChange={(e) => setSearchFilterGroup(e.target.value)}>
                                <option value="">Alle</option>
                                {groupNames.map((groupName) => (
                                    <option key={groupName} value={groupName}>
                                        {groupName}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div style={{ width: '180px' }}>
                            <Select label="Utbetaling" value={selectedFilename} onChange={(e) => setSelectedFilename(e.target.value)}>
                                <option value="">Alle</option>
                                {distinctFilenames.map((filename) => (
                                    <option key={filename} value={filename}>
                                        {filename}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div style={{ width: '260px' }}>
                            <UNSAFE_Combobox
                                label="Status"
                                options={STATUS_OPTIONS.map((s) => s.label)}
                                isMultiSelect
                                selectedOptions={searchFilterActions}
                                onToggleSelected={(option, isSelected) =>
                                    setSearchFilterActions((prev) => (isSelected ? [...prev, option] : prev.filter((o) => o !== option)))
                                }
                            />
                        </div>
                        <div style={{ width: '180px' }}>
                            <Select
                                label="Sluttet"
                                value={sluttetFilter}
                                onChange={(e) => setSluttetFilter(e.target.value as 'alle' | 'sluttet' | 'ikke')}
                            >
                                <option value="alle">Alle</option>
                                <option value="sluttet">Har sluttet</option>
                                <option value="ikke">Har ikke sluttet</option>
                            </Select>
                        </div>
                        <CheckboxGroup
                            legend=""
                            hideLegend
                            value={[
                                ...(FilterOnDoubleSchedules ? ['double'] : []),
                                ...(FilterExcludeCurrentMonth ? ['excludeCurrent'] : []),
                                ...(limit300 ? ['limit'] : []),
                            ]}
                            onChange={(val: string[]) => {
                                setFilterOnDoubleSchedules(val.includes('double'))
                                setFilterExcludeCurrentMonth(val.includes('excludeCurrent'))
                                setLimit300(val.includes('limit'))
                            }}
                        >
                            <Checkbox value="double">Kun dobbeltvakter</Checkbox>
                            <Checkbox value="excludeCurrent">!= denne måned</Checkbox>
                            <Checkbox value="limit">Begrens til 500</Checkbox>
                        </CheckboxGroup>
                    </div>
                )}
            </div>
            <div>
                <Table zebraStripes>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell style={{ padding: '6px', width: '40px' }}>#</Table.HeaderCell>
                            <Table.HeaderCell scope="col" style={{ padding: '8px', width: '200px' }}>
                                Navn
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

export default AvstemmingMangler
