import { Button, Loader, Popover } from '@navikt/ds-react'
import { Dispatch, useRef, useState } from 'react'
import { Schedules } from '../../types/types'

interface Props {
    vakt: Schedules
    setResponse: Dispatch<any>
    deleteSchedule: (scheduleId: string, setResponse: Dispatch<any>) => Promise<void>
}

const DeleteVaktButton: React.FC<Props> = ({ vakt, setResponse, deleteSchedule }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)

    const handleApproveClick = async () => {
        setOpenState(false)
        await deleteSchedule(vakt.id, setResponse)
        console.log('Sletter vakt med id: ', vakt.id)
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
                        height: '30px',
                        marginBottom: '5px',
                        minWidth: '210px',
                    }}
                    size="small"
                    ref={buttonRef}
                    disabled={isDisabled}
                    variant="danger"
                >
                    Slett vakt!
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
                        >
                            Slett vakt!
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
                height: '25px',
                minWidth: '200px',
            }}
            size="small"
            disabled={isDisabled}
        >
            {<Loader />}
        </Button>
    )
}

export default DeleteVaktButton
