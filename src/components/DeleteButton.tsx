import { Button, Popover } from '@navikt/ds-react'
import { Dispatch, useEffect, useRef, useState } from 'react'

const delete_schedule = async (schedule_id: string, setResponse: Dispatch<any>) => {
    await fetch(`/api/delete_schedule?schedule_id=${schedule_id}`)
        .then((r) => r.json())
        .then((data) => {
            setResponse(data)
        })
}

const DeleteButton = (props: { bakvakt: string; setResponse: Dispatch<any> }) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [openState, setOpenState] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

    return (
        <>
            <Button
                onClick={() => {
                    setOpenState(true)
                }}
                style={{
                    maxWidth: '210px',
                    marginTop: '5px',
                    marginBottom: '5px',
                }}
                variant="danger"
                size="small"
                ref={(el) => {
                    setAnchorEl(el)
                }}
            >
                Slett endring
            </Button>
            <Popover open={openState} onClose={() => setOpenState(false)} anchorEl={anchorEl}>
                <Popover.Content
                    style={{
                        backgroundColor: 'rgba(241, 241, 241, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                    }}
                >
                    Sletting av perioden kan ikke angres!
                    <Button
                        style={{ minWidth: '50%', margin: 'auto' }}
                        size="small"
                        variant="danger"
                        onClick={() => {
                            ;(delete_schedule(props.bakvakt, props.setResponse), setOpenState(false))
                        }}
                    >
                        Slett!
                    </Button>
                </Popover.Content>
            </Popover>
        </>
    )
}

export default DeleteButton
