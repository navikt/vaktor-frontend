import {
  Button,
  Table,
  Loader,
  UNSAFE_DatePicker, UNSAFE_useRangeDatepicker, HelpText
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
  const { datepickerProps, toInputProps, fromInputProps, selectedRange } =
    UNSAFE_useRangeDatepicker({
      fromDate: new Date("Jan 01 2022"),
      onRangeChange: console.log,
    });

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
      <div style={{
        marginTop: "2vh",
        marginBottom: "3vh",
        display: "grid",
        alignItems: "center",
        justifyContent: "space-around",
      }}>


        <div>
          <UNSAFE_DatePicker {...datepickerProps} style={{
          }}>
            <div style={{
              display: "flex",
              gap: "15px",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <UNSAFE_DatePicker.Input {...fromInputProps} label="Fra" />
              <UNSAFE_DatePicker.Input {...toInputProps} label="Til" />
            </div>
          </UNSAFE_DatePicker>
        </div>

        <Table
          style={{
            minWidth: "500px",
            maxWidth: "500px",
            backgroundColor: "white",
            marginTop: "2vh",
            marginBottom: "3vh",

          }}
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">
                <div style={{
                  display: "flex",
                  alignItems: "space-around",
                }}>ID
                  <HelpText title="Hva brukes ID til?" style={{
                    marginLeft: "10px"
                  }}>

                    <b>Id:</b> Brukes for å bestemme hvilken rekkefølge vakthaverne skal gå vakt. Den som står øverst vil få første vakt når nye perioder genereres
                  </HelpText>
                </div>
              </Table.HeaderCell>
              <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
              <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
              <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
              <Table.HeaderCell scope="col">
                <div style={{
                  display: "flex",
                  alignItems: "space-around",
                }}>Aktiv
                  <HelpText title="Hva brukes aktiv toggle til?" style={{
                    marginLeft: "10px"
                  }}>
                    <b>Aktiv toggle:</b> Toggles til av dersom en vakthaver <b>ikke</b> skal nkluderes i nye vaktperioder<br />
                  </HelpText>
                </div>
              </Table.HeaderCell>
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
            minWidth: "210px",
            marginBottom: "15px",
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
      </div >
    </>
  );
};

export default Vaktperioder;
