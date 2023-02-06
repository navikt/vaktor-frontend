import {
    Button,
    Table,
    UNSAFE_useMonthpicker,
    UNSAFE_MonthPicker,
    Search,
    Select,
} from "@navikt/ds-react"
import { useEffect, useState } from "react"
import { Schedules, User, Vaktlag } from "../types/types"
import moment from "moment"
import ScheduleModal from "./ScheduleModal"
import ScheduleChanges from "./ScheduleChanges"
import { useAuth } from "../context/AuthContext"

const UpdateSchedule = () => {
    const { user } = useAuth()
    const [scheduleData, setScheduleData] = useState<Schedules[]>([])
    const [selectedSchedule, setSchedule] = useState<Schedules>()
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [response, setResponse] = useState()
    const [Vakt, addVakt] = useState()
    const [searchFilter, setSearchFilter] = useState("")
    const [selectedVaktlag, setSelctedVaktlag] = useState(user.groups[0].id)
    const { monthpickerProps, inputProps, selectedMonth, setSelected } =
        UNSAFE_useMonthpicker({
            fromDate: new Date("Oct 01 2022"),
            toDate: new Date("Aug 23 2025"),
            defaultSelected: new Date(moment().locale("en-GB").format("MMM Y")),
        })

    useEffect(() => {
        fetch("/vaktor/api/group_schedules")
            .then((scheduleRes) => scheduleRes.json())
            .then((scheduleData) => {
                scheduleData.sort(
                    (a: Schedules, b: Schedules) =>
                        a.start_timestamp - b.start_timestamp
                )
                setScheduleData(scheduleData)
            })
    }, [response, Vakt])

    return (
        <>
            {selectedSchedule ? (
                <ScheduleModal
                    schedule={selectedSchedule}
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    setResponse={setResponse}
                    addVakt={addVakt}
                />
            ) : (
                <></>
            )}
            <div
                style={{
                    marginTop: "2vh",
                    marginBottom: "3vh",
                    display: "grid",
                    alignItems: "center",
                    justifyContent: "space-around",
                }}
            >
                <div
                    className="min-h-96"
                    style={{ display: "flex", gap: "30px" }}
                >
                    <UNSAFE_MonthPicker {...monthpickerProps}>
                        <div className="grid gap-4">
                            <UNSAFE_MonthPicker.Input
                                {...inputProps}
                                label="Velg måned"
                            />
                        </div>
                    </UNSAFE_MonthPicker>
                    <form style={{ width: "300px" }}>
                        <Search
                            label="Søk etter person"
                            hideLabel={false}
                            variant="simple"
                            onChange={(text) => setSearchFilter(text)}
                            onClick={(e) => false}
                        />
                    </form>

                    <Select
                        label="Velg vaktlag"
                        onChange={(e) => setSelctedVaktlag(e.target.value)}
                    >
                        {user.groups.map((group: Vaktlag) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </Select>
                </div>
                <Table
                    style={{
                        minWidth: "1150px",
                        maxWidth: "1200px",
                        backgroundColor: "white",
                        marginBottom: "3vh",
                    }}
                >
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">
                                Navn
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                Periode
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                Vaktbistand
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                Vaktbytter
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {scheduleData
                            .filter(
                                (schedule: Schedules) =>
                                    schedule.start_timestamp !== null &&
                                    schedule.type === "ordinær vakt" &&
                                    schedule.user.name
                                        .toLowerCase()
                                        .includes(searchFilter.toLowerCase()) &&
                                    new Date(
                                        schedule.start_timestamp * 1000
                                    ).getMonth() ===
                                    selectedMonth!.getMonth() &&
                                    new Date(
                                        schedule.start_timestamp * 1000
                                    ).getFullYear() ===
                                    selectedMonth!.getFullYear() && selectedVaktlag == schedule.group_id
                            )
                            .map((schedule: Schedules, i) => {
                                //approve_level = 0;
                                return (
                                    <Table.Row key={i}>
                                        <Table.HeaderCell
                                            scope="row"
                                            style={{
                                                minWidth: "210px",
                                                maxWidth: "210px",
                                            }}
                                        >
                                            {schedule.user.name}
                                            <br />
                                            {schedule.type}
                                        </Table.HeaderCell>

                                        <Table.DataCell>
                                            Uke:{" "}
                                            {moment(
                                                schedule.start_timestamp * 1000
                                            ).week()}{" "}
                                            {moment(
                                                schedule.start_timestamp * 1000
                                            ).week() <
                                                moment(
                                                    schedule.end_timestamp * 1000
                                                ).week()
                                                ? " - " +
                                                moment(
                                                    schedule.end_timestamp *
                                                    1000
                                                ).week()
                                                : ""}
                                            <br />
                                            Fra:{" "}
                                            {new Date(
                                                schedule.start_timestamp * 1000
                                            )
                                                .toLocaleString()
                                                .slice(0, -3)}
                                            <br />
                                            Til:{" "}
                                            {new Date(
                                                schedule.end_timestamp * 1000
                                            )
                                                .toLocaleString()
                                                .slice(0, -3)}
                                            <br />
                                            <Button
                                                style={{
                                                    height: "30px",
                                                    marginTop: "10px",
                                                    marginBottom: "5px",
                                                    minWidth: "170px",
                                                    maxWidth: "190px",
                                                }}
                                                onClick={() => {
                                                    setSchedule(schedule)
                                                    setIsOpen(true)
                                                }}
                                            >
                                                Legg til endringer
                                            </Button>
                                        </Table.DataCell>
                                        <Table.DataCell
                                            style={{
                                                minWidth: "210px",
                                                maxWidth: "210px",
                                            }}
                                        >
                                            <ScheduleChanges
                                                periods={schedule.vakter.filter(
                                                    (vakt) =>
                                                        vakt.type == "bistand"
                                                )}
                                                setResponse={setResponse}
                                            ></ScheduleChanges>
                                            <ScheduleChanges
                                                periods={schedule.vakter.filter(
                                                    (vakt) =>
                                                        vakt.type == "bakvakt"
                                                )}
                                                setResponse={setResponse}
                                            ></ScheduleChanges>
                                        </Table.DataCell>
                                        <Table.DataCell
                                            style={{
                                                minWidth: "210px",
                                                maxWidth: "210px",
                                            }}
                                        >
                                            <ScheduleChanges
                                                periods={schedule.vakter.filter(
                                                    (vakt) =>
                                                        vakt.type == "bytte"
                                                )}
                                                setResponse={setResponse}
                                            ></ScheduleChanges>
                                        </Table.DataCell>

                                    </Table.Row>
                                )
                            })}
                    </Table.Body>
                </Table>
            </div>
        </>
    )
}

export default UpdateSchedule
