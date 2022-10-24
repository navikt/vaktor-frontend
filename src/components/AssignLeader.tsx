import { Button, Table, Loader } from "@navikt/ds-react";
import { useEffect, useState, Dispatch } from "react";
import { Vaktlag } from "../types/types";
import GroupOptions from "./GroupOptions";

let today = Date.now() / 1000;
//let today = 1668470400  // 15. November 2022 00:00:00

const assign_leader = async (
    group_id: string,
    setResponse: Dispatch<any>,
    setLoading: Dispatch<any>
) => {
    setLoading(true);

    await fetch(`/vaktor/api/assign_leader/?group_id=${group_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false);
            setResponse(data);
        });
};

const remove_leader = async (
    group_id: string,
    setResponse: Dispatch<any>,
    setLoading: Dispatch<any>
) => {
    setLoading(true);
    await fetch(`/vaktor/api/remove_leader/?group_id=${group_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false);
            setResponse(data);
        });
};

const AssignLeder = () => {
    const [groupData, setgroupData] = useState<Vaktlag[]>([]);
    const [response, setResponse] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetch("/vaktor/api/groups")])
            .then(async ([groupsRes]) => {
                const groupsjson = await groupsRes.json();
                return [groupsjson];
            })
            .then(([groupData, roleData]) => {
                setgroupData(groupData);
                setLoading(false);
            });
    }, [response]);

    if (loading === true) return <Loader></Loader>;

    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Leder(e)</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Sett leveranseleder</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Velg vaktsjef</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {groupData.map(({ name, id, leaders, members }, i) => {
                    var currentselect = "";
                    //approve_level = 0;
                    return (
                        <Table.Row key={i}>
                            <Table.HeaderCell scope="row" style={{ maxWidth: "150px" }}>
                                {name}
                            </Table.HeaderCell>

                            <Table.DataCell>
                                {
                                    // Map out current leaders

                                    leaders.map((leaders, index) => {
                                        return (
                                            <div key={index}>
                                                {leaders.name} - {leaders.role}
                                            </div>
                                        );
                                    })
                                }
                            </Table.DataCell>

                            <Table.DataCell style={{ maxWidth: "150px" }}>
                                <div>
                                    <Button
                                        style={{
                                            height: "30px",
                                            marginBottom: "10px",
                                            minWidth: "210px",
                                        }}
                                        onClick={() => {
                                            assign_leader(id, setResponse, setLoading);
                                        }}
                                    >
                                        Sett meg som leder
                                    </Button>
                                    <br />

                                    <Button
                                        style={{
                                            backgroundColor: "#f96c6c",
                                            height: "30px",
                                            minWidth: "210px",
                                        }}
                                        onClick={() => remove_leader(id, setResponse, setLoading)}
                                    >
                                        Fjern meg som Leder
                                    </Button>
                                </div>
                            </Table.DataCell>
                            <Table.DataCell style={{ maxWidth: "200px", margin: "50px" }}>
                                <GroupOptions
                                    user_list={members}
                                    group_id={id}
                                    setLoading={setLoading}
                                />
                            </Table.DataCell>
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table>
    );
};

export default AssignLeder;
