import { Dispatch, useState } from "react";
import { User } from "../types/types";
import { Button } from "@navikt/ds-react";

const assign_vaktsjef = async (
  vaktsjef_id: string,
  group_id: string,
  setLoading: Dispatch<any>
) => {
  setLoading(true);

  await fetch(
    `/vaktor/api/assign_vaktsjef/?group_id=${group_id}&user_id=${vaktsjef_id}`,
    { method: "POST" }
  )
    .then((r) => r.json())
    .then((data) => {
      setLoading(false);
    });
};

const GroupOptions = (props: any) => {
  const [item, setItem] = useState({ name: "Velg Vaktsjef", id: "10" });

  const findItem = (user_id: string) => {
    var newItem = props.user_list.find((x: User) => x.id === user_id);
    if (newItem) {
      setItem(newItem);
    }
  };

  if (!item) {
    return <></>;
  } else {
    return (
      <div>
        <select
          style={{ width: 200 }}
          onChange={(e) => findItem(e.target.value)}
        >
          <option value={item.id}>{item.name}</option>
          {props.user_list.map((x: User) => {
            return (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            );
          })}
        </select>
        <Button
          disabled={item.id === "10"}
          style={{
            height: "30px",
            marginTop: "10px",
            minWidth: "210px",
            backgroundColor: "#00803e",
          }}
          onClick={() => {
            assign_vaktsjef(item.id, props.group_id, props.setLoading);
          }}
        >
          {" "}
          Sett vaktsjef{" "}
        </Button>
      </div>
    );
  }
};

export default GroupOptions;
