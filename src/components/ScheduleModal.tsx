import { useEffect, useState, Dispatch } from 'react'
import React from 'react'
import {
    Button,
    Select,
    RadioGroup,
    Radio,
    Modal,
    ConfirmationPanel,
    Alert,
    DatePicker,
    useRangeDatepicker,
    HelpText,
    Loader,
    Label,
} from '@navikt/ds-react'

import { Schedules, User } from '../types/types'
import ScheduleChanges from './utils/ScheduleChanges'
import moment from 'moment'
import { hasAnyRole } from '../utils/roles'

const update_schedule = async (period: Schedules, action: string, selectedVakthaver: string, addVakt: Dispatch<any>) => {
    await fetch(
        `/api/update_schedule?schedule_id=${period.id}&action=${action}&selectedVakthaver=${selectedVakthaver}&group_id=${period.group_id}&dateFrom=${period.start_timestamp}&dateTo=${period.end_timestamp}`
    )
        .then((r) => r.json())
        .then((data) => {
            addVakt(data)
        })
}

const mapGroupOptions = (members: User[]) => {
    return members.map((user: User, index) => (
        <option key={index} value={user.id}>
            {user.name}
        </option>
    ))
}

const ScheduleModal = (props: {
    schedule: Schedules
    isOpen: boolean
    setIsOpen: Dispatch<boolean>
    setResponse: Dispatch<any>
    addVakt: Dispatch<any>
}) => {
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState()

    const [groupData, setgroupData] = useState<User[]>([])
    const [selectedVakthaver, setVakthaver] = useState('')
    const [action, setAction] = useState('')
    const [confirmState, setConfirmState] = useState(false)
    const [startTimestamp, setStartTimestamp] = useState<number>(props.schedule.start_timestamp)
    const [endTimestamp, setEndTimestamp] = useState<number>(props.schedule.end_timestamp)
    const [clock_start, setClockStart] = useState<number>(0)
    const [clock_end, setClockEnd] = useState<number>(0)
    const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
        fromDate: new Date(props.schedule.start_timestamp * 1000),
        toDate: new Date(props.schedule.end_timestamp * 1000),
        // defaultSelected:
        //     props.schedule.start_timestamp && props.schedule.end_timestamp
        //         ? { from: new Date(props.schedule.start_timestamp * 1000), to: new Date(props.schedule.end_timestamp * 1000) }
        //         : undefined,
        onRangeChange: (val) => {
            if (val && val.from && val.to) {
                setStartTimestamp(val.from.setHours(12) / 1000)
                setEndTimestamp(val.to.setHours(12) / 1000)
            }
        },
    })

    useEffect(() => {
        const fetchGroupMembers = async () => {
            const membersRes = await fetch(`/api/get_my_groupmembers?group_id=${props.schedule.group_id}`)
            props.setResponse(membersRes.status)
            const groupData = await membersRes.json()
            setgroupData(groupData.filter((user: User) => hasAnyRole(user, ['vakthaver', 'vaktsjef'])))
            setgroupData(groupData)
        }
        fetchGroupMembers()

        // Sync timestamps from props
        const syncTimestamps = () => {
            setStartTimestamp(props.schedule.start_timestamp)
            setEndTimestamp(props.schedule.end_timestamp)
        }
        syncTimestamps()
    }, [props.schedule])

    return (
        <>
            <Modal
                open={props.isOpen}
                onClose={() => {
                    setConfirmState(false)
                    props.setIsOpen(false)
                }}
                aria-label="Endre vaktperiode"
            >
                <Modal.Header closeButton>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <b>Gjør endringer på Vaktperiode for: {props.schedule.user.name}</b>
                        Uke: {moment(props.schedule.start_timestamp * 1000).week()}{' '}
                        {moment(props.schedule.start_timestamp * 1000).week() < moment(props.schedule.end_timestamp * 1000).week()
                            ? ' - ' + moment(props.schedule.end_timestamp * 1000).week()
                            : ''}
                        <br />
                    </div>
                </Modal.Header>
                <Modal.Body style={{ minHeight: '100%' }}>
                    {' '}
                    <div className="contentEndring">
                        <Select
                            label="vakthaver"
                            className="buttonConfirm"
                            onChange={(e) => {
                                setVakthaver(e.target.value)
                            }}
                            size="medium"
                            style={{
                                marginBottom: '20px',
                            }}
                        >
                            <option value="">Velg vakthaver</option>
                            {mapGroupOptions(groupData.filter((user: User) => user.id.toUpperCase() !== props.schedule.user_id.toUpperCase()))}
                        </Select>

                        <RadioGroup legend="Hva skal gjøres med opprinnelig plan" onChange={(valg: string) => setAction(valg)}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Radio value="bytte">
                                    Erstatt deler av eksisterende vakt (f.eks ved bytte, dersom hele vaktperioden byttes, benytt eget valg for det
                                    under)
                                </Radio>
                                <HelpText strategy="fixed" title="Bytte deler av vakt?">
                                    <b>Hvem får betalt:</b> Kun den personen med aktiv vakt får betalt.
                                    <br />
                                    <b>Hvem vises i vaktplanen:</b> Kun den personen med aktiv vakt vises i vaktplanen. Endringen vil legge seg oppå
                                    opprinnelig vakt for angitte periode
                                </HelpText>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Radio value="bistand">Bistå vakthaver (f.eks ved sykdom for opprinnelig vakthaver)</Radio>
                                <HelpText strategy="fixed" title="Bistand?">
                                    <b>Hvem får betalt:</b> Både opprinnelig vakthaver og den personen som legges til som bistand får betalt.
                                    <br />
                                    <b>Hvem vises i vaktplanen:</b> Den som bistår vises i vaktplanen for angitte periode
                                </HelpText>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Radio value="replace">
                                    Bytt hele vaktperioden med en annen (skal <b>ikke</b> brukes ved sykdom)
                                </Radio>
                                <HelpText strategy="fixed" title="Bytt hel vakt">
                                    <b>Hvem får betalt:</b> Den som bytter til seg vakten
                                    <br />
                                    <b>Hvem vises i vaktplanen:</b> Hele perioden byttes. Den ordinerære vakten oppdateres med angitte vakthaver
                                </HelpText>
                            </div>
                        </RadioGroup>
                        {action !== 'replace' && (
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
                                    <DatePicker {...datepickerProps} showWeekNumber>
                                        {['Fra', 'Til'].map((label, index) => (
                                            <div
                                                key={label}
                                                style={{
                                                    display: 'flex',
                                                    gap: '15px',
                                                }}
                                            >
                                                <DatePicker.Input {...(index === 0 ? fromInputProps : toInputProps)} label={label} />
                                                <Select
                                                    label="klokken"
                                                    value={index === 0 ? clock_start : clock_end}
                                                    error={
                                                        index === 0
                                                            ? clock_start * 3600 + startTimestamp < props.schedule.start_timestamp
                                                            : clock_end * 3600 + endTimestamp > props.schedule.end_timestamp
                                                    }
                                                    onChange={(e) =>
                                                        index === 0 ? setClockStart(Number(e.target.value)) : setClockEnd(Number(e.target.value))
                                                    }
                                                >
                                                    {Array.from({ length: 24 }, (_, i) => (
                                                        <option key={i - 12} value={i - 12}>
                                                            {`${(i % 24).toString().padStart(2, '0')}:00`}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </div>
                                        ))}
                                    </DatePicker>
                                </div>
                                {(clock_start * 3600 + startTimestamp < props.schedule.start_timestamp ||
                                    clock_end * 3600 + endTimestamp > props.schedule.end_timestamp) && (
                                    <Alert
                                        style={{
                                            minWidth: '68%',
                                            margin: 'auto',
                                        }}
                                        variant="error"
                                    >
                                        <b> Du kan ikke sette start/slutt utenfor valgt periode</b>
                                        <br />
                                        Periode start: {new Date(props.schedule.start_timestamp * 1000).toLocaleString().slice(0, -3)}
                                        <br />
                                        Periode slutt: {new Date(props.schedule.end_timestamp * 1000).toLocaleString().slice(0, -3)}
                                    </Alert>
                                )}
                            </div>
                        )}
                        <br />
                        <ConfirmationPanel
                            disabled={startTimestamp > endTimestamp || selectedVakthaver === '' || action === ''}
                            checked={confirmState}
                            label="Ja, jeg har fylt ut korrekt."
                            onChange={() => setConfirmState((x) => !x)}
                        >
                            Vær nøyaktig når du fyller ut start/slutt <b>dato</b> og <b>tid</b>.
                        </ConfirmationPanel>
                        <br />
                        <Button
                            className="buttonConfirm"
                            //disabled={selectedVakthaver === ""}
                            disabled={confirmState === false}
                            style={{
                                height: '50px',
                                marginTop: '25px',
                                marginBottom: '25px',
                                minWidth: '300px',
                            }}
                            onClick={() => {
                                let computedAction = action
                                const computedStart = action === 'replace' ? props.schedule.start_timestamp : startTimestamp + clock_start * 3600
                                const computedEnd = action === 'replace' ? props.schedule.end_timestamp : endTimestamp + clock_end * 3600
                                if (
                                    action === 'bytte' &&
                                    computedStart === props.schedule.start_timestamp &&
                                    computedEnd === props.schedule.end_timestamp
                                ) {
                                    computedAction = 'replace'
                                }
                                let period = {
                                    ...props.schedule,
                                    start_timestamp: computedStart,
                                    end_timestamp: computedEnd,
                                    schedule_id: props.schedule.id,
                                }
                                update_schedule(period, computedAction, selectedVakthaver, props.addVakt)
                                props.setIsOpen(false)
                                setConfirmState(false)
                                setClockEnd(0)
                                setClockStart(0)
                            }}
                        >
                            Legg til endring
                        </Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <Label>Eksisterende endringer på denne vakten:</Label>
                        <br />
                        {props.schedule.vakter.length === 0 ? (
                            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                                <p>Ingen endringer funnet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                {['bistand', 'bytte'].map((type) => (
                                    <div key={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}:
                                        <ScheduleChanges
                                            periods={props.schedule.vakter.filter((vakt) =>
                                                type === 'bistand' ? vakt.type === 'bistand' || vakt.type === 'bakvakt' : vakt.type === type
                                            )}
                                            setResponse={setResponse}
                                            loading={loading}
                                            modalView={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default ScheduleModal
