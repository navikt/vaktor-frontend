import { Button, Table, Loader } from "@navikt/ds-react";
import { useEffect, useState, Dispatch } from "react";
import { User, Vaktlag } from "../types/types";

let today = Date.now() / 1000
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


const get_groups = async (
    group_id: string,
    setResponse: Dispatch<any>,
    setLoading: Dispatch<any>
) => {
    setLoading(true);
    await fetch(`/vaktor/api/get_current_user_roles/?group_id=${group_id}`)
        .then((r) => r.json())
        .then((data) => {
            setLoading(false);
            setResponse(data);
        });
};


const AssignLeder = () => {
    const [groupData, setgroupData] = useState<User[]>([]);
    const [roleData, setroleData] = useState<Vaktlag[]>([]);
    const [response, setResponse] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        let group_id = "5dfb2622-51b1-40b9-8f8d-a6c4e0d8f998"
        Promise.all([fetch("/vaktor/api/groups"), fetch(`/vaktor/api/get_current_user_roles/?group_id=${group_id}`)])
            .then(async ([groupsRes, rolesRes]) => {
                const groupsjson = await groupsRes.json();
                const rolesjson = await rolesRes.json();
                return [groupsjson, rolesjson];
            })
            .then(([groupData, roleData]) => {
                setgroupData(groupData);
                setroleData(roleData);
                setLoading(false);
            });
    }, [response]);

    if (loading === true) return <Loader></Loader>;

    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Leder</Table.HeaderCell>
                    <Table.HeaderCell scope="col">actions</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {groupData.map(
                    (
                        { name, id },
                        i
                    ) => {
                        //approve_level = 0;
                        return (
                            <Table.Row key={i}>
                                <Table.HeaderCell scope="row" style={{ maxWidth: "150px" }}>{name}
                                    <br />  {id}
                                </Table.HeaderCell>

                                <Table.DataCell>

                                    {
                                        // Map out current leaders
                                        /*
                                        roleData.leaders.map((leaders, index) => {
                                            return (
                                                <div key={index}>
                                                    {leaders.name} - {leaders.role}
                                                </div>
                                            );
                                        })
                                        */
                                    }

                                </Table.DataCell>

                                <Table.DataCell style={{ maxWidth: "150px" }}>
                                    <div>

                                        <Button
                                            style={{
                                                'height': "35px",
                                                'margin-bottom': "10px",
                                                'min-width': "210px",
                                            }}
                                            onClick={() => {
                                                assign_leader(id, setResponse, setLoading);
                                            }}
                                        >
                                            {" "}
                                            Sett meg som leder{" "}
                                        </Button>
                                        <br />

                                        <Button
                                            style={{
                                                backgroundColor: "#f96c6c",
                                                height: "35px",
                                                'min-width': "210px",
                                            }}
                                            onClick={() =>
                                                remove_leader(id, setResponse, setLoading)
                                            }
                                        >
                                            {" "}
                                            Fjern meg som Leder{" "}
                                        </Button>

                                    </div>
                                </Table.DataCell>
                            </Table.Row>
                        );
                    }
                )}
            </Table.Body>
        </Table >
    );
};

export default AssignLeder;