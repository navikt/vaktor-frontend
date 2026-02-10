import { Button, Loader, Popover } from '@navikt/ds-react'
import { Dispatch, useRef, useState } from 'react'
import { Schedules } from '../../types/types'

interface Props {
    vakt: Schedules
    setResponse: Dispatch<ResponseType>
    delete_schedule: (scheduleId: string, setResponse: Dispatch<ResponseType>) => Promise<void>
    loading: boolean
    setLoading: Dispatch<React.SetStateAction<boolean>>
    onError: (errorMessage: string) => void
}

const DeleteVaktButton: React.FC<Props> = ({ vakt, setResponse, delete_schedule, loading, setLoading, onError }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)

    const handleApproveClick = async () => {
        setLoading(true)
        setOpenState(false)
        try {
            await delete_schedule(vakt.id, setResponse)
        } catch (error) {
            console.error('There was an error deleting the schedule:', error)
            if (error instanceof Error) {
                onError(`Feilet ved sletting av vakt: ${error.message}`) // Using onError callback
            } else {
                onError('Feilet ved sletting av vakt: En ukjent feil oppstod.') // For unexpected errors
            }
        } finally {
            setLoading(false)
        }
    }

    const isDisabled = vakt.approve_level > 0

    if (vakt.approve_level === 0) {
        return (
            <>
                <Button
                    onClick={() => {
                        setOpenState(true)
                    }}
                    style={{
                        height: '36px',
                        width: '150px',
                    }}
                    ref={buttonRef}
                    disabled={isDisabled || loading}
                    variant="danger"
                >
                    {loading ? <Loader /> : 'Slett vakt!'}
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
                        Sletting av perioden kan ikke angres!<br></br> {vakt.id}
                        <Button
                            style={{
                                height: '25px',
                                marginBottom: '5px',
                                minWidth: '200px',
                            }}
                            size="small"
                            variant="danger"
                            onClick={handleApproveClick}
                            disabled={loading}
                        >
                            {loading ? <Loader /> : 'Slett vakt!'}
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
                height: '36px',
                width: '150px',
            }}
            disabled={isDisabled || loading}
        >
            {loading ? <Loader /> : 'Slett vakt!'}
        </Button>
    )
}

export default DeleteVaktButton
