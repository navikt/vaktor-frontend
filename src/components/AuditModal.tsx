import React, { useState } from 'react'
import { Modal, TextField, Button, Heading, BodyShort } from '@navikt/ds-react'

type Props = {
    open: boolean
    onClose: () => void
    scheduleId: string
}

const AuditModal: React.FC<Props> = ({ open, onClose, scheduleId }) => {
    const [action, setAction] = useState('')
    const [changedBy, setChangedBy] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        const payload = {
            schedule_id: scheduleId,
            action: action,
        }

        try {
            const res = await fetch('/api/add_audit_to_schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                throw new Error(await res.text())
            }

            setAction('')
            setChangedBy('')
            onClose()
        } catch (err) {
            setError((err as Error).message || 'Noe gikk galt')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal open={open} onClose={onClose} aria-label="Legg til audit">
            <Modal.Header>
                <Heading size="medium">Legg til audit</Heading>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <TextField label="Handling (action)" value={action} onChange={(e) => setAction(e.target.value)} required />

                    {error && <BodyShort className="text-red-600">{error}</BodyShort>}
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button type="submit" onClick={handleSubmit} loading={isSubmitting}>
                    Lagre
                </Button>
                <Button variant="tertiary" onClick={onClose}>
                    Avbryt
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AuditModal
