import { Dispatch, useCallback, useEffect, useState } from "react";
import { User } from "../types/types";
import { Switch, Table, TextField } from "@navikt/ds-react";

const findFirstMissing = (array: number[]): number => {
  for (var i = 0; i < array.length; i++) {
    if (array[i] !== i + 1) {
      return i + 1;
    }
  }
  return 0;
};

const PerioderOptions = (props: {
  member: User;
  setItemData: Dispatch<User[]>;
  itemData: User[];
}) => {
  const [error, setError] = useState("");
  const [groupOrderIndexes, setGroupOrderIndexes] = useState<number[]>([]);

  useEffect(() => {
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

    var indexList = props.itemData.map((user: User) => user.group_order_index!);
    setGroupOrderIndexes(indexList);
  }, [props, setGroupOrderIndexes]);

  const handleIndexChange = (index: number) => {
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
      handleIndexChange(findFirstMissing(groupOrderIndexes));
    } else {
      handleIndexChange(100);
    }
  };

  return (
    <Table.Row key={props.member.name}>
      <Table.DataCell>
        <TextField
          label="ID"
          hideLabel
          defaultValue={
            props.member.group_order_index === 100
              ? ""
              : props.member.group_order_index
          }
          disabled={props.member.group_order_index === 100}
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
          checked={props.member.group_order_index !== 100}
          onChange={(e) => handleChange(e.target.checked)}
        >
          Aktiv
        </Switch>
      </Table.DataCell>
    </Table.Row>
  );
};

export default PerioderOptions;
