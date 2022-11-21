import { Button, Table, Loader, ReadMore, CheckboxGroup, Checkbox } from "@navikt/ds-react"
import { useEffect, useState, Dispatch } from "react"
import { Vaktlag, Schedules, User } from "../types/types"
import PerioderOptions from "./PerioderOptions"

let today = Date.now() / 1000
//let today = 1668470400  // 15. November 2022 00:00:00

const confirm_schedule = async (
    group_id: string,
    setResponse: Dispatch<any>,
    setLoading: Dispatch<any>
) => {
    setLoading(true)

    await fetch(`/vaktor/api/generate_schedule?group_id=${group_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false)
            setResponse(data)
        });
};


const Vaktperioder = () => {
    const [itemData, setItemData] = useState()
    const [response, setResponse] = useState()
    const [loading, setLoading] = useState(false)
    const [activeMembers, setActiveMembers] = useState<User[]>([])

    activeMembers.length === 0 && itemData ? setActiveMembers(itemData) : false

    const mapMembers = (members: User[]) => members.map((user, index) => (
        //approve_level = 2;

        <PerioderOptions member={user} key={index} setActiveMembers={setActiveMembers} activeMembers={activeMembers}></PerioderOptions>
    ))
    console.log(activeMembers)
    useEffect(() => {
        setLoading(true);
        Promise.all([fetch("/vaktor/api/get_my_groupmembers")])
            .then(async ([scheduleRes]) => {
                const schedulejson = await scheduleRes.json()
                return [schedulejson]
            })
            .then(([itemData]) => {
                itemData.sort(
                    (a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp
                );

                setItemData(itemData)
                setLoading(false)
            });
    }, [response]);

    if (loading === true) return <Loader></Loader>

    return (
        <Table
            style={{
                minWidth: "500px",
                maxWidth: "500px",
                backgroundColor: "white",
                marginBottom: "3vh",
            }}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Id</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Aktiv</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>


                {activeMembers.length !== 0 && itemData ? mapMembers(itemData) : <Table.Row></Table.Row>}

            </Table.Body>
        </Table >
    );
};

export default Vaktperioder;