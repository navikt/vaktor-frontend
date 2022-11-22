import {
  Button,
  Table,
  Loader,
  ReadMore,
  CheckboxGroup,
  Checkbox,
} from "@navikt/ds-react";
import { useEffect, useState, Dispatch } from "react";
import { Vaktlag, Schedules, User } from "../types/types";
import PerioderOptions from "./PerioderOptions";

const createSchedule = async (
  users: User[],
  setResponse: Dispatch<any>,
  start_timestamp: number,
  end_timestamp: number,
  midlertidlig_vakt: boolean
) => {
  //setLoading(true);

  var user_order = users.map((user) => user.id); // bare en liste med identer
  await fetch(
    `/vaktor/api/create_schedule/?group_id=${users[0].groups[0].id}&start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}&midlertidlig_vakt=${midlertidlig_vakt}&user_order=${user_order}`
  )
    .then((r) => r.json())
    .then((data) => {
      //setLoading(false);
      setResponse(data);
    });
};

const Vaktperioder = () => {
  const [itemData, setItemData] = useState<User[]>([]);
  const [response, setResponse] = useState();
  const [loading, setLoading] = useState(false);
  const [isMidlertidlig, setIsMidlertidlig] = useState(false);
  const [activeMembers, setActiveMembers] = useState<User[]>([]);
  const [startTimestamp, setStartTimestamp] = useState<number>(0);
  const [endTimestamp, setEndTimestamp] = useState<number>(0);

  activeMembers.length === 0 && itemData.length !== 0
    ? setActiveMembers(itemData)
    : false;

  const mapMembers = (members: User[]) =>
    members
      .sort((a: User, b: User) => a.group_order_index! - b.group_order_index!)
      .map((user, index) => {
        if (user.group_order_index === undefined) {
          user.group_order_index = index + 1;
        }
        console.log("index: : ", user.group_order_index);
        user.id = user.id.toUpperCase();
        return (
          //approve_level = 2;

          <PerioderOptions
            member={user}
            key={index}
            setActiveMembers={setActiveMembers}
            activeMembers={activeMembers}
            itemData={members}
            setItemData={setItemData}
          ></PerioderOptions>
        );
      });

  useEffect(() => {
    if (activeMembers.length === 0) {
      setLoading(true);
      Promise.all([fetch("/vaktor/api/get_my_groupmembers")])
        .then(async ([scheduleRes]) => {
          const schedulejson = await scheduleRes.json();
          return [schedulejson];
        })
        .then(([itemData]) => {
          itemData.sort(
            (a: Schedules, b: Schedules) =>
              a.start_timestamp - b.start_timestamp
          );

          setItemData(itemData);
          setLoading(false);
        });
    } else {
      console.log("users: ", activeMembers);
    }
  }, [response, activeMembers]);

  if (loading === true) return <Loader></Loader>;

  return (
    <>
      <Table
        style={{
          minWidth: "500px",
          maxWidth: "500px",
          backgroundColor: "white",
          marginBottom: "3vh",
        }}
      >
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
          {activeMembers.length !== 0 && itemData ? (
            mapMembers(itemData)
          ) : (
            <Table.Row></Table.Row>
          )}
        </Table.Body>
      </Table>
      <Button
        style={{
          backgroundColor: "#f96c6c",
          height: "30px",
          minWidth: "210px",
        }}
        onClick={() =>
          createSchedule(
            activeMembers,
            setResponse, //setLoading
            startTimestamp,
            endTimestamp,
            isMidlertidlig
          )
        }
      >
        Generer vaktperioder
      </Button>
    </>
  );
};

export default Vaktperioder;
