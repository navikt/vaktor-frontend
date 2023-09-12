import { Alert, Button, DatePicker, Heading, Loader, Modal, Popover, Select, useRangeDatepicker } from '@navikt/ds-react'
import { Dispatch, useRef, useState } from 'react'
import { Schedules } from '../../types/types'

interface Props {
    vakt: Schedules
    isOpen: boolean
    setResponse: Dispatch<any>
    setResponseError: Dispatch<any>
    setIsOpen: Dispatch<any>
    update_schedule: (schedule: Schedules, setResponse: Dispatch<any>, setResponseError: Dispatch<any>) => Promise<void>
    loading: boolean
    setLoading: Dispatch<boolean>
}

const EndreVaktButton: React.FC<Props> = ({ vakt, isOpen, setResponse, setResponseError, update_schedule, setIsOpen, loading, setLoading }) => {
    const ref = useRef<HTMLDialogElement>(null)
    const [startTimestamp, setStartTimestamp] = useState<number>(vakt.start_timestamp)
    const [endTimestamp, setEndTimestamp] = useState<number>(vakt.end_timestamp)
    const [clock_start, setClockStart] = useState<number>(0)
    const [clock_end, setClockEnd] = useState<number>(0)

    const { datepickerProps, toInputProps, fromInputProps, selectedRange } = useRangeDatepicker({
        // fromDate: new Date(vakt.start_timestamp * 1000),
        // toDate: new Date(vakt.end_timestamp * 1000),
        onRangeChange: (val) => {
            if (val && val.from && val.to) {
                setStartTimestamp(val.from.setHours(12) / 1000)
                setEndTimestamp(val.to.setHours(12) / 1000)
            }
        },
    })

    const handleApproveClick = async () => {
        setLoading(true)
        setIsOpen(false)
        const period = {
            ...vakt,
            start_timestamp: clock_start * 3600 + startTimestamp,
            end_timestamp: clock_end * 3600 + endTimestamp,
        }
        try {
            console.log('Attempting to update period: ', vakt.id)
            console.log('Tider: ', startTimestamp, 'and: ', endTimestamp)
            await update_schedule(period, setResponse, setResponseError)
            setLoading(false)
            setIsOpen(false)
            ref.current?.close()
        } catch (error) {
            // Handle any error here
            console.error(error)
        }
    }

    const isDisabled = vakt.approve_level > 0

    return (
        <>
            <Modal
                ref={ref}
                open={isOpen}
                aria-label="Modal for vaktperioder"
                onClose={() => {
                    setIsOpen(false)
                }}
                aria-labelledby="modal-heading"
            >
                <Modal.Header>
                    <Heading level="1" size="small" id="modal-heading">
                        Endre start/slutt på periode
                    </Heading>
                </Modal.Header>
                <Modal.Body style={{ minHeight: '100%' }}>
                    {vakt.id}

                    <div className="min-h-96 min-w-96 max-w-full">
                        <div
                            style={{
                                display: 'flex',
                                gap: '20px',
                                margin: 'auto',
                                flexDirection: 'column',
                                marginTop: '2vh',
                                marginBottom: '3vh',
                            }}
                        >
                            <div style={{ margin: 'auto' }}>
                                <DatePicker {...datepickerProps}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '15px',
                                        }}
                                    >
                                        <DatePicker.Input {...fromInputProps} label="Fra" />
                                        <Select label="klokken" defaultValue={0} onChange={(e) => setClockStart(Number(e.target.value))}>
                                            <option value={-12}>00:00</option>
                                            <option value={-11}>01:00</option>
                                            <option value={-10}>02:00</option>
                                            <option value={-9}>03:00</option>
                                            <option value={-8}>04:00</option>
                                            <option value={-7}>05:00</option>
                                            <option value={-6}>06:00</option>
                                            <option value={-5}>07:00</option>
                                            <option value={-4}>08:00</option>
                                            <option value={-3}>09:00</option>
                                            <option value={-2}>10:00</option>
                                            <option value={-1}>11:00</option>
                                            <option value={0}>12:00</option>
                                            <option value={1}>13:00</option>
                                            <option value={2}>14:00</option>
                                            <option value={3}>15:00</option>
                                            <option value={4}>16:00</option>
                                            <option value={5}>17:00</option>
                                            <option value={6}>18:00</option>
                                            <option value={7}>19:00</option>
                                            <option value={8}>20:00</option>
                                            <option value={9}>21:00</option>
                                            <option value={10}>22:00</option>
                                            <option value={11}>23:00</option>
                                        </Select>
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '15px',
                                        }}
                                    >
                                        <DatePicker.Input {...toInputProps} label="Til" />
                                        <Select label="klokken" defaultValue={0} onChange={(e) => setClockEnd(Number(e.target.value))}>
                                            <option value={-12}>00:00</option>
                                            <option value={-11}>01:00</option>
                                            <option value={-10}>02:00</option>
                                            <option value={-9}>03:00</option>
                                            <option value={-8}>04:00</option>
                                            <option value={-7}>05:00</option>
                                            <option value={-6}>06:00</option>
                                            <option value={-5}>07:00</option>
                                            <option value={-4}>08:00</option>
                                            <option value={-3}>09:00</option>
                                            <option value={-2}>10:00</option>
                                            <option value={-1}>11:00</option>
                                            <option value={0}>12:00</option>
                                            <option value={1}>13:00</option>
                                            <option value={2}>14:00</option>
                                            <option value={3}>15:00</option>
                                            <option value={4}>16:00</option>
                                            <option value={5}>17:00</option>
                                            <option value={6}>18:00</option>
                                            <option value={7}>19:00</option>
                                            <option value={8}>20:00</option>
                                            <option value={9}>21:00</option>
                                            <option value={10}>22:00</option>
                                            <option value={11}>23:00</option>
                                        </Select>
                                    </div>
                                </DatePicker>
                            </div>
                            {clock_start * 3600 + startTimestamp > clock_end * 3600 + endTimestamp && (
                                <Alert
                                    style={{
                                        minWidth: '68%',
                                        margin: 'auto',
                                    }}
                                    variant="error"
                                >
                                    <b> Du kan ikke sette start etter slutt</b>
                                    <br />
                                    Periode start: {new Date(clock_start * 3600 * 1000 + startTimestamp * 1000).toLocaleString().slice(0, -3)}
                                    <br />
                                    Periode slutt: {new Date(clock_end * 3600 * 1000 + endTimestamp * 1000).toLocaleString().slice(0, -3)}
                                </Alert>
                            )}
                        </div>

                        <br />
                        <Button
                            className="buttonConfirm"
                            //disabled={selectedVakthaver === ""}
                            style={{
                                height: '50px',
                                marginTop: '25px',
                                marginBottom: '25px',
                                minWidth: '200px',
                            }}
                            onClick={handleApproveClick}
                            disabled={isDisabled}
                        >
                            Endre vakt
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default EndreVaktButton
