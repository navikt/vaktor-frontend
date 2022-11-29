import {
    Button,
    Table,
    Loader,
    UNSAFE_MonthPicker,
    UNSAFE_useMonthpicker,
    ReadMore,
    Search,
    Select,
} from "@navikt/ds-react"
import moment from "moment"
import { useEffect, useState, Dispatch } from "react"
import { Audit, Schedules, User } from "../types/types"

let today = Date.now() / 1000

const confirm_schedule = async (
    schedule_id: string,
    setResponse: Dispatch<any>,
    setLoading: Dispatch<any>
) => {
    setLoading(true)

    await fetch(`/vaktor/api/confirm_schedule?schedule_id=${schedule_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false)
            setResponse(data)
        })
}

const disprove_schedule = async (
    schedule_id: string,
    setResponse: Dispatch<any>,
    setLoading: Dispatch<any>
) => {
    setLoading(true)
    await fetch(`/vaktor/api/disprove_schedule?schedule_id=${schedule_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false)
            setResponse(data)
        })
}

const mapAudit = (audit: Audit[]) => {
    return audit.map((audit: Audit, index) => {
        const auditTimestamp = new Date(
            new Date(audit.timestamp).getTime() + 3600000
        ).toISOString()
        return (
            <div key={audit.id}>
                <ReadMore
                    header={auditTimestamp.slice(0, 19).replace("T", " ")}
                    size="small"
                    style={
                        audit.action.includes("Avgodkjent")
                            ? { color: "red" }
                            : { color: "green" }
                    }
                >
                    {audit.action} - {audit.user.name}
                </ReadMore>
            </div>
        )
    })
}

const mapApproveStatus = (status: number) => {
    let statusText = ""
    let statusColor = ""
    switch (status) {
        case 1:
            statusText = "Godkjent av ansatt"
            statusColor = "#66CBEC"
            break
        case 2:
            statusText = "Venter på utregning"
            statusColor = "#99DEAD"
            break
        case 3:
            statusText = "Godkjent av vaktsjef"
            statusColor = "#99DEAD"
            break
        case 4:
            statusText = "Overført til lønn"
            statusColor = "#E18071"
            break
        default:
            statusText = "Trenger godkjenning"
            statusColor = "#FFFFFF"
            break
    }

    return (
        <Table.DataCell
            style={{
                backgroundColor: statusColor,
                maxWidth: "150",
                minWidth: "150",
            }}
        >
            {statusText}
        </Table.DataCell>
    )
}

