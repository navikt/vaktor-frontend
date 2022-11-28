import {
    Button,
    Table,
    Loader,
    UNSAFE_MonthPicker,
    UNSAFE_useMonthpicker,
    HelpText,
    Radio,
    RadioGroup,
    UNSAFE_DatePicker,
    UNSAFE_useRangeDatepicker,
    Pagination,
    Alert,
    Select,
} from "@navikt/ds-react"
import ColumnHeader from "@navikt/ds-react/esm/table/ColumnHeader"
import moment from "moment"
import { useEffect, useState, Dispatch } from "react"
import { Vaktlag, Schedules, User } from "../types/types"
import PerioderOptions from "./PerioderOptions"

const createSchedule = async (
    users: User[],
    setResponse: Dispatch<any>,
    start_timestamp: number,
    end_timestamp: number,
    midlertidlig_vakt: boolean,
    rolloverDay: number,
    amountOfWeeks: number,
    setResponseError: Dispatch<string>,
    rolloverTime: number
) => {
    //setLoading(true);
    console.log("start: ", start_timestamp, "end: ", end_timestamp)
    var user_order = users
        .sort((a: User, b: User) => a.group_order_index! - b.group_order_index!)
        .map((user: User) => user.id) // bare en liste med identer
    var url = `/vaktor/api/create_schedule/?group_id=${users[0].groups[0].id}&start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}&midlertidlig_vakt=${midlertidlig_vakt}&amountOfWeeks=${amountOfWeeks}&rolloverDay=${rolloverDay}&rolloverTime=${rolloverTime}`
    var fetchOptions = {
        method: "POST",
        body: JSON.stringify(user_order),
    }

    await fetch(url, fetchOptions)
        .then(async (r) => {
            if (!r.ok) {
                const rText = await r.json()
                console.log("response: ", rText.detail)
                setResponseError(rText.detail)
                return []
            }
            return r.json()
        })
        .then((data: Schedules) => {
            setResponse(data)
        })
        .catch((error: Error) => {
            console.error(error.name, error.message)
            throw error /* <-- rethrow the error so consumer can still catch it */
        })
}

