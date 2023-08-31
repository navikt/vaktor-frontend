import { useEffect, useState, Dispatch, useRef } from 'react'
import React from 'react'
import { Button, Select, Modal, Alert, DatePicker, useRangeDatepicker, Heading } from '@navikt/ds-react'
import { Schedules, User } from '../../types/types'

const update_schedule = async (period: Schedules, action: string, selectedVakthaver: string, addVakt: Dispatch<any>) => {
    await fetch(
        `/vaktor/api/update_schedule?schedule_id=${period.id}&action=${action}&selectedVakthaver=${selectedVakthaver}&group_id=${period.group_id}&dateFrom=${period.start_timestamp}&dateTo=${period.end_timestamp}`
    )
        .then((r) => r.json())
        .then((data) => {
            addVakt(data)
        })
}

const EndreVaktButton = (props: {
    schedule: Schedules
    isOpen: boolean
    setIsOpen: Dispatch<boolean>
    setResponse: Dispatch<any>
    addVakt: Dispatch<any>
}) => {
    const ref = useRef<HTMLDialogElement>(null)
    const [action, setAction] = useState('')
    const [startTimestamp, setStartTimestamp] = useState<number>(props.schedule.start_timestamp)
    const [endTimestamp, setEndTimestamp] = useState<number>(props.schedule.end_timestamp)
    const [clock_start, setClockStart] = useState<number>(0)
    const [clock_end, setClockEnd] = useState<number>(0)
    const { datepickerProps, toInputProps, fromInputProps, selectedRange } = useRangeDatepicker({
        onRangeChange: (val) => {
            if (val && val.from && val.to) {
                setStartTimestamp(val.from.setHours(12) / 1000)
                setEndTimestamp(val.to.setHours(12) / 1000)
            }
        },
    })

    useEffect(() => {}, [props])

    return (
        <>
            <Modal
                open={props.isOpen}
                aria-label="Modal for vaktperioder"
                onClose={() => {
                    props.setIsOpen(!props.isOpen)
                }}
                aria-labelledby="modal-heading"
            >
                <Modal.Header>
                    <Heading level="1" size="small" id="modal-heading">
                        Endre start/slutt på periode
                    </Heading>
                </Modal.Header>
                <Modal.Body style={{ minHeight: '100%' }}>
                    {props.schedule.id}

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
                            onClick={() => {
                                let period = {
                                    ...props.schedule,
                                    start_timestamp: startTimestamp + clock_start * 3600,
                                    end_timestamp: endTimestamp + clock_end * 3600,
                                    schedule_id: props.schedule.id,
                                }
                                ref.current?.close()
                                //(update_schedule(period, action, selectedVakthaver, props.addVakt)
                                console.log('This is a button', period)
                                props.setIsOpen(false)
                                setStartTimestamp(0)
                                setEndTimestamp(0)
                                setClockEnd(0)
                                setClockStart(0)
                            }}
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
