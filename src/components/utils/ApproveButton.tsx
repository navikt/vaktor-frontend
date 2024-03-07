import { Button, Loader, Popover } from '@navikt/ds-react'
import { Dispatch, useRef, useState } from 'react'
import { Schedules, User, Cost } from '../../types/types'

interface Props {
    vakt: Schedules
    user: User
    setResponse: Dispatch<ResponseType>
    confirmSchedule: (scheduleId: string, setResponse: Dispatch<ResponseType>) => Promise<void>
    loading: boolean
    setLoading: Dispatch<React.SetStateAction<boolean>>
    onError: (errorMessage: string) => void
}

const ApproveButton: React.FC<Props> = ({ vakt, user, setResponse, confirmSchedule, loading, setLoading, onError }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)

    const handleApproveClick = async () => {
        setLoading(true)
        setOpenState(false)
        try {
            await confirmSchedule(vakt.id, setResponse)
        } catch (error) {
            console.error('There was an error approving the schedule:', error)
            if (error instanceof Error) {
                onError(`Feilet ved godkjenning av vakt: ${error.message}`) // Using onError callback
            } else {
                onError('Feilet ved godkjenning av vakt: En ukjent feil oppstod.') // For unexpected errors
            }
        } finally {
            setLoading(false)
        }
    }

    const num_cost = vakt.cost.length - 1
    // const haskoststed = user.bdm_koststeder != null ? user.bdm_koststeder.includes(vakt.cost[num_cost].koststed) : false
    const haskoststed =
        user.bdm_koststeder != null && Array.isArray(vakt.cost) && num_cost >= 0 && num_cost < vakt.cost.length && vakt.cost[num_cost] != null
            ? user.bdm_koststeder.includes(vakt.cost[num_cost].koststed)
            : false

    const isDisabled =
        vakt.end_timestamp > Date.now() / 1000 || vakt.approve_level === 2 || (vakt.approve_level === 3 && !haskoststed) || vakt.approve_level >= 4

    const message = vakt.approve_level !== 3 ? 'Godkjenn' : 'Godkjenn for utbetaling'

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
            {loading ? <Loader /> : message}
        </Button>
    )
}

export default ApproveButton