const AdminLeder = () => {
    const [itemData, setItemData] = useState<Schedules[]>([])
    const [currentUser, setCurrentUser] = useState<User>({} as User)
    const [response, setResponse] = useState()
    const [loading, setLoading] = useState(false)

    const [searchFilter, setSearchFilter] = useState("")
    const [searchFilterRole, setSearchFilterRole] = useState("")
    const [searchFilterAction, setSearchFilterAction] = useState(5)

    const { monthpickerProps, inputProps, selectedMonth, setSelected } =
        UNSAFE_useMonthpicker({
            fromDate: new Date("Oct 01 2022"),
            toDate: new Date("Aug 23 2025"),
            //defaultSelected: new Date("Oct 2022")
            defaultSelected: new Date(
                new Date().getDate() - 10 > 0
                    ? moment().locale("en-GB").format("MMM Y")
                    : moment()
                          .locale("en-GB")
                          .month(moment().month() - 1)
                          .format("MMM Y")
            ),
        })

    const mapVakter = (vaktliste: Schedules[]) =>
        vaktliste.map((vakter: Schedules, i: number) => (
            //approve_level = 2;

            <Table.Row key={i}>
                <Table.HeaderCell scope="row">
                    {vakter.user.name}
                </Table.HeaderCell>
                <Table.DataCell scope="row">{vakter.type}</Table.DataCell>
                <Table.DataCell>
                    Uke {moment(vakter.start_timestamp * 1000).week()}{" "}
                    {moment(vakter.start_timestamp * 1000).week() <
                    moment(vakter.end_timestamp * 1000).week()
                        ? " - " + moment(vakter.end_timestamp * 1000).week()
                        : ""}
                    <br />
                    {new Date(vakter.start_timestamp * 1000).toLocaleString()}
                    <br />
                    {new Date(vakter.end_timestamp * 1000).toLocaleString()}
                </Table.DataCell>
                <Table.DataCell>{vakter.group.name}</Table.DataCell>
                <Table.DataCell
                    style={{ maxWidth: "220px", minWidth: "220px" }}
                >
                    <div>
                        <Button
                            disabled={
                                vakter.approve_level === 4 ||
                                vakter.approve_level === 3 ||
                                vakter.approve_level === 2 ||
                                vakter.end_timestamp > today
                            }
                            style={{
                                height: "30px",
                                marginBottom: "5px",
                                minWidth: "210px",
                            }}
                            onClick={() => {
                                confirm_schedule(
                                    vakter.id,
                                    setResponse,
                                    setLoading
                                )
                            }}
                        >
                            {" "}
                            Godkjenn{" "}
                        </Button>

                        <Button
                            disabled={
                                vakter.approve_level === 0 ||
                                vakter.approve_level === 2 ||
                                vakter.approve_level === 4
                            }
                            style={{
                                backgroundColor: "#f96c6c",
                                height: "30px",
                                minWidth: "210px",
                            }}
                            onClick={() =>
                                disprove_schedule(
                                    vakter.id,
                                    setResponse,
                                    setLoading
                                )
                            }
                        >
                            {" "}
                            Avgodkjenn{" "}
                        </Button>
                    </div>
                </Table.DataCell>
                {mapApproveStatus(vakter.approve_level)}
                {["personalleder", "leveranseleder"].includes(
                    currentUser!.role
                ) && (
                    <Table.DataCell
                        scope="row"
                        style={{ maxWidth: "200px", minWidth: "150px" }}
                    >
                        {vakter.cost.length !== 0
                            ? vakter.cost[0].total_cost
                            : "ingen beregning foreligger"}
                    </Table.DataCell>
                )}
                <Table.DataCell
                    scope="row"
                    style={{ maxWidth: "250px", minWidth: "200px" }}
                >
                    {vakter.audits.length !== 0
                        ? mapAudit(vakter.audits)
                        : "Ingen hendelser"}
                </Table.DataCell>
            </Table.Row>
        ))

    useEffect(() => {
        setLoading(true)
        Promise.all([
            fetch("/vaktor/api/leader_schedules"),
            fetch("/vaktor/api/get_me"),
        ])
            .then(async ([scheduleRes, userRes]) => {
                const schedulejson = await scheduleRes.json()
                const userjson = await userRes.json()
                return [schedulejson, userjson]
            })
            .then(([itemData, userData]) => {
                itemData.sort(
                    (a: Schedules, b: Schedules) =>
                        a.start_timestamp - b.start_timestamp
                )

                setItemData(itemData)
                setCurrentUser(userData)
                setLoading(false)
            })
    }, [response])

    if (loading === true) return <Loader></Loader>

    if (itemData === undefined) return <></>
    if (selectedMonth === undefined) setSelected(new Date())
    let listeAvVakter = mapVakter(
        itemData.filter(
            (value: Schedules) =>
                value.user_id.toLowerCase() !== currentUser.id.toLowerCase() &&
                new Date(value.start_timestamp * 1000).getMonth() ===
                    selectedMonth!.getMonth() &&
                new Date(value.start_timestamp * 1000).getFullYear() ===
                    selectedMonth!.getFullYear() &&
                value.user.name.toLowerCase().includes(searchFilter) &&
                value.user.role
                    .toLowerCase()
                    .includes(searchFilterRole.toLowerCase()) &&
                (searchFilterAction === 5
                    ? true
                    : value.approve_level === searchFilterAction)
        )
    )
    return (
        <>
            <div className="min-h-96" style={{ display: "flex" }}>
                <UNSAFE_MonthPicker {...monthpickerProps}>
                    <div className="grid gap-4">
                        <UNSAFE_MonthPicker.Input
                            {...inputProps}
                            label="Velg måned"
                        />
                    </div>
                </UNSAFE_MonthPicker>
                <form style={{ width: "300px", marginLeft: "30px" }}>
                    <Search
                        label="Søk etter person"
                        hideLabel={false}
                        variant="primary"
                        onChange={(text) => setSearchFilter(text)}
                    />
                </form>
                <div style={{ width: "200px", marginLeft: "30px" }}>
                    <Select
                        label="Velg rolle"
                        onChange={(e) => setSearchFilterRole(e.target.value)}
                    >
                        <option value="">Alle</option>
                        <option value="vakthaver">Vakthaver</option>
                        <option value="vaktsjef">Vaktsjef</option>
                    </Select>
                </div>
                <div style={{ width: "200px", marginLeft: "30px" }}>
                    <Select
                        label="Velg handling"
                        onChange={(e) =>
                            setSearchFilterAction(Number(e.target.value))
                        }
                    >
                        <option value={5}>Alle</option>
                        <option value={0}>Trenger godkjenning</option>
                        <option value={1}>Godkjent av ansatt</option>
                        <option value={2}>Venter på utregning</option>
                        <option value={3}>Godkjent av vaktsjef</option>
                        <option value={4}>Overført til lønn</option>
                    </Select>
                </div>
            </div>
            <Table
                style={{
                    minWidth: "900px",
                    backgroundColor: "white",
                    marginBottom: "3vh",
                    marginTop: "2vh",
                }}
            >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                        <Table.HeaderCell scope="col">
                            Type vakt
                        </Table.HeaderCell>
                        <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Gruppe</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Actions</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                        {["personalleder", "leveranseleder"].includes(
                            currentUser!.role
                        ) && (
                            <Table.HeaderCell scope="col">
                                Kostnad
                            </Table.HeaderCell>
                        )}
                        <Table.HeaderCell scope="col">Audit</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {listeAvVakter.length === 0 ? (
                        <h3 style={{ margin: "auto", color: "red" }}>
                            Ingen treff
                        </h3>
                    ) : (
                        listeAvVakter
                    )}
                </Table.Body>
            </Table>
        </>
    )
}

export default AdminLeder
