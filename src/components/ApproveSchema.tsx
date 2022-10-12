import { Button, Table } from "@navikt/ds-react";
import { useEffect,useState } from "react";

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

  if (itemData === undefined ) return ( <></>)
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
        {itemData.filter((value)=> value.group.name == "Infotrygd").map(({ user, group, start_timestamp, end_timestamp, approve_level }, i) => {
          return (
            <Table.Row key={i}>
              <Table.HeaderCell scope="row">{user.name}</Table.HeaderCell>
              <Table.DataCell>{new Date(start_timestamp * 1000).toLocaleDateString("en-NO")}</Table.DataCell>
              <Table.DataCell>
                { new Date(end_timestamp * 1000).toLocaleDateString("en-NO")}
              </Table.DataCell>
              <Table.DataCell>
                {group.name}
              </Table.DataCell>
              <Table.DataCell>
                <Button onClick={() => console.log(user)}> Godkjenn </Button>
                <Button style={{"backgroundColor": "#f96c6c", "marginLeft" : "5px", "marginRight" : "5px"}} onClick={() => console.log(user)}> Avvis </Button>
              </Table.DataCell>
              <Table.DataCell>
                {approve_level}
              </Table.DataCell>

            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default Admin