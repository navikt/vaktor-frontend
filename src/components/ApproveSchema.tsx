import { Button, Table } from "@navikt/ds-react";
import { format } from "path";
import { useEffect, useState, Dispatch } from "react";
import { User, Schedules, Vaktlag } from "../types/types";

const confirm_schedule = async (
  schedule_id: string,
  setResponse: Dispatch<any>
) => {
  // setLoading(true)

  await fetch(`/vaktor/api/confirm_schedule?schedule_id=${schedule_id}`)
    .then((r) => r.json())
    .then((data) => {
      // setLoading(false)
      setResponse(data);
    });
};

const disprove_schedule = async (
  schedule_id: string,
  setResponse: Dispatch<any>
) => {
  // setLoading(true)
  await fetch(`/vaktor/api/disprove_schedule?schedule_id=${schedule_id}`)
    .then((r) => r.json())
    .then((data) => {
      // setLoading(false)
      setResponse(data);
    });
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
      statusText = "Godkjent av vaktsjef";
      statusColor = "#99DEAD";
      break;
    case 3:
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

const Admin = () => {
  const [itemData, setItemData] = useState<Schedules[]>([]);
  const [response, setResponse] = useState();

  useEffect(() => {
    // setLoading(true)
    Promise.all([fetch("/vaktor/api/schedules")])
      .then(async ([scheduleRes]) => {
        const schedulejson = await scheduleRes.json();
        return [schedulejson];
      })
      .then(([itemData]) => {
        itemData.sort(
          (a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp
        );
        setItemData(itemData);
        // setLoading(false)
      });
  }, [response]);

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
          <Table.HeaderCell scope="col">start</Table.HeaderCell>
          <Table.HeaderCell scope="col">slutt</Table.HeaderCell>
          <Table.HeaderCell scope="col">gruppe</Table.HeaderCell>
          <Table.HeaderCell scope="col">actions</Table.HeaderCell>
          <Table.HeaderCell scope="col">status</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {itemData
          .filter((value) => value.user.name == "Christer Gabrielsen")
          .map(
            (
              {
                id,
                user,
                group,
                start_timestamp,
                end_timestamp,
                approve_level,
              },
              i
            ) => {
              //approve_level = 2;
              return (
                <Table.Row key={i}>
                  <Table.HeaderCell scope="row">{user.name}</Table.HeaderCell>
                  <Table.DataCell>
                    {new Date(start_timestamp * 1000).toLocaleDateString()}
                  </Table.DataCell>
                  <Table.DataCell>
                    {new Date(end_timestamp * 1000).toLocaleDateString()}
                  </Table.DataCell>
                  <Table.DataCell>{group.name}</Table.DataCell>
                  <Table.DataCell style={{ maxWidth: "150px" }}>
                    <div>
                      {approve_level === 0 && (
                        <Button
                          style={{ height: "35px" }}
                          onClick={() => {
                            console.log(id, approve_level);
                            confirm_schedule(id, setResponse);
                          }}
                        >
                          {" "}
                          Godkjenn{" "}
                        </Button>
                      )}

                      {approve_level === 1 && (
                        <Button
                          style={{
                            backgroundColor: "#f96c6c",
                            marginLeft: "5px",
                            height: "35px",
                          }}
                          onClick={() => disprove_schedule(id, setResponse)}
                        >
                          {" "}
                          Avgodkjenn{" "}
                        </Button>
                      )}
                    </div>
                  </Table.DataCell>
                  {mapApproveStatus(approve_level)}
                </Table.Row>
              );
            }
          )}
      </Table.Body>
    </Table>
  );
};

export default Admin;
