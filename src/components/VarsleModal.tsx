import { useState } from 'react'
import { Alert, Button, Modal } from '@navikt/ds-react'
import { Schedules } from '../types/types'
import { useTheme } from '../context/ThemeContext'

const ROLE_LABELS: Record<string, string> = {
    vakthaver: 'Vakthaver',
    vaktsjef: 'Vaktsjef',
    leveranseleder: 'Leveranseleder',
    bdm: 'BDM',
}

const NOTIFIABLE_LEVELS = new Set([0, 1, 3])

const getTargetRole = (schedule: Schedules): string | null => {
    const level = schedule.approve_level
    if (!NOTIFIABLE_LEVELS.has(level)) return null
    if (level === 1) {
        const isVaktsjef =
            schedule.user.group_roles?.some((gr) => gr.group_id === schedule.group_id && gr.role?.title?.toLowerCase() === 'vaktsjef') ||
            schedule.user.roles?.some((r) => r.title?.toLowerCase() === 'vaktsjef')
        return isVaktsjef ? 'leveranseleder' : 'vaktsjef'
    }
    if (level === 3) return 'bdm'
    return 'vakthaver'
}

const groupByRole = (vakter: Schedules[]): Record<string, Schedules[]> =>
    vakter.reduce<Record<string, Schedules[]>>((acc, s) => {
        const role = getTargetRole(s)
        if (!role) return acc
        if (!acc[role]) acc[role] = []
        acc[role].push(s)
        return acc
    }, {})

const VarsleModal = (props: { listeAvVakter: Schedules[]; handleClose: Function; month: Date }) => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

    const selectedMonth = props.month.toLocaleString('nb-NO', { month: 'long' })
    const grouped = groupByRole(props.listeAvVakter)
    const notifiableCount = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0)
    const skippedCount = props.listeAvVakter.length - notifiableCount

    const handleSendAlert = async () => {
        setIsSubmitting(true)
        setResult(null)
        try {
            const calls = Object.entries(grouped).flatMap(([role, schedules]) =>
                (['slack', 'email'] as const).map((type) =>
                    fetch('/api/send_alert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type,
                            month: selectedMonth,
                            role,
                            schedule_ids: schedules.map((s) => s.id),
                        }),
                    })
                )
            )

            const responses = await Promise.all(calls)
            const anyFailed = responses.some((r) => !r.ok)
            const allFailed = responses.every((r) => !r.ok)

            if (allFailed) {
                setResult({ ok: false, message: 'Alle varselforsøk feilet. Prøv igjen.' })
            } else if (anyFailed) {
                setResult({ ok: true, message: `Varsel delvis sendt for ${props.listeAvVakter.length} vakter (Slack + e-post). Noen forsøk feilet.` })
            } else {
                setResult({ ok: true, message: `Varsel sendt til ${props.listeAvVakter.length} vakter via Slack og e-post.` })
            }
        } catch (e) {
            setResult({ ok: false, message: 'Nettverksfeil – klarte ikke å sende varsel.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="py-12">
            <Modal open={true} onClose={() => props.handleClose()} header={{ heading: 'Send påminnelse' }} width={600}>
                <Modal.Body>
                    <p>
                        <strong>Måned: </strong> {selectedMonth}
                    </p>
                    <p style={{ marginTop: '8px', color: isDarkMode ? '#b0b0b0' : '#666' }}>
                        Varsler sendes via <strong>Slack og e-post</strong> til riktig godkjenningsnivå basert på vaktstatus.
                    </p>

                    {result && (
                        <Alert variant={result.ok ? 'success' : 'error'} style={{ marginTop: '1rem' }}>
                            {result.message}
                        </Alert>
                    )}

                    {!result?.ok && (
                        <div style={{ marginTop: '16px' }}>
                            {skippedCount > 0 && (
                                <p style={{ fontSize: '0.85rem', color: isDarkMode ? '#b0b0b0' : '#666', marginBottom: '10px' }}>
                                    {skippedCount} vakt{skippedCount !== 1 ? 'er' : ''} med annen status er ekskludert og varsles ikke.
                                </p>
                            )}
                            {notifiableCount === 0 && <Alert variant="info">Ingen vakter med status som krever varsling.</Alert>}
                            {Object.entries(grouped).map(([role, schedules]) => (
                                <div key={role} style={{ marginBottom: '12px' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '4px', color: isDarkMode ? '#fff' : '#000' }}>
                                        Varsles: {ROLE_LABELS[role] ?? role} ({schedules.length} vakter)
                                    </div>
                                    <div
                                        style={{
                                            padding: '8px',
                                            border: isDarkMode ? '1px solid #444' : '1px solid #ccc',
                                            borderRadius: '5px',
                                            backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                                        }}
                                    >
                                        {schedules.map((schedule, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    background: isDarkMode ? '#1a1a1a' : '#f0f0f0',
                                                    margin: '4px 0',
                                                    padding: '5px',
                                                    borderRadius: '5px',
                                                }}
                                            >
                                                {schedule.id} — {schedule.user.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {result?.ok ? (
                        <Button onClick={() => props.handleClose()}>Lukk</Button>
                    ) : (
                        <>
                            <Button onClick={handleSendAlert} loading={isSubmitting} disabled={notifiableCount === 0}>
                                Send varsel
                            </Button>
                            <Button variant="tertiary" onClick={() => props.handleClose()} disabled={isSubmitting}>
                                Avbryt
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default VarsleModal
