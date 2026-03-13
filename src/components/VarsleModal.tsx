import { useState } from 'react'
import { Alert, Button, Modal, Radio, RadioGroup } from '@navikt/ds-react'
import { Schedules } from '../types/types'
import { useTheme } from '../context/ThemeContext'

const VarsleModal = (props: { listeAvVakter: Schedules[]; handleClose: Function; month: Date }) => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'

    const [selectedHowRadio, setSelectedHowRadio] = useState('slack')
    const [selectedRoleRadio, setSelectedRoleRadio] = useState('vakthaver')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

    const selectedMonth = props.month.toLocaleString('nb-NO', { month: 'long' })

    const handleSendAlert = async () => {
        setIsSubmitting(true)
        setResult(null)
        try {
            const response = await fetch('/api/send_alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: selectedHowRadio,
                    month: selectedMonth,
                    role: selectedRoleRadio,
                    schedule_ids: props.listeAvVakter.map((s) => s.id),
                }),
            })
            if (response.ok) {
                setResult({ ok: true, message: `Varsel sendt til ${props.listeAvVakter.length} vakter via ${selectedHowRadio}.` })
            } else {
                const err = await response.json().catch(() => ({}))
                setResult({ ok: false, message: err?.detail || `Feil ved sending av varsel (HTTP ${response.status}).` })
            }
        } catch (e) {
            setResult({ ok: false, message: 'Nettverksfeil – klarte ikke å sende varsel.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="py-12">
            <Modal open={true} onClose={() => props.handleClose()} header={{ heading: 'Varsle ledere' }} width={600}>
                <Modal.Body>
                    <p>
                        <strong>Måned: </strong> {selectedMonth}
                    </p>

                    {result && (
                        <Alert variant={result.ok ? 'success' : 'error'} style={{ marginBottom: '1rem' }}>
                            {result.message}
                        </Alert>
                    )}

                    {!result?.ok && (
                        <form method="dialog" id="alertForm">
                            <div>
                                <RadioGroup legend="Hvem skal varsles?" onChange={(val: string) => setSelectedRoleRadio(val)} size="small">
                                    <Radio value="vakthaver">Vakthaver</Radio>
                                    <Radio value="vaktsjef">Vaktsjef</Radio>
                                    <Radio value="leveranseleder">Leveranseleder</Radio>
                                    <Radio value="bdm">BDM</Radio>
                                </RadioGroup>

                                <RadioGroup legend="Hvor skal varslet?" onChange={(val: string) => setSelectedHowRadio(val)} size="small">
                                    <Radio value="slack">Slack</Radio>
                                    <Radio value="email">Email</Radio>
                                </RadioGroup>
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                Vil varsle om {props.listeAvVakter.length} vakter:
                                <div
                                    style={{
                                        padding: '10px',
                                        marginTop: '10px',
                                        border: isDarkMode ? '1px solid #444' : '1px solid #ccc',
                                        borderRadius: '5px',
                                        backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
                                    }}
                                >
                                    {props.listeAvVakter.map((schedule, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                background: isDarkMode ? '#1a1a1a' : '#f0f0f0',
                                                margin: '5px 0',
                                                padding: '5px',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            {schedule.id} --- {schedule.user.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {result?.ok ? (
                        <Button onClick={() => props.handleClose()}>Lukk</Button>
                    ) : (
                        <>
                            <Button onClick={handleSendAlert} loading={isSubmitting}>
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
