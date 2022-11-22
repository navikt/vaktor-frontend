import { Dispatch, useCallback, useEffect, useState } from "react";
import { User } from "../types/types";
import { Switch, Table, TextField } from "@navikt/ds-react";

const PerioderOptions = (props: {
  member: User;
  activeMembers: User[];
  setActiveMembers: Dispatch<User[]>;
  setItemData: Dispatch<any>;
  itemData: User[];
}) => {
  const [error, setError] = useState("");
  const [switchisActive, setSwitchisActive] = useState(true);
  // const [error, setError] = useState();

  useEffect(() => {
    console.log(props.itemData);
    props.itemData
      .map(
        (user) =>
          user.group_order_index === props.member.group_order_index &&
          user.ressursnummer != props.member.ressursnummer &&
          user.group_order_index !== 100
      )
      .includes(true)
      ? setError("Duplikate indekser")
      : setError("");
  }, [props]);

  const handleIndexChange = (index: number) => {
    //var lengthOfList = props.itemData.if(index);
    // validere:

    var tmpArray = [...props.itemData];

    tmpArray.forEach((user) => {
      if (user.ressursnummer === props.member.ressursnummer) {
        user.group_order_index = index;
      }
    });

    props.setItemData(tmpArray); // sortering
  };

  const handleChange = (isActive: boolean) => {
    if (isActive == true) {
      setSwitchisActive(true);
      handleIndexChange(props.itemData.length);
      props.setActiveMembers([...props.activeMembers, props.member]);
    } else {
      var tmpArray = [...props.activeMembers];
      tmpArray.forEach((user, idx) => {
        if (user.ressursnummer === props.member.ressursnummer) {
          tmpArray.splice(idx, 1);
        }
      });
      handleIndexChange(100);
      setSwitchisActive(false);
      props.setActiveMembers(tmpArray);
    }
  };

  return (
    <Table.Row key={props.member.name}>
      <Table.DataCell>
        <TextField
          disabled={props.member.group_order_index === 100}
          label="ID"
          hideLabel
          defaultValue={
            props.member.group_order_index === 100
              ? ""
              : props.member.group_order_index
          }
          maxLength={2}
          size="small"
          htmlSize={14}
          type="number"
          min={1}
          max={99}
          onChange={(e) => handleIndexChange(Number(e.target.value))}
          error={error !== "" ? error : false}
        />
      </Table.DataCell>
      <Table.HeaderCell scope="row">{props.member.id}</Table.HeaderCell>
      <Table.DataCell>{props.member.name}</Table.DataCell>
      <Table.DataCell>{props.member.role}</Table.DataCell>
      <Table.DataCell>
        <Switch
          checked={props.activeMembers
            .map(
              (member) => props.member.ressursnummer === member.ressursnummer
            )
            .includes(true)}
          onChange={(e) => handleChange(e.target.checked)}
        >
          Aktiv
        </Switch>
      </Table.DataCell>
    </Table.Row>
  );
};

export default PerioderOptions;
