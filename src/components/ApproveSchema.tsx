import { Button, Table } from "@navikt/ds-react";
import { useEffect, useState } from "react";

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
    <Table.DataCell
      style={{ backgroundColor: statusColor, maxWidth: "90px" }}
    >
      {statusText}
    </Table.DataCell>
  );
};

const Admin = () => {
  const [itemData, setItemData] = useState();

  useEffect(() => {
    Promise.all([fetch("/vaktor/api/schedules")])
      .then(async ([scheduleRes]) => {
        const schedulejson = await scheduleRes.json();
        return [schedulejson];
      })
      .then(([itemData]) => {
        setItemData(itemData);
      });
  }, []);

  if (itemData === undefined) return <></>;
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
                user,
                group,
                start_timestamp,
                end_timestamp,
                approve_level,
              },
              i
            ) => {
              return (
                <Table.Row key={i}>
                  <Table.HeaderCell scope="row">
                    {user.name}
                  </Table.HeaderCell>
                  <Table.DataCell>
                    {new Date(
                      start_timestamp * 1000
                    ).toLocaleDateString("en-NO")}
                  </Table.DataCell>
                  <Table.DataCell>
                    {new Date(
                      end_timestamp * 1000
                    ).toLocaleDateString("en-NO")}
                  </Table.DataCell>
                  <Table.DataCell>
                    {group.name}
                  </Table.DataCell>
                  <Table.DataCell
                    style={{ maxWidth: "150px" }}
                  >
                    <div>
                      <Button
                        style={{ height: "35px" }}
                        onClick={() =>
                          console.log(user)
                        }
                      >
                        {" "}
                        Godkjenn{" "}
                      </Button>
                      <Button
                        style={{
                          backgroundColor: "#f96c6c",
                          marginLeft: "5px",
                          height: "35px",
                        }}
                        onClick={() =>
                          console.log(user)
                        }
                      >
                        {" "}
                        Avvis{" "}
                      </Button>
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
