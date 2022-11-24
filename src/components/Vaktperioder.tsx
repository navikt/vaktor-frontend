import {
  Button,
  Table,
  Loader,
  UNSAFE_MonthPicker,
  UNSAFE_useMonthpicker,
  HelpText,
  Radio,
  RadioGroup,
  UNSAFE_DatePicker,
  UNSAFE_useRangeDatepicker,
} from "@navikt/ds-react";
import { useEffect, useState, Dispatch } from "react";
import { Vaktlag, Schedules, User } from "../types/types";
import PerioderOptions from "./PerioderOptions";

const createSchedule = async (
  users: User[],
  setResponse: Dispatch<any>,
  start_timestamp: number,
  end_timestamp: number,
  midlertidlig_vakt: boolean,
  rolloverDay: number,
  amountOfWeeks: number
) => {
  //setLoading(true);

  var user_order = users
    .sort((a: User, b: User) => a.group_order_index! - b.group_order_index!)
    .map((user: User) => user.id); // bare en liste med identer
  var url = `/vaktor/api/create_schedule/?group_id=${users[0].groups[0].id}&start_timestamp=${start_timestamp}&end_timestamp=${end_timestamp}&midlertidlig_vakt=${midlertidlig_vakt}&amountOfWeeks=${amountOfWeeks}&rolloverDay=${rolloverDay}`;
  var fetchOptions = {
    method: "POST",
    body: JSON.stringify(user_order),
  };

  await fetch(url, fetchOptions)
    .then((r) => r.json())
    .then((data) => {
      setResponse(data);
    });
};

const Vaktperioder = () => {
  const numWeeksInMs = 6.048e8 * 4; // 4 weeks in ms
  const [itemData, setItemData] = useState<User[]>([]);
  const [response, setResponse] = useState();
  const [loading, setLoading] = useState(false);
  const [isMidlertidlig, setIsMidlertidlig] = useState(true);
  const [startTimestamp, setStartTimestamp] = useState<number>(
    new Date("Jan 01 2023").getTime() / 1000
  );
  const [endTimestamp, setEndTimestamp] = useState<number>(0);
  const [rolloverDay, setRolloverDay] = useState<number>(2);
  const [amountOfWeeks, setAmountOfWeeks] = useState<number>(52);
  const { datepickerProps, toInputProps, fromInputProps, selectedRange } =
    UNSAFE_useRangeDatepicker({
      fromDate: new Date(Date.now() + numWeeksInMs),
      toDate: new Date("Feb 01 2024"),
      defaultMonth: new Date(Date.now() + numWeeksInMs),
      onRangeChange: (val) => {
        if (val && val.from && val.to) {
          setStartTimestamp(val.from.getTime() / 1000);
          setEndTimestamp(val.to.getTime() / 1000);
        }
      },
    });

  const { monthpickerProps, inputProps, selectedMonth } = UNSAFE_useMonthpicker(
    {
      required: true,
      fromDate: new Date("Jan 01 2023"),
      toDate: new Date("Feb 01 2025"),
      defaultYear: new Date("Jan 01 2023"),
      defaultSelected: new Date("Jan 01 2023"),
    }
  );

  const mapMembers = (members: User[]) =>
    members
      .sort((a: User, b: User) => a.group_order_index! - b.group_order_index!)
      .map((user, index) => {
        if (user.group_order_index === undefined) {
          user.group_order_index = index + 1;
        }
        //console.log("index:asdsa : ", user.group_order_index);
        user.id = user.id.toUpperCase();
        return (
          <PerioderOptions
            member={user}
            key={index}
            itemData={members}
            setItemData={setItemData}
          ></PerioderOptions>
        );
      });

  useEffect(() => {
    setLoading(true);
    Promise.all([fetch("/vaktor/api/get_my_groupmembers")])
      .then(async ([scheduleRes]) => {
        const schedulejson = await scheduleRes.json();
        return [schedulejson];
      })
      .then(([itemData]) => {
        setItemData(
          itemData.filter((user: User) => user.role !== "leveranseleder")
        );
        setIsMidlertidlig(
          itemData[0].groups[0].type !== "Døgnkontinuerlig (24/7)"
        );
        setLoading(false);
      });
  }, []);

  if (loading === true) return <Loader></Loader>;

  return (
    <>
      <div
        style={{
          marginTop: "2vh",
          marginBottom: "3vh",
          display: "grid",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {isMidlertidlig ? (
          <div style={{ margin: "auto" }}>
            <UNSAFE_DatePicker {...datepickerProps} style={{}}>
              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UNSAFE_DatePicker.Input {...fromInputProps} label="Fra" />
                <UNSAFE_DatePicker.Input {...toInputProps} label="Til" />
              </div>
            </UNSAFE_DatePicker>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: "40px", marginTop: "15px" }}>
              <UNSAFE_MonthPicker {...monthpickerProps} style={{}}>
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UNSAFE_MonthPicker.Input {...inputProps} label="Fra" />
                </div>
              </UNSAFE_MonthPicker>

              <RadioGroup
                legend="Vaktbytte foretas på: "
                onChange={(val: any) => setRolloverDay(val)}
                defaultValue="2"
              >
                <Radio value="0">Mandag</Radio>
                <Radio value="2">Onsdag</Radio>
              </RadioGroup>
              <RadioGroup
                legend="Opprett vaktplan for: "
                onChange={(val: any) => setAmountOfWeeks(val)}
                defaultValue="52"
              >
                <Radio value="26">6 måneder</Radio>
                <Radio value="52">12 måneder</Radio>
              </RadioGroup>
            </div>
          </>
        )}

        <Table
          style={{
            minWidth: "650px",
            maxWidth: "60vw",
            backgroundColor: "white",
            marginTop: "2vh",
            marginBottom: "3vh",
          }}
        >
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">
                <div
                  style={{
                    display: "flex",
                    alignItems: "space-around",
                  }}
                >
                  ID
                  <HelpText
                    title="Hva brukes ID til?"
                    style={{
                      marginLeft: "10px",
                    }}
                  >
                    <b>Id:</b> Brukes for å bestemme hvilken rekkefølge
                    vakthaverne skal gå vakt. Den som står øverst vil få første
                    vakt når nye perioder genereres
                  </HelpText>
                </div>
              </Table.HeaderCell>
              <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
              <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
              <Table.HeaderCell scope="col">Rolle</Table.HeaderCell>
              <Table.HeaderCell scope="col">
                <div
                  style={{
                    display: "flex",
                    alignItems: "space-around",
                  }}
                >
                  Aktiv
                  <HelpText
                    title="Hva brukes aktiv toggle til?"
                    style={{
                      marginLeft: "10px",
                    }}
                  >
                    <b>Aktiv toggle:</b> Toggles til av dersom en vakthaver{" "}
                    <b>ikke</b> skal nkluderes i nye vaktperioder
                    <br />
                  </HelpText>
                </div>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {itemData ? mapMembers(itemData) : <Table.Row></Table.Row>}
          </Table.Body>
        </Table>
        <Button
          style={{
            minWidth: "210px",
            marginBottom: "15px",
          }}
          onClick={() =>
            createSchedule(
              itemData.filter((user: User) => user.group_order_index !== 100),
              setResponse, //setLoading
              isMidlertidlig ? startTimestamp : selectedMonth!.getTime() / 1000,
              endTimestamp,
              isMidlertidlig,
              rolloverDay,
              amountOfWeeks
            )
          }
        >
          Generer vaktperioder
        </Button>
      </div>
    </>
  );
};

export default Vaktperioder;
