import { Modal, Button, Table, Alert, Heading, Box, Detail, VStack, HStack, DatePicker, useDatepicker } from '@navikt/ds-react'
import { TrashIcon } from '@navikt/aksel-icons'
import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'
import { useTheme } from '../context/ThemeContext'

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

const BulkDeleteSchedules = ({ groupId, disabled = false, onDeleted }: BulkDeleteSchedulesProps) => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
    const [open, setOpen] = useState(false)
    const [previewData, setPreviewData] = useState<DeletePreviewData | null>(null)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [startDate, setStartDate] = useState<Date | undefined>(new Date())
    const [endDate, setEndDate] = useState<Date | undefined>(DateTime.now().plus({ years: 1 }).toJSDate())

    const startTimestamp = startDate ? Math.floor(startDate.getTime() / 1000) : Math.floor(Date.now() / 1000)
    const endTimestamp = endDate ? Math.floor(endDate.getTime() / 1000) : Math.floor(DateTime.now().plus({ years: 1 }).toMillis() / 1000)

    const { datepickerProps: startDatepickerProps, inputProps: startInputProps } = useDatepicker({
        onDateChange: setStartDate,
        defaultSelected: startDate,
    })

    const {
        datepickerProps: endDatepickerProps,
        inputProps: endInputProps,
        setSelected: setSelectedEnd,
    } = useDatepicker({
        onDateChange: setEndDate,
        defaultSelected: endDate,
    })

    useEffect(() => {
        const fetchLastSchedule = async () => {
            try {
                const response = await fetch(`/api/last_schedule?group_id=${groupId}`)
                if (response.ok) {
                    const lastSchedule = await response.json()
                    if (lastSchedule && lastSchedule.end_timestamp) {
                        // Set end date to +1 day from last schedule
                        const lastDate = new Date(lastSchedule.end_timestamp * 1000)
                        const nextDay = DateTime.fromJSDate(lastDate).plus({ days: 1 }).toJSDate()
                        setEndDate(nextDay)
                        setSelectedEnd(nextDay)
                    }
                }
            } catch (error) {
                console.error('Error fetching last schedule:', error)
            }
        }

        if (groupId) {
            fetchLastSchedule()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId])

    const fetchPreview = async () => {
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch(
                `/api/bulk_delete_preview?group_id=${groupId}&start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' } }
            )

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.detail || 'Kunne ikke hente forhåndsvisning')
                return
            }

            setPreviewData(await response.json())
            setOpen(true)
        } catch {
            setError('Nettverksfeil')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setDeleting(true)
        setError('')

        try {
            const response = await fetch(`/api/bulk_delete?group_id=${groupId}&start_timestamp=${startTimestamp}&end_timestamp=${endTimestamp}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
                const errorData = await response.json()
                setError(errorData.detail || 'Kunne ikke slette')
                return
            }

            const data = await response.json()
            setSuccess(`Slettet ${data.deleted_count} vakter`)
            setOpen(false)
            onDeleted?.()
        } catch {
            setError('Nettverksfeil')
        } finally {
            setDeleting(false)
        }
    }

    const cannotDeleteTotal = previewData
        ? previewData.cannot_delete_approved_count + previewData.cannot_delete_too_soon_count + previewData.cannot_delete_type_count
        : 0

    return (
        <>
            <Box
                style={{
                    maxWidth: '400px',
                    padding: '1rem',
                    background: isDarkMode ? '#2a2a2a' : '#f3f4f6',
                    borderRadius: '8px',
                    border: isDarkMode ? '1px solid #444' : 'none',
                }}
            >
                <Heading size="small" spacing>
                    Slett vakter i periode
                </Heading>
                <Detail spacing>Sletter ikke-godkjente vakter som starter mer enn 4 uker frem.</Detail>

                <VStack gap="space-4">
                    <HStack gap="space-4">
                        <div style={{ flex: 1 }}>
                            <DatePicker {...startDatepickerProps}>
                                <DatePicker.Input {...startInputProps} label="Fra" />
                            </DatePicker>
                        </div>
                        <div style={{ flex: 1 }}>
                            <DatePicker {...endDatepickerProps}>
                                <DatePicker.Input {...endInputProps} label="Til" />
                            </DatePicker>
                        </div>
                    </HStack>

                    <Button variant="secondary" onClick={fetchPreview} loading={loading} disabled={disabled} icon={<TrashIcon />}>
                        Forhåndsvis sletting
                    </Button>

                    {success && (
                        <Alert variant="success" size="small">
                            {success}
                        </Alert>
                    )}
                    {error && !open && (
                        <Alert variant="error" size="small">
                            {error}
                        </Alert>
                    )}
                </VStack>
            </Box>

            <Modal open={open} onClose={() => setOpen(false)} header={{ heading: 'Bekreft sletting' }}>
                <Modal.Body>
                    {previewData && (
                        <VStack gap="space-4">
                            <Alert variant={previewData.can_delete_count > 0 ? 'info' : 'warning'} size="small">
                                <strong>{previewData.can_delete_count}</strong> vakter kan slettes
                                {cannotDeleteTotal > 0 && (
                                    <>
                                        , <strong>{cannotDeleteTotal}</strong> kan ikke slettes
                                    </>
                                )}
                            </Alert>

                            {previewData.can_delete_count > 0 && (
                                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                                    <Table size="small" zebraStripes>
                                        <Table.Header>
                                            <Table.Row>
                                                <Table.HeaderCell>Bruker</Table.HeaderCell>
                                                <Table.HeaderCell>Periode</Table.HeaderCell>
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {previewData.can_delete.slice(0, 20).map((p, i) => (
                                                <Table.Row key={i}>
                                                    <Table.DataCell>{p.user_id}</Table.DataCell>
                                                    <Table.DataCell>
                                                        {p.start_date} – {p.end_date}
                                                    </Table.DataCell>
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table>
                                    {previewData.can_delete.length > 20 && <Detail>+ {previewData.can_delete.length - 20} flere</Detail>}
                                </div>
                            )}

                            {error && (
                                <Alert variant="error" size="small">
                                    {error}
                                </Alert>
                            )}
                        </VStack>
                    )}
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
