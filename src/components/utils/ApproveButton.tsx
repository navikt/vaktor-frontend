import { Button, Popover } from '@navikt/ds-react'
import { Dispatch, useRef, useState } from 'react'
import { Schedules } from '../../types/types'

interface Props {
    vakt: Schedules
    setResponse: Dispatch<any>
    confirmSchedule: (scheduleId: string, setResponse: Dispatch<any>) => Promise<void>
}

const ApproveButton: React.FC<Props> = ({ vakt, setResponse, confirmSchedule }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)

    const handleApproveClick = async () => {
        setOpenState(false)
        await confirmSchedule(vakt.id, setResponse)
    }

    const isDisabled = vakt.end_timestamp > Date.now() / 1000 || vakt.approve_level === 4 || vakt.approve_level === 3 || vakt.approve_level === 2

    return (
        <>
            <Button
                onClick={() => {
                    setOpenState(true)
                }}
                style={{
                    height: '30px',
                    marginBottom: '5px',
                    minWidth: '210px',
                }}
                size="small"
                ref={buttonRef}
                disabled={isDisabled}
            >
                Godkjenn
            </Button>
            <Popover open={openState} onClose={() => setOpenState(false)} anchorEl={buttonRef.current}>
                <Popover.Content
                    style={{
                        backgroundColor: 'rgba(241, 241, 241, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        width: '250px',
                    }}
                >
                    Er du sikker på at du vil godkjenne denne perioden på vegne av vakthaver?
                    <Button
                        style={{
                            height: '30px',
                            marginBottom: '5px',
                            minWidth: '210px',
                        }}
                        size="small"
                        variant="danger"
                        onClick={handleApproveClick}
                    >
                        Godkjenn!
                    </Button>
                </Popover.Content>
            </Popover>
        </>
    )
}

export default ApproveButton