const Vaktperioder = () => {
    const numWeeksInMs = 6.048e8 * 4 // 4 weeks in ms
    const [itemData, setItemData] = useState<User[]>([])
    const [response, setResponse] = useState([])
    const [responseError, setResponseError] = useState("")
    const [loading, setLoading] = useState(false)
    const [isMidlertidlig, setIsMidlertidlig] = useState(true)
    const [startTimestamp, setStartTimestamp] = useState<number>(
        new Date("Jan 01 2023").setHours(12) / 1000
    )
    const [endTimestamp, setEndTimestamp] = useState<number>(0)
    const [clock_start, setClockStart] = useState<number>(0)
    const [clock_end, setClockEnd] = useState<number>(0)
    const [rolloverDay, setRolloverDay] = useState<number>(2)
    const [rolloverTime, setRolloverTime] = useState<number>(12)
    const [amountOfWeeks, setAmountOfWeeks] = useState<number>(52)
    const [page, setPage] = useState(1)
    const { datepickerProps, toInputProps, fromInputProps, selectedRange } =
        UNSAFE_useRangeDatepicker({
            fromDate: new Date(Date.now() + numWeeksInMs),
            toDate: new Date("Feb 01 2024"),
            defaultMonth: new Date(Date.now() + numWeeksInMs),
            onRangeChange: (val) => {
                if (val && val.from && val.to) {
                    setStartTimestamp(val.from.setHours(12) / 1000)
                    setEndTimestamp(val.to.setHours(12) / 1000)
                }
            },
        })

    const { monthpickerProps, inputProps, selectedMonth } =
        UNSAFE_useMonthpicker({
            required: true,
            fromDate: new Date("Jan 01 2023"),
            toDate: new Date("Feb 01 2025"),
            defaultYear: new Date("Jan 01 2023"),
            defaultSelected: new Date("Jan 01 2023"),
        })

    const mapMembers = (members: User[]) =>
        members
            .sort(
                (a: User, b: User) =>
                    a.group_order_index! - b.group_order_index!
            )
            .map((user, index) => {
                if (user.group_order_index === undefined) {
                    user.group_order_index = index + 1
                }
                //console.log("index:asdsa : ", user.group_order_index);
                user.id = user.id.toUpperCase()
                return (
                    <PerioderOptions
                        member={user}
                        key={index}
                        itemData={members}
                        setItemData={setItemData}
                    ></PerioderOptions>
                )
            })

    useEffect(() => {
        //setLoading(true);
        Promise.all([fetch("/vaktor/api/get_my_groupmembers")])
            .then(async ([scheduleRes]) => {
                const schedulejson = await scheduleRes.json()
                return [schedulejson]
            })
            .then(([itemData]) => {
                setItemData(
                    itemData.filter(
                        (user: User) => user.role !== "leveranseleder"
                    )
                )
                setIsMidlertidlig(
                    itemData[0].groups[0].type !== "Døgnkontinuerlig (24/7)"
                )
                setLoading(false)
            })
    }, [response])

    if (loading === true) return <Loader></Loader>
    return (
        <>
            {response.length !== 0 || responseError !== "" ? (
                mapResponse(response, page, setPage, responseError)
            ) : (
                <div
                    style={{
                        marginTop: "2vh",
                        marginBottom: "3vh",
                        display: "grid",
                        alignItems: "center",
                        justifyContent: "space-around",
                    }}
                >
                    {isMidlertidlig ? (
                        <div style={{ margin: "auto" }}>
                            <UNSAFE_DatePicker {...datepickerProps} style={{}}>
                                <div style={{ display: "flex", gap: "15px" }}>
                                    <UNSAFE_DatePicker.Input
                                        {...fromInputProps}
                                        label="Fra"
                                    />
                                    <Select
                                        label="klokken"
                                        defaultValue={0}
                                        onChange={(e) =>
                                            setClockStart(
                                                Number(e.target.value)
                                            )
                                        }
                                    >
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
                                        onChange={(e) =>
                                            setClockEnd(Number(e.target.value))
                                        }
                                    >
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
                            </UNSAFE_DatePicker>
                        </div>
                    ) : (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "40px",
                                    marginTop: "15px",
                                }}
                            >
                                <UNSAFE_MonthPicker
                                    {...monthpickerProps}
                                    style={{}}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "15px",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <UNSAFE_MonthPicker.Input
                                            {...inputProps}
                                            label="Fra"
                                        />
                                    </div>
                                </UNSAFE_MonthPicker>

                                <RadioGroup
                                    legend="Angi dag for vaktbytte: "
                                    onChange={(val: any) => setRolloverDay(val)}
                                    defaultValue="2"
                                >
                                    <Radio value="0">Mandag</Radio>
                                    <Radio value="2">Onsdag</Radio>
                                </RadioGroup>
                                <RadioGroup
                                    legend="Angi tid for vaktbytte: "
                                    onChange={(val: any) =>
                                        setRolloverTime(val)
                                    }
                                    defaultValue="12"
                                >
                                    <Radio value="7">07:00</Radio>
                                    <Radio value="8">08:00</Radio>
                                    <Radio value="12">12:00</Radio>
                                </RadioGroup>
                                <RadioGroup
                                    legend="Opprett vaktplan for: "
                                    onChange={(val: any) =>
                                        setAmountOfWeeks(val)
                                    }
                                    defaultValue="52"
                                >
                                    <Radio value="26">6 måneder</Radio>
                                    <Radio value="52">12 måneder</Radio>
                                </RadioGroup>
                            </div>
                        </>
                    )}

                    <Table
                        style={{
                            minWidth: "650px",
                            maxWidth: "60vw",
                            backgroundColor: "white",
                            marginTop: "2vh",
                            marginBottom: "3vh",
                        }}
                    >
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell scope="col">
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "space-around",
                                        }}
                                    >
                                        ID
                                        <HelpText
                                            title="Hva brukes ID til?"
                                            style={{
                                                marginLeft: "10px",
                                            }}
                                        >
                                            <b>Id:</b> Brukes for å bestemme
                                            hvilken rekkefølge vakthaverne skal
                                            gå vakt. Den som står øverst vil få
                                            første vakt når nye perioder
                                            genereres
                                        </HelpText>
                                    </div>
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col">
                                    Ident
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col">
                                    Navn
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col">
                                    Rolle
                                </Table.HeaderCell>
                                <Table.HeaderCell scope="col">
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "space-around",
                                        }}
                                    >
                                        Aktiv
                                        <HelpText
                                            title="Hva brukes aktiv toggle til?"
                                            style={{
                                                marginLeft: "10px",
                                            }}
                                        >
                                            <b>Aktiv toggle:</b> Toggles til av
                                            dersom en vakthaver <b>ikke</b> skal
                                            nkluderes i nye vaktperioder
                                            <br />
                                        </HelpText>
                                    </div>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {itemData ? (
                                mapMembers(itemData)
                            ) : (
                                <Table.Row></Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                    <Button
                        disabled={response.length !== 0}
                        style={{
                            minWidth: "210px",
                            marginBottom: "15px",
                        }}
                        onClick={() => {
                            console.log("startTimestamp: ", startTimestamp)
                            console.log("clockstart * 3600", clock_start * 3600)
                            console.log(
                                "start: ",
                                startTimestamp + clock_start * 3600
                            )
                            console.log(
                                "end: ",
                                endTimestamp + clock_end * 3600
                            )
                            createSchedule(
                                itemData.filter(
                                    (user: User) =>
                                        user.group_order_index !== 100
                                ),
                                setResponse, //setLoading
                                isMidlertidlig
                                    ? startTimestamp + clock_start * 3600
                                    : selectedMonth!.getTime() / 1000,
                                isMidlertidlig
                                    ? endTimestamp + clock_end * 3600
                                    : 0,
                                isMidlertidlig,
                                rolloverDay,
                                amountOfWeeks,
                                setResponseError,
                                rolloverTime
                            )
                        }}
                    >
                        Generer vaktperioder
                    </Button>
                </div>
            )}
        </>
    )
}

