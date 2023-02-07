import { useEffect, useState, Dispatch } from "react"
import React from "react"
import {
    Button,
    Select,
    RadioGroup,
    Radio,
    Modal,
    ConfirmationPanel,
    Alert,
    UNSAFE_DatePicker,
    UNSAFE_useRangeDatepicker,
    HelpText,
} from "@navikt/ds-react"
import { Schedules, User } from "../types/types"
import { useAuth } from "../context/AuthContext"

const update_schedule = async (
    period: Schedules,
    action: string,
    selectedVakthaver: string,
    addVakt: Dispatch<any>
) => {
    await fetch(
        `/vaktor/api/update_schedule?schedule_id=${period.id}&action=${action}&selectedVakthaver=${selectedVakthaver}&group_id=${period.group_id}&dateFrom=${period.start_timestamp}&dateTo=${period.end_timestamp}`
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
    const { user } = useAuth()
    const [groupData, setgroupData] = useState<User[]>([])
    const [selectedVakthaver, setVakthaver] = useState("")
    const [action, setAction] = useState("")
    const [confirmState, setConfirmState] = useState(false)
    const [startTimestamp, setStartTimestamp] = useState<number>(
        props.schedule.start_timestamp
    )
    const [endTimestamp, setEndTimestamp] = useState<number>(
        props.schedule.end_timestamp
    )
    const [clock_start, setClockStart] = useState<number>(0)
    const [clock_end, setClockEnd] = useState<number>(0)
    const { datepickerProps, toInputProps, fromInputProps, selectedRange } =
        UNSAFE_useRangeDatepicker({
            fromDate: new Date(props.schedule.start_timestamp * 1000),
            toDate: new Date(props.schedule.end_timestamp * 1000),
            onRangeChange: (val) => {
                if (val && val.from && val.to) {
                    setStartTimestamp(val.from.setHours(12) / 1000)
                    setEndTimestamp(val.to.setHours(12) / 1000)
                }
            },
        })


    useEffect(() => {
        if (Modal && Modal.setAppElement) {
            Modal.setAppElement("#__next")
        }
        let list_of_group_ids = user.groups.map((group) => group.id)
        let body = JSON.stringify(list_of_group_ids)

        Promise.all([
            fetch(`/vaktor/api/get_my_groupmembers?group_id=${props.schedule.group_id}`)
        ])
            .then(async ([membersRes]) => {
                props.setResponse(membersRes.status)
                const groupData = await membersRes.json()
                return [groupData]
            })
            .then(([groupData]) => {
                setgroupData(groupData.filter(
                    (user: User) => user.role !== "leveranseleder"
                ))
            })
    }, [props])

    return (
        <>
            <Modal
                open={props.isOpen}
                aria-label="Modal for vaktperioder"
                onClose={() => {
                    setConfirmState(false)
                    props.setIsOpen(!props.isOpen)
                }}
                aria-labelledby="modal-heading"
            >
                <Modal.Content style={{ minHeight: "100%" }}>
                    {" "}
                    <div className="contentEndring">
                        <Select
                            label="vakthaver"
                            className="buttonConfirm"
                            onChange={(e) => {
                                setVakthaver(e.target.value)
                            }}
                            size="medium"
                            style={{
                                marginBottom: "20px",
                            }}
                        >
                            <option value="">Velg vakthaver</option>
                            {mapGroupOptions(
                                groupData.filter(
                                    (user: User) =>
                                        user.id.toUpperCase() !==
                                        props.schedule.user_id.toUpperCase()
                                )
                            )}
                        </Select>

                        <RadioGroup
                            legend="Hva skal gjøres med opprinnelig plan"
                            onChange={(valg: string) => setAction(valg)}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Radio value="bytte">
                                    Erstatt deler av eksisterende vakt (f.eks
                                    ved bytte, dersom hele vaktperioden byttes,
                                    benytt eget valg for det under)
                                </Radio>
                                <HelpText
                                    strategy="fixed"
                                    title="Bytte deler av vakt?"
                                >
                                    <b>Hvem får betalt:</b> Kun den personen med
                                    aktiv vakt får betalt.
                                    <br />
                                    <b>Hvem vises i vaktplanen:</b> Kun den
                                    personen med aktiv vakt vises i vaktplanen.
                                    Endringen vil legge seg oppå opprinnelig
                                    vakt for angitte periode
                                </HelpText>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Radio value="bistand">
                                    Bistå vakthaver
                                    (f.eks ved sykdom for opprinnelig vakthaver)
                                </Radio>
                                <HelpText strategy="fixed" title="Bistand?">
                                    <b>Hvem får betalt:</b> Både opprinnelig
                                    vakthaver og den personen som legges til som
                                    bistand får betalt.
                                    <br />
                                    <b>Hvem vises i vaktplanen:</b> Den som
                                    bistår vises i vaktplanen for angitte
                                    periode
                                </HelpText>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Radio value="replace">
                                    Bytt hele vaktperioden med en annen (skal{" "}
                                    <b>ikke</b> brukes ved sykdom)
                                </Radio>
                                <HelpText
                                    strategy="fixed"
                                    title="Bytt hel vakt"
                                >
                                    <b>Hvem får betalt:</b> Den som bytter til
                                    seg vakten
                                    <br />
                                    <b>Hvem vises i vaktplanen:</b> Hele
                                    perioden byttes. Den ordinerære vakten
                                    oppdateres med angitte vakthaver
                                </HelpText>
                            </div>
                        </RadioGroup>
                        {action !== "replace" && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: "20px",
                                    margin: "auto",
                                    flexDirection: "column",
                                    marginTop: "2vh",
                                    marginBottom: "3vh",
                                }}
                            >
                                <div style={{ margin: "auto" }}>
                                    <UNSAFE_DatePicker
                                        {...datepickerProps}
                                        style={{}}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "15px",
                                            }}
                                        >
                                            <UNSAFE_DatePicker.Input
                                                {...fromInputProps}
                                                label="Fra"
                                            />
                                            <Select
                                                label="klokken"
                                                defaultValue={0}
                                                error={
                                                    clock_start * 3600 +
                                                    startTimestamp <
                                                    props.schedule
                                                        .start_timestamp
                                                }
                                                onChange={(e) =>
                                                    setClockStart(
                                                        Number(e.target.value)
                                                    )
                                                }
                                            >
                                                <option value={-12}>
                                                    00:00
                                                </option>
                                                <option value={-11}>
                                                    01:00
                                                </option>
                                                <option value={-10}>
                                                    02:00
                                                </option>
                                                <option value={-9}>
                                                    03:00
                                                </option>
                                                <option value={-8}>
                                                    04:00
                                                </option>
                                                <option value={-7}>
                                                    05:00
                                                </option>
                                                <option value={-6}>
                                                    06:00
                                                </option>
                                                <option value={-5}>
                                                    07:00
                                                </option>
                                                <option value={-4}>
                                                    08:00
                                                </option>
                                                <option value={-3}>
                                                    09:00
                                                </option>
                                                <option value={-2}>
                                                    10:00
                                                </option>
                                                <option value={-1}>
                                                    11:00
                                                </option>
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
                                                <option value={10}>
                                                    22:00
                                                </option>
                                                <option value={11}>
                                                    23:00
                                                </option>
                                            </Select>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "15px",
                                            }}
                                        >
                                            <UNSAFE_DatePicker.Input
                                                {...toInputProps}
                                                label="Til"
                                            />
                                            <Select
                                                label="klokken"
                                                defaultValue={0}
                                                error={
                                                    clock_end * 3600 +
                                                    endTimestamp >
                                                    props.schedule.end_timestamp
                                                }
                                                onChange={(e) =>
                                                    setClockEnd(
                                                        Number(e.target.value)
                                                    )
                                                }
                                            >
                                                <option value={-12}>
                                                    00:00
                                                </option>
                                                <option value={-11}>
                                                    01:00
                                                </option>
                                                <option value={-10}>
                                                    02:00
                                                </option>
                                                <option value={-9}>
                                                    03:00
                                                </option>
                                                <option value={-8}>
                                                    04:00
                                                </option>
                                                <option value={-7}>
                                                    05:00
                                                </option>
                                                <option value={-6}>
                                                    06:00
                                                </option>
                                                <option value={-5}>
                                                    07:00
                                                </option>
                                                <option value={-4}>
                                                    08:00
                                                </option>
                                                <option value={-3}>
                                                    09:00
                                                </option>
                                                <option value={-2}>
                                                    10:00
                                                </option>
                                                <option value={-1}>
                                                    11:00
                                                </option>
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
                                                <option value={10}>
                                                    22:00
                                                </option>
                                                <option value={11}>
                                                    23:00
                                                </option>
                                            </Select>
                                        </div>
                                    </UNSAFE_DatePicker>
                                </div>
                                {(clock_start * 3600 + startTimestamp <
                                    props.schedule.start_timestamp ||
                                    clock_end * 3600 + endTimestamp >
                                    props.schedule.end_timestamp) && (
                                        <Alert
                                            style={{
                                                minWidth: "68%",
                                                margin: "auto",
                                            }}
                                            variant="error"
                                        >
                                            <b>
                                                {" "}
                                                Du kan ikke sette start/slutt
                                                utenfor valgt periode
                                            </b>
                                            <br />
                                            Periode start:{" "}
                                            {new Date(
                                                props.schedule.start_timestamp *
                                                1000
                                            )
                                                .toLocaleString()
                                                .slice(0, -3)}
                                            <br />
                                            Periode slutt:{" "}
                                            {new Date(
                                                props.schedule.end_timestamp * 1000
                                            )
                                                .toLocaleString()
                                                .slice(0, -3)}
                                        </Alert>
                                    )}
                            </div>
                        )}
                        <br />
                        <ConfirmationPanel
                            disabled={
                                startTimestamp > endTimestamp ||
                                selectedVakthaver === "" ||
                                action === ""
                            }
                            checked={confirmState}
                            label="Ja, jeg har fylt ut korrekt."
                            onChange={() => setConfirmState((x) => !x)}
                        >
                            Vær nøyaktig når du fyller ut start/slutt{" "}
                            <b>dato</b> og <b>tid</b>.
                        </ConfirmationPanel>
                        <br />
                        <Button
                            className="buttonConfirm"
                            //disabled={selectedVakthaver === ""}
                            disabled={confirmState === false}
                            style={{
                                height: "50px",
                                marginTop: "25px",
                                marginBottom: "25px",
                                minWidth: "300px",
                            }}
                            onClick={() => {
                                let period = {
                                    ...props.schedule,
                                    start_timestamp:
                                        action === "replace"
                                            ? props.schedule.start_timestamp
                                            : startTimestamp +
                                            clock_start * 3600,
                                    end_timestamp:
                                        action === "replace"
                                            ? props.schedule.end_timestamp
                                            : endTimestamp + clock_end * 3600,
                                    schedule_id: props.schedule.id,
                                }
                                update_schedule(
                                    period,
                                    action,
                                    selectedVakthaver,
                                    props.addVakt
                                )
                                props.setIsOpen(false)
                                setConfirmState(false)
                                setStartTimestamp(0)
                                setEndTimestamp(0)
                                setClockEnd(0)
                                setClockStart(0)
                            }}
                        >
                            Legg til endring
                        </Button>
                    </div>
                </Modal.Content>
            </Modal>
        </>
    )
}

export default ScheduleModal
