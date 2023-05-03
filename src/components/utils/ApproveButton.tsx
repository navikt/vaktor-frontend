import { Button, Loader, Popover } from '@navikt/ds-react'
import { Dispatch, useRef, useState } from 'react'
import { Schedules } from '../../types/types'

interface Props {
    vakt: Schedules
    setResponse: Dispatch<any>
    confirmSchedule: (scheduleId: string, setResponse: Dispatch<any>) => Promise<void>
    loading: boolean
    setLoading: Dispatch<boolean>
}

const ApproveButton: React.FC<Props> = ({ vakt, setResponse, confirmSchedule, loading, setLoading }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)

    const handleApproveClick = async () => {
        setLoading(true)
        setOpenState(false)
        await confirmSchedule(vakt.id, setResponse)
        setLoading(false)
    }

    const isDisabled = vakt.end_timestamp > Date.now() / 1000 || vakt.approve_level === 4 || vakt.approve_level === 3 || vakt.approve_level === 2

    if (vakt.approve_level === 0) {
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
                    disabled={isDisabled || loading}
                >
                    {loading ? 'Laster...' : 'Godkjenn'}
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
                            disabled={loading}
                            onClick={handleApproveClick}
                        >
                            {loading ? <Loader /> : 'Godkjenn!'}
                        </Button>
                    </Popover.Content>
                </Popover>
            </>
        )
    }

    return (
        <Button
            onClick={handleApproveClick}
            style={{
                height: '30px',
                marginBottom: '5px',
                minWidth: '210px',
            }}
            size="small"
            disabled={isDisabled || loading}
        >
            {loading ? <Loader /> : 'Godkjenn'}
        </Button>
    )
}

export default ApproveButton