export default Vaktperioder

const mapResponse = (
    schedules: Schedules[],
    page: number,
    setPage: Dispatch<number>,
    error: string
) => {
    const rowsPerPage = 10
    let sortData = schedules
    sortData = sortData.slice((page - 1) * rowsPerPage, page * rowsPerPage)
    if (error !== "") {
        return (
            <div style={{ height: "60vh" }}>
                <Alert
                    style={{
                        maxWidth: "50%",
                        minWidth: "550px",
                        margin: "auto",
                    }}
                    variant="error"
                >
                    Woopsie, det har skjedd en feil. <br />
                    <i>{error}</i>
                </Alert>
            </div>
        )
    }
    return (
        <div
            className="grid gap-4"
            style={{
                maxWidth: "650px",
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
            }}
        >
            <Alert variant="success">Disse vaktene ble opprettet:</Alert>
            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Uke</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sortData.map((schedule: Schedules, idx: number) => (
                        <Table.Row key={idx}>
                            <Table.HeaderCell
                                scope="row"
                                style={{
                                    minWidth: "210px",
                                    maxWidth: "210px",
                                }}
                            >
                                {schedule.user.name}
                            </Table.HeaderCell>

                            <Table.DataCell>
                                Uke:{" "}
                                {moment(schedule.start_timestamp * 1000).week()}{" "}
                                {moment(
                                    schedule.start_timestamp * 1000
                                ).week() <
                                moment(schedule.end_timestamp * 1000).week()
                                    ? " - " +
                                      moment(
                                          schedule.end_timestamp * 1000
                                      ).week()
                                    : ""}
                                <br />
                            </Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
            <Pagination
                page={page}
                onPageChange={setPage}
                count={Math.ceil(schedules.length / rowsPerPage)}
                style={{ marginLeft: "0" }}
            />
        </div>
    )
}
