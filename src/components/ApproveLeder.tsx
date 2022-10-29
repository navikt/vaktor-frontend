import {
  Button,
  Table,
  Loader,
  UNSAFE_MonthPicker,
  UNSAFE_useMonthpicker,
} from "@navikt/ds-react";
import { useEffect, useState, Dispatch } from "react";
import { Audit, Schedules, User } from "../types/types";

let today = Date.now() / 1000;
//let today = 1668470400  // 15. November 2022 00:00:00

const confirm_schedule = async (
  schedule_id: string,
  setResponse: Dispatch<any>,
  setLoading: Dispatch<any>
) => {
  setLoading(true);

  await fetch(`/vaktor/api/confirm_schedule?schedule_id=${schedule_id}`)
    .then((r) => r.json())
    .then((data) => {
      setLoading(false);
      setResponse(data);
    });
};

const disprove_schedule = async (
  schedule_id: string,
  setResponse: Dispatch<any>,
  setLoading: Dispatch<any>
) => {
  setLoading(true);
  await fetch(`/vaktor/api/disprove_schedule?schedule_id=${schedule_id}`)
    .then((r) => r.json())
    .then((data) => {
      setLoading(false);
      setResponse(data);
    });
};

const mapAudit = (audit: Audit[]) => {
  return audit.map((audit: Audit, index) => (
    <div key={audit.id}>
      {audit.timestamp.slice(0, -10).replace("T", " ")} - {audit.action} - {audit.user.name}
    </div>
  ));
};

const mapApproveStatus = (status: number) => {
  let statusText = "";
  let statusColor = "";
  switch (status) {
    case 1:
      statusText = "Godkjent av ansatt";
      statusColor = "#66CBEC";
      break;
    case 2:
      statusText = "Venter på utregning";
      statusColor = "#99DEAD";
      break;
    case 3:
      statusText = "Godkjent av vaktsjef";
      statusColor = "#99DEAD";
      break;
    case 4:
      statusText = "Overført til lønn";
      statusColor = "#E18071";
      break;
    default:
      statusText = "Trenger godkjenning";
      statusColor = "#FFFFFF";
      break;
  }

  return (
    <Table.DataCell style={{ backgroundColor: statusColor, maxWidth: "90px" }}>
      {statusText}
    </Table.DataCell>
  );
};

const AdminLeder = () => {
  const [itemData, setItemData] = useState<Schedules[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({} as User);
  const [response, setResponse] = useState();
  const [loading, setLoading] = useState(false);
  const { monthpickerProps, inputProps, selectedMonth, setSelected } =
    UNSAFE_useMonthpicker({
      fromDate: new Date("Oct 01 2022"),
      toDate: new Date("Aug 23 2025"),
      defaultSelected: new Date(),
    });

  const mapVakter = (vaktliste: Schedules[]) => vaktliste.map((vakter: Schedules, i: number) => (
    //approve_level = 2;

    <Table.Row key={i}>
      <Table.HeaderCell scope="row">{vakter.user.name}</Table.HeaderCell>
      <Table.DataCell scope="row">{vakter.type}</Table.DataCell>
      <Table.DataCell>
        {new Date(vakter.start_timestamp * 1000).toLocaleDateString()}<br />
        {new Date(vakter.end_timestamp * 1000).toLocaleDateString()}
      </Table.DataCell>
      <Table.DataCell>{vakter.group.name}</Table.DataCell>
      <Table.DataCell style={{ maxWidth: "150px" }}>
        <div>
          <Button
            disabled={
              vakter.approve_level === 4 ||
              vakter.approve_level === 2 ||
              vakter.end_timestamp > today
            }
            style={{
              height: "30px",
              marginBottom: "5px",
              minWidth: "210px",
            }}
            onClick={() => {
              confirm_schedule(vakter.id, setResponse, setLoading);
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
              disprove_schedule(vakter.id, setResponse, setLoading)
            }
          >
            {" "}
            Avgodkjenn{" "}
          </Button>
        </div>
      </Table.DataCell>
      {mapApproveStatus(vakter.approve_level)}
      {["personaleder", "leveranseleder"].includes(currentUser!.role) && <Table.DataCell scope="row">{vakter.cost}</Table.DataCell>}
      <Table.DataCell scope="row">{vakter.audits.length !== 0 ? mapAudit(vakter.audits) : "Ingen hendelser"}</Table.DataCell>
    </Table.Row>
  ));

  useEffect(() => {
    setLoading(true);
    Promise.all([fetch("/vaktor/api/leader_schedules"), fetch("/vaktor/api/get_me")])
      .then(async ([scheduleRes, userRes]) => {
        const schedulejson = await scheduleRes.json();
        const userjson = await userRes.json();
        return [schedulejson, userjson];
      })
      .then(([itemData, userData]) => {
        itemData.sort(
          (a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp
        );

        setItemData(itemData);
        setCurrentUser(userData)
        setLoading(false);
      });
  }, [response]);

  if (loading === true) return <Loader></Loader>;

  if (itemData === undefined) return <></>;
  if (selectedMonth === undefined) setSelected(new Date());
  return (
    <>
      <div className="min-h-96">
        <UNSAFE_MonthPicker {...monthpickerProps}>
          <div className="grid gap-4">
            <UNSAFE_MonthPicker.Input {...inputProps} label="Velg måned" />
          </div>
        </UNSAFE_MonthPicker>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
            <Table.HeaderCell scope="col">Type vakt</Table.HeaderCell>
            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
            <Table.HeaderCell scope="col">Gruppe</Table.HeaderCell>
            <Table.HeaderCell scope="col">Actions</Table.HeaderCell>
            <Table.HeaderCell scope="col">Status</Table.HeaderCell>
            {["personaleder", "leveranseleder"].includes(currentUser!.role) && <Table.HeaderCell scope="col">Kostnad</Table.HeaderCell>}
            <Table.HeaderCell scope="col">Audit</Table.HeaderCell>

          </Table.Row>
        </Table.Header>
        <Table.Body>
          {mapVakter(itemData.filter(
            (value: Schedules) =>
              new Date(value.start_timestamp * 1000).getMonth() ===
              selectedMonth!.getMonth()
          )
          )}

        </Table.Body>
      </Table>
    </>
  );
};

export default AdminLeder;
