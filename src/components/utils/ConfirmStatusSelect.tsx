import { Select, Popover, Button } from '@navikt/ds-react'
import { useState } from 'react'
import { Schedules } from '../../types/types'

const STATUS_LABELS: Record<number, string> = {
    0: '0 - Trenger godkjenning',
    1: '1 - Godkjent av ansatt',
    2: '2 - Venter på utregning',
    3: '3 - Godkjent av vaktsjef',
    4: '4 - Godkjent av BDM',
    5: '5 - Overført til lønn',
    6: '6 - Venter på diff-utregning',
    7: '7 - Diff utregnet',
    8: '8 - Overført etter rekjøring',
    99: '99 - Ingen tid',
}

interface Props {
    vakt: Schedules
    isDarkMode: boolean
    setIsLoading: (v: boolean) => void
    update_schedule: (schedule: Schedules, setResponse: any, setResponseError: any) => Promise<void>
    setResponse: (response: any) => void
    setResponseError: (error: string) => void
}

const ConfirmStatusSelect: React.FC<Props> = ({ vakt, isDarkMode, setIsLoading, update_schedule, setResponse, setResponseError }) => {
    const [pendingLevel, setPendingLevel] = useState<number | null>(null)
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null)

    const handleConfirm = async () => {
        if (pendingLevel === null) return
        const level = pendingLevel
        setPendingLevel(null)
        setIsLoading(true)
        await update_schedule({ ...vakt, approve_level: level }, setResponse, setResponseError)
    }

    return (
        <div ref={setAnchorEl}>
            <Select label="Sett status" size="small" value={vakt.approve_level} onChange={(e) => setPendingLevel(Number(e.target.value))}>
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                        {label}
                    </option>
                ))}
            </Select>
            <Popover open={pendingLevel !== null} onClose={() => setPendingLevel(null)} anchorEl={anchorEl} placement="left">
                <Popover.Content
                    style={{
                        backgroundColor: isDarkMode ? '#2a2a2a' : '#f1f1f1',
                        color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        width: '240px',
                        border: isDarkMode ? '1px solid #444' : undefined,
                    }}
                >
                    <span>
                        Endre status til <b>{pendingLevel !== null ? STATUS_LABELS[pendingLevel] : ''}</b>?
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button size="small" onClick={handleConfirm}>
                            Bekreft
                        </Button>
                        <Button size="small" variant="tertiary" onClick={() => setPendingLevel(null)}>
                            Avbryt
                        </Button>
                    </div>
                </Popover.Content>
            </Popover>
        </div>
    )
}

export default ConfirmStatusSelect
