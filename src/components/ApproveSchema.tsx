import { Button, Table, Loader, ReadMore } from "@navikt/ds-react"
import moment from "moment"
import { useEffect, useState, Dispatch } from "react"
import { Audit, Cost, Schedules } from "../types/types"

let today = Date.now() / 1000
//let today = 1668470400  // 15. November 2022 00:00:00

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
        const tmp_timestamp = new Date(audit.timestamp).getTime() + 3600000
        const auditTimestamp = new Date(tmp_timestamp).toLocaleString()
        return (
            <div key={audit.id}>
                <ReadMore
                    header={auditTimestamp.slice(0, 20).replace("T", " ")}
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

const mapCost = (cost: Cost[]) => {
    return cost.map((cost: Cost, idx) => {
        return (
            <div key={cost.id} >

                <b>Totalt: {cost.total_cost} </b>< br />
                <div style={{
                    display: "flex",
                    gap: "15px",
                    marginTop: "15px"
                }}>
                    <div style={{

                    }}>
                        <b>Sum</b>
                        <ul style={{
                            marginTop: "0px"
                        }}>
                            {cost.artskoder.map((artskode) => <li> {artskode.type}: {artskode.sum} </li>)}
                        </ul>
                    </div>
                    <div>
                        <b>Antall timer</b>
                        <ul style={{
                            marginTop: "0px"
                        }}>
                            {cost.artskoder.map((artskode) => <li> {artskode.type}: {artskode.hours} </li>)}
                        </ul>
                    </div>
                </div>

            </div >
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
                maxWidth: "210px",
                minWidth: "200px",
            }}
        >
            {statusText}
        </Table.DataCell>
    )
}

const dineVakter = () => {
    const [itemData, setItemData] = useState()
    const [response, setResponse] = useState()
    const [loading, setLoading] = useState(false)

    const mapVakter = (vaktliste: Schedules[]) =>
        vaktliste.map((vakter, index) => (
            //approve_level = 2;
            <Table.Row key={vakter.id}>
                <Table.HeaderCell scope="row">
                    {vakter.group.name}
                </Table.HeaderCell>
                <Table.DataCell>
                    <b>{vakter.type}</b>
                    <br />
                    Uke {moment(vakter.start_timestamp * 1000).week()}{" "}
                    {moment(vakter.start_timestamp * 1000).week() <
                        moment(vakter.end_timestamp * 1000).week()
                        ? " - " + moment(vakter.end_timestamp * 1000).week()
                        : ""}
                    <br />
                    Fra:{" "}
                    {new Date(vakter.start_timestamp * 1000).toLocaleString(
                        "no-NB",
                        {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    )}
                    <br />
                    Til:{" "}
                    {new Date(vakter.end_timestamp * 1000).toLocaleString(
                        "no-NB",
                        {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    )}
                </Table.DataCell>
                <Table.DataCell style={{ maxWidth: "230px" }}>
                    <div>
                        <Button
                            disabled={
                                vakter.approve_level != 0 ||
                                vakter.end_timestamp > today
                            }
                            style={{
                                height: "30px",
                                marginBottom: "5px",
                                minWidth: "210px",
                            }}
                            onClick={() =>
                                confirm_schedule(
                                    vakter.id,
                                    setResponse,
                                    setLoading
                                )
                            }
                        >
                            {" "}
                            Godkjenn{" "}
                        </Button>

                        <Button
                            disabled={vakter.approve_level != 1}
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
                <Table.DataCell style={{ minWidth: "300px" }}>
                    {vakter.cost.length !== 0
                        ? mapCost(vakter.cost)
                        : "ingen beregning foreligger"}
                </Table.DataCell>
                <Table.DataCell>
                    {vakter.audits.length !== 0
                        ? mapAudit(vakter.audits)
                        : "Ingen hendelser"}
                </Table.DataCell>
            </Table.Row>
        ))

    useEffect(() => {
        setLoading(true)
        Promise.all([fetch("/vaktor/api/get_current_user_schedules")])
            .then(async ([scheduleRes]) => {
                const schedulejson = await scheduleRes.json()
                return [schedulejson]
            })
            .then(([itemData]) => {
                itemData.sort(
                    (a: Schedules, b: Schedules) =>
                        a.start_timestamp - b.start_timestamp
                )

                setItemData(itemData)
                setLoading(false)
            })
    }, [response])

    if (loading === true) return <Loader></Loader>

    return (
        <>
            <div
                style={{
                    minWidth: "900px",
                    maxWidth: "1200px",
                    backgroundColor: "white",
                    marginBottom: "3vh",
                    display: "flex",
                    alignContent: "center",
                    margin: "auto",
                }}
            >
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">
                                Gruppe
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                Periode
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                Actions
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                Status
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                Godtgjørelse
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">
                                Audit
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {itemData ? (
                            mapVakter(itemData)
                        ) : (
                            <Table.Row></Table.Row>
                        )}
                    </Table.Body>
                </Table>
            </div>
        </>
    )
}

export default dineVakter
