import { Modal, Button, Table, Alert, Heading, BodyShort, Box, Detail, Panel, VStack, HStack, Tooltip } from '@navikt/ds-react'
import { TrashIcon, CalendarIcon, InformationSquareIcon, InformationIcon } from '@navikt/aksel-icons'
import { useState } from 'react'
import styled from 'styled-components'
import { DateTime } from 'luxon'

interface DeletePeriod {
    id: string
    start_date: string
    end_date: string
    user_id: string
    type: string
}

interface CannotDeletePeriod extends DeletePeriod {
    approve_level: number
    reason: string
}

interface DeletePreviewData {
    start_date: string
    end_date: string
    min_delete_date: string
    total_schedules: number
    can_delete_count: number
    cannot_delete_approved_count: number
    cannot_delete_too_soon_count: number
    cannot_delete_type_count: number
    can_delete: DeletePeriod[]
    cannot_delete_examples: CannotDeletePeriod[]
}

interface BulkDeleteSchedulesProps {
    groupId: string
    disabled?: boolean
    onDeleted?: () => void
}

const StyledTable = styled(Table)`
    .navds-table__header-cell {
        background-color: var(--a-blue-100);
        color: var(--a-text-default);
        font-weight: 600;
        position: sticky;
        top: 0;
        z-index: 1;
    }

    .navds-table__data-cell {
        padding: var(--a-spacing-4);
    }
`

const TableContainer = styled.div`
    max-height: 400px;
    overflow-y: auto;
    border: 2px solid var(--a-border-default);
    border-radius: var(--a-border-radius-medium);
    background-color: var(--a-surface-default);
    margin-bottom: var(--a-spacing-4);
`

const UserBadge = styled.span`
    display: inline-block;
    padding: var(--a-spacing-1) var(--a-spacing-3);
    background-color: var(--a-blue-600);
    color: white;
    border-radius: var(--a-border-radius-medium);
    font-weight: 600;
    font-size: 0.875rem;
`

const DateText = styled.span`
    font-family: 'Source Code Pro', monospace;
    font-size: 0.875rem;
    color: var(--a-text-default);
    font-weight: 500;
`

const InfoBox = styled(Box)`
    background-color: var(--a-surface-info-subtle);
    padding: var(--a-spacing-4);
    border-radius: var(--a-border-radius-medium);
    margin-bottom: var(--a-spacing-4);
`

const ModernCard = styled(Box)`
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    padding: 1.5rem;
    transition: box-shadow 0.2s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
`

const HeaderSection = styled(Box)`
    background: linear-gradient(135deg, #e6f0ff 0%, #f5f8ff 100%);
    padding: 1.25rem 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`

