import { Modal, Button, Table, Alert, Heading, BodyShort, Box, Detail } from '@navikt/ds-react'
import { useState } from 'react'
import styled from 'styled-components'

interface PreviewPeriod {
    start_timestamp: number
    end_timestamp: number
    start_date: string
    end_date: string
    user_id: string
    week_numbers: string
}

interface OverlappingPeriod {
    start_date: string
    end_date: string
    user_id: string
}

interface PreviewWarning {
    message: string
    overlapping_count: number
    overlapping_periods: OverlappingPeriod[]
}

interface PreviewData {
    start_date: string
    end_date: string
    total_periods: number
    periods: PreviewPeriod[]
    rollover_day: number
    rollover_time: number
    warning?: PreviewWarning
}

interface SchedulePreviewProps {
    groupId: string
    userIds: string[]
    startTimestamp: number
    endTimestamp: number
    rolloverDay: number
    rolloverTime: number
    onConfirm: () => void
    disabled?: boolean
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
    max-height: 500px;
    overflow-y: auto;
    border: 2px solid var(--a-border-default);
    border-radius: var(--a-border-radius-medium);
    background-color: var(--a-surface-default);
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

const WeekBadge = styled.span`
    display: inline-block;
    padding: var(--a-spacing-1) var(--a-spacing-2);
    background-color: var(--a-deepblue-600);
    color: white;
    border-radius: var(--a-border-radius-small);
    font-size: 0.75rem;
    font-weight: 600;
`

const SchedulePreview = ({
    groupId,
    userIds,
    startTimestamp,
    endTimestamp,
    rolloverDay,
    rolloverTime,
    onConfirm,
    disabled = false,
}: SchedulePreviewProps) => {
    const [open, setOpen] = useState(false)
    const [previewData, setPreviewData] = useState<PreviewData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchPreview = async () => {
        setLoading(true)
        setError('')

        console.log('[SchedulePreview] Fetching with endTimestamp:', endTimestamp)
        const url = `/api/preview_schedule?group_id=${groupId}&start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}&rollover_day=${rolloverDay}&rollover_time=${rolloverTime}`
        console.log('[SchedulePreview] Full URL:', url)
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userIds),
        }

        try {
            const response = await fetch(url, fetchOptions)
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

    const handleConfirm = () => {
        setOpen(false)
        onConfirm()
    }

    return (
        <>
            <Button
                variant="secondary"
                onClick={fetchPreview}
                loading={loading}
                disabled={disabled}
                style={{
                    minWidth: '210px',
                    marginBottom: '15px',
                }}
            >
                Forhåndsvisning
            </Button>

            <Modal open={open} onClose={() => setOpen(false)} aria-label="Forhåndsvisning av vaktplan">
                <Modal.Header>
                    <Heading size="medium">Forhåndsvisning av vaktplan</Heading>
                </Modal.Header>
                <Modal.Body>
                    {previewData && (
                        <>
                            {previewData.warning && (
                                <Alert variant="warning" style={{ marginBottom: 'var(--a-spacing-4)' }}>
                                    <Heading size="small" spacing>
                                        Advarsel: Overlappende vakter
                                    </Heading>
                                    <BodyShort spacing>{previewData.warning.message}</BodyShort>
                                    <BodyShort>Antall overlappende vakter: {previewData.warning.overlapping_count}</BodyShort>
                                    {previewData.warning.overlapping_periods.length > 0 && (
                                        <>
                                            <BodyShort spacing style={{ marginTop: 'var(--a-spacing-3)' }}>
                                                <strong>Eksempler på overlappende vakter:</strong>
                                            </BodyShort>
                                            <Table size="small">
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.HeaderCell>Bruker</Table.HeaderCell>
                                                        <Table.HeaderCell>Fra</Table.HeaderCell>
                                                        <Table.HeaderCell>Til</Table.HeaderCell>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {previewData.warning.overlapping_periods.map((period, idx) => (
                                                        <Table.Row key={idx}>
                                                            <Table.DataCell>{period.user_id}</Table.DataCell>
                                                            <Table.DataCell>{period.start_date}</Table.DataCell>
                                                            <Table.DataCell>{period.end_date}</Table.DataCell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table>
                                        </>
                                    )}
                                </Alert>
                            )}

                            <TableContainer>
                                <StyledTable size="small" zebraStripes>
                                    <Table.Header>
                                        <Table.Row>
                                            <Table.HeaderCell scope="col" style={{ width: '140px' }}>
                                                Bruker
                                            </Table.HeaderCell>
                                            <Table.HeaderCell scope="col">Fra</Table.HeaderCell>
                                            <Table.HeaderCell scope="col">Til</Table.HeaderCell>
                                            <Table.HeaderCell scope="col" style={{ width: '120px' }}>
                                                Uker
                                            </Table.HeaderCell>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {previewData.periods.slice(0, 100).map((period, idx) => (
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
                                                <Table.DataCell>
                                                    <WeekBadge>Uke {period.week_numbers}</WeekBadge>
                                                </Table.DataCell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </StyledTable>
                            </TableContainer>
                            {previewData.periods.length > 100 && (
                                <Box paddingBlock="space-2">
                                    <Detail>Viser 100 av {previewData.periods.length} perioder</Detail>
                                </Box>
                            )}
                        </>
                    )}

                    {error && <Alert variant="error">{error}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Avbryt
                    </Button>
                    {previewData && !previewData.warning && (
                        <Button variant="primary" onClick={handleConfirm}>
                            Bekreft og opprett vakter
                        </Button>
                    )}
                    {previewData && previewData.warning && (
                        <Button variant="primary" disabled>
                            Kan ikke opprette (overlapp)
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default SchedulePreview
