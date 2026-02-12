import { useEffect, useState } from 'react'
import { Button, Modal, Radio, RadioGroup } from '@navikt/ds-react'
import { Schedules } from '../types/types'
import { useTheme } from '../context/ThemeContext'

const send_alert = async (data: any) => {
    const response = await fetch('/api/send_alert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    if (response.ok) {
        const responseBody = await response.json()
        console.log('Response: ', responseBody)
    } else {
        const errorMessage = await response.json()
        console.error('Error: ', errorMessage)
    }
}
const VarsleModal = (props: { listeAvVakter: Schedules[]; handleClose: Function; month: Date }) => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'

    useEffect(() => {}, [])

    const [selectedHowRadio, setSelectedHowRadio] = useState('slack')
    const [selectedRoleRadio, setSelectedRoleRadio] = useState('vakthaver')

    const selectedMonth = props.month.toLocaleString('nb-NO', { month: 'long' })

    const handleHowRadioChange = (val: string) => {
        setSelectedHowRadio(val)
    }

    const handleWhoRadioChange = (val: string) => {
        setSelectedRoleRadio(val)
    }

    const handleSendAlert = () => {
        const data = {
            type: selectedHowRadio,
            month: selectedMonth,
            role: selectedRoleRadio,
            schedule_ids: props.listeAvVakter.map((schedule) => schedule.id),
        }
        send_alert(data)
    }

    return (
        <div className="py-12">
            <Modal open={true} onClose={() => props.handleClose()} header={{ heading: 'Varsle ledere' }} width={600}>
                <Modal.Body>
                    {/* Make the month text bold */}
                    <p>
                        <strong>Måned: </strong> {selectedMonth}
                    </p>
                    <form method="dialog" id="alertForm" onSubmit={() => alert('Form submitted')}>
                        <div>
                            <RadioGroup legend="Hvem skal varlses?" onChange={(val: string) => handleWhoRadioChange(val)} size="small">
                                <Radio value="vakthaver">Vakthaver</Radio>
                                <Radio value="vaktsjef">Vaktsjef</Radio>
                                <Radio value="leveranseleder">Leveranseleder</Radio>
                                <Radio value="bdm">BDM</Radio>
                            </RadioGroup>

                            <RadioGroup legend="Hvor skal varslet?" onChange={(val: string) => handleHowRadioChange(val)} size="small">
                                <Radio value="slack">Slack</Radio>
                                <Radio value="email">Email</Radio>
                            </RadioGroup>
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            Vil varsle om {props.listeAvVakter.length} vakter:
                            {/* Highlight the schedules */}
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
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleSendAlert}>Send Alert</Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default VarsleModal