const BulkDeleteSchedules = ({ groupId, disabled = false, onDeleted }: BulkDeleteSchedulesProps) => {
    const [open, setOpen] = useState(false)
    const [previewData, setPreviewData] = useState<DeletePreviewData | null>(null)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Default til å slette alt fra nå til 1 år frem
    const [startTimestamp, setStartTimestamp] = useState(() => Math.floor(Date.now() / 1000))
    const [endTimestamp, setEndTimestamp] = useState(() => Math.floor(DateTime.now().plus({ years: 1 }).toMillis() / 1000))

    const fetchPreview = async () => {
        setLoading(true)
        setError('')
        setSuccess('')

        const url = `/api/bulk_delete_preview?group_id=${groupId}&start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.detail || 'Kunne ikke hente forhåndsvisning')
                setLoading(false)
                return
            }

            const data = await response.json()
            setPreviewData(data)
            setOpen(true)
        } catch (err) {
            setError('Nettverksfeil ved henting av forhåndsvisning')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        setError('')

        const url = `/api/bulk_delete?group_id=${groupId}&start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.detail || 'Kunne ikke slette vakter')
                setDeleting(false)
                return
            }

            const data = await response.json()
            setSuccess(`${data.message}`)
            setOpen(false)

            // Notify parent component to refresh
            if (onDeleted) {
                onDeleted()
            }
        } catch (err) {
            setError('Nettverksfeil ved sletting av vakter')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <>
            <Box style={{ maxWidth: '600px' }}>
                <HeaderSection>
                    <TrashIcon style={{ fontSize: '1.75rem', color: '#0067C5' }} />
                    <Heading size="large" style={{ margin: 0 }}>
                        Slett vaktplan
                    </Heading>
                    <Tooltip content="Sletter alle ikke-godkjente vakter (approve_level = 0) som starter mer enn 4 uker frem i tid.">
                        <Button variant="tertiary" size="small" icon={<InformationIcon />} />
                    </Tooltip>
                </HeaderSection>

                <ModernCard>
                    <VStack gap="5">
                        <div>
                            <label className="navds-label" htmlFor="fromDate">Fra dato</label>
                            <input
                                id="fromDate"
                                className="navds-text-field__input"
                                type="date"
                                value={DateTime.fromSeconds(startTimestamp).toISODate() || ''}
                                onChange={(e) => {
                                    const date = DateTime.fromISO(e.target.value)
                                    if (date.isValid) {
                                        setStartTimestamp(Math.floor(date.toSeconds()))
                                    }
                                }}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                        <div>
                            <label className="navds-label" htmlFor="toDate">Til dato</label>
                            <input
                                id="toDate"
                                className="navds-text-field__input"
                                type="date"
                                value={DateTime.fromSeconds(endTimestamp).toISODate() || ''}
                                onChange={(e) => {
                                    const date = DateTime.fromISO(e.target.value)
                                    if (date.isValid) {
                                        setEndTimestamp(Math.floor(date.toSeconds()))
                                    }
                                }}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>

                        <Button
                            variant="primary"
                            onClick={fetchPreview}
                            loading={loading}
                            disabled={disabled}
                            icon={<CalendarIcon title="Forhåndsvis" />}
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            size="medium"
                        >
                            Forhåndsvis sletting
                        </Button>

                        {success && <Alert variant="success">{success}</Alert>}
                        {error && <Alert variant="error">{error}</Alert>}
                    </VStack>
                </ModernCard>
            </Box>

            <Modal open={open} onClose={() => setOpen(false)} aria-label="Forhåndsvisning av sletting" width="medium">
                <Modal.Header>
                    <Heading size="medium">Forhåndsvisning av sletting</Heading>
                </Modal.Header>
                <Modal.Body>
                    {previewData && (
                        <>
                            <InfoBox>
                                <Heading size="small" spacing>
                                    Oppsummering
                                </Heading>
                                <BodyShort>
                                    Periode: {previewData.start_date} - {previewData.end_date}
                                </BodyShort>
                                <BodyShort>Minimum slettedato: {previewData.min_delete_date}</BodyShort>
                                <BodyShort>Totalt antall vakter i perioden: {previewData.total_schedules}</BodyShort>
                                <BodyShort style={{ fontWeight: 600, color: 'var(--a-text-success)' }}>
                                    Kan slettes: {previewData.can_delete_count}
                                </BodyShort>
                                <BodyShort style={{ color: 'var(--a-text-warning)' }}>
                                    Kan ikke slettes:{' '}
                                    {previewData.cannot_delete_approved_count +
                                        previewData.cannot_delete_too_soon_count +
                                        previewData.cannot_delete_type_count}
                                </BodyShort>
                            </InfoBox>

                            {previewData.can_delete_count > 0 && (
                                <>
                                    <Heading size="small" spacing>
                                        Vakter som vil bli slettet ({previewData.can_delete_count})
                                    </Heading>
                                    <TableContainer>
                                        <StyledTable size="small" zebraStripes>
                                            <Table.Header>
                                                <Table.Row>
                                                    <Table.HeaderCell>Bruker</Table.HeaderCell>
                                                    <Table.HeaderCell>Fra</Table.HeaderCell>
                                                    <Table.HeaderCell>Til</Table.HeaderCell>
                                                </Table.Row>
                                            </Table.Header>
                                            <Table.Body>
                                                {previewData.can_delete.slice(0, 50).map((period, idx) => (
                                                    <Table.Row key={idx}>
                                                        <Table.DataCell>
                                                            <UserBadge>{period.user_id}</UserBadge>
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <DateText>{period.start_date}</DateText>
                                                        </Table.DataCell>
                                                        <Table.DataCell>
                                                            <DateText>{period.end_date}</DateText>
                                                        </Table.DataCell>
                                                    </Table.Row>
                                                ))}
                                            </Table.Body>
                                        </StyledTable>
                                    </TableContainer>
                                    {previewData.can_delete.length > 50 && (
                                        <Box paddingBlock="2">
                                            <Detail>Viser 50 av {previewData.can_delete.length} vakter som vil bli slettet</Detail>
                                        </Box>
                                    )}
                                </>
                            )}

                            {previewData.cannot_delete_examples.length > 0 && (
                                <>
                                    <Alert variant="warning" style={{ marginTop: 'var(--a-spacing-4)' }}>
                                        <Heading size="small" spacing>
                                            Vakter som IKKE kan slettes
                                        </Heading>
                                        <BodyShort spacing>Vakter kan ikke slettes hvis de:</BodyShort>
                                        <ul>
                                            <li>Er godkjent (approve_level != 0): {previewData.cannot_delete_approved_count} vakter</li>
                                            <li>Starter innenfor 4 uker: {previewData.cannot_delete_too_soon_count} vakter</li>
                                            <li>Ikke er ordinær vakt: {previewData.cannot_delete_type_count} vakter</li>
                                        </ul>
                                    </Alert>

                                    {previewData.cannot_delete_examples.length > 0 && (
                                        <Box paddingBlock="4">
                                            <Heading size="small" spacing>
                                                Eksempler på vakter som ikke kan slettes
                                            </Heading>
                                            <Table size="small">
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.HeaderCell>Bruker</Table.HeaderCell>
                                                        <Table.HeaderCell>Fra</Table.HeaderCell>
                                                        <Table.HeaderCell>Årsak</Table.HeaderCell>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {previewData.cannot_delete_examples.map((period, idx) => (
                                                        <Table.Row key={idx}>
                                                            <Table.DataCell>{period.user_id}</Table.DataCell>
                                                            <Table.DataCell>
                                                                <DateText>{period.start_date}</DateText>
                                                            </Table.DataCell>
                                                            <Table.DataCell>{period.reason}</Table.DataCell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table>
                                        </Box>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {error && <Alert variant="error">{error}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Avbryt
                    </Button>
                    {previewData && previewData.can_delete_count > 0 && (
                        <Button variant="danger" onClick={handleDelete} loading={deleting}>
                            Slett {previewData.can_delete_count} vakter
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default BulkDeleteSchedules
