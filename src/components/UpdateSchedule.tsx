import {
  Button, Table, Loader, UNSAFE_useRangeDatepicker, UNSAFE_DatePicker, Select, RadioGroup, Radio, Popover
} from "@navikt/ds-react";
import { useEffect, useState, Dispatch, useRef } from "react";
import { Schedules, User, Vaktlag } from "../types/types";
import moment from "moment";

const update_schedule = async (
  schedule_id: string,
  bakvakt: boolean,
  selectedVakthaver: string,
  group_id: string,
  dateFrom: number,
  dateTo: number,
  setResponse: Dispatch<any>,
  //setLoading: Dispatch<any>,
) => {
  //setLoading(true);
  console.log(schedule_id, bakvakt, selectedVakthaver, group_id, dateFrom, dateTo)
  await fetch(`/vaktor/api/update_schedule?schedule_id=${schedule_id}&bakvakt=${bakvakt}&selectedVakthaver=${selectedVakthaver}&group_id=${group_id}&dateFrom=${dateFrom}&dateTo=${dateTo}`)
    .then((r) => r.json())
    .then((data) => {
      //setLoading(false);
      setResponse(data);
      console.log(data)
    });
};

const mapGroupOptions = (members: User[]) => {
  return (
    members.map((user: User, index) => (
      <option key={index} value={user.id}>{user.name}</option>
    )))
}

const get_week_number = (start_timestamp: number) => {
  const today = new Date(start_timestamp * 1000);
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear =
    (today.valueOf() - firstDayOfYear.valueOf()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const UpdateSchedule = () => {
  const [scheduleData, setScheduleData] = useState<Schedules[]>([]);
  const [groupData, setgroupData] = useState<User[]>([]);
  const [selectedVakthaver, setVakthaver] = useState("");
  const [selectedPeriode, setPeriode] = useState("");
  const [bakvakt, setBakvakt] = useState(true);
  const [response, setResponse] = useState();
  //const [loading, setLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openState, setOpenState] = useState(false);
  const { datepickerProps, toInputProps, fromInputProps, selectedRange } =
    UNSAFE_useRangeDatepicker({
      fromDate: new Date("Oct 01 2022"),
    });

  useEffect(() => {
    //setLoading(true);
    Promise.all([fetch("/vaktor/api/group_schedules"), fetch("/vaktor/api/get_my_groupmembers")])
      .then(async ([scheduleRes, membersRes]) => {
        const scheduleData = await scheduleRes.json();
        const groupData = await membersRes.json();
        return [scheduleData, groupData];
      })
      .then(([scheduleData, groupData]) => {
        scheduleData.sort(
          (a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp
        );
        setScheduleData(scheduleData);
        setVakthaver(selectedVakthaver);
        setgroupData(groupData);
        setPeriode(selectedPeriode);
        setBakvakt(bakvakt);
        //setLoading(false);
      });
  }, [response]);

  //if (loading === true) return <Loader></Loader>;
  var currentselect = ""
  return (
    <>
      <div className="contentEndring">

        <p>Du har valgt periode: <b>{selectedPeriode && (selectedPeriode)} {!selectedPeriode && ("Du har ikke valgt en periode")}</b></p>


        <Select label="vaktsjef" hideLabel className="buttonConfirm" onChange={(e) => {
          currentselect = e.target.value
          setVakthaver(e.target.value)
          console.log(e.target.value)
        }} size="medium" style={{
          marginBottom: "20px",
        }}
        >
          <option value="">Velg vakthaver</option>
          {mapGroupOptions(groupData)}

        </Select>

        <RadioGroup legend="Hva skal gjøres med opprinnelig plan" onChange={(valg: any) => setBakvakt(valg)}>
          <Radio value="true">Legg eksisterende person som bakvakt (f.eks ved sykdom)</Radio>
          <Radio value="false">Erstatt eksisterende vakt (f.eks ved bytte)</Radio>
        </RadioGroup>

        <UNSAFE_DatePicker {...datepickerProps}>
          <UNSAFE_DatePicker.Input {...fromInputProps} label="Fra" className="contentDate" />

          <UNSAFE_DatePicker.Input {...toInputProps} label="Til" className="contentDate" />

        </UNSAFE_DatePicker >
        <br />
        <Button ref={buttonRef} className="buttonConfirm"
          disabled={((selectedPeriode === "") && (selectedVakthaver === ""))}
          style={{
            height: "50px",
            marginTop: "25px",
            marginBottom: "25px",
            minWidth: "300px",
          }}
          onClick={() => { //add_schedule(id, setResponse, setLoading);
            update_schedule(selectedPeriode, bakvakt, selectedVakthaver, scheduleData[0].group_id, (Date.parse(selectedRange?.from) / 1000), (Date.parse(selectedRange?.to) / 1000), setResponse);
            setOpenState(true);
          }}

        >Legg til endring</Button>
        <Popover
          open={openState}
          onClose={() => {
            setOpenState(false)
          }
          }
          anchorEl={buttonRef.current}
        >
          <Popover.Content>Du har lagt til endring i vaktperiode!</Popover.Content>
        </Popover>


      </div >


      <Table style={{
        minWidth: "900px",
      }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
            <Table.HeaderCell scope="col">Ukenummer</Table.HeaderCell>
            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
            <Table.HeaderCell scope="col">Vaktbytter</Table.HeaderCell>
            <Table.HeaderCell scope="col">Bakvakter</Table.HeaderCell>

          </Table.Row>
        </Table.Header>
        <Table.Body>
          {scheduleData.map(
            (
              {
                id,
                user,
                start_timestamp,
                end_timestamp,
                interruptions,
                bakvakter,
              },
              i
            ) => {
              //approve_level = 0;
              return (
                <Table.Row key={i}>
                  <Table.HeaderCell scope="row">{user.name}</Table.HeaderCell>

                  <Table.DataCell>
                    {moment(start_timestamp * 1000).week()}
                  </Table.DataCell>

                  <Table.DataCell>
                    {new Date(start_timestamp * 1000).toLocaleDateString()} -{" "}
                    {new Date(end_timestamp * 1000).toLocaleDateString()}
                    <br />
                    <Button
                      style={{
                        height: "30px",
                        marginTop: "10px",
                        marginBottom: "5px",
                        minWidth: "210px",
                      }}
                      onClick={() => {
                        setPeriode(id);
                        console.log(id);
                      }}
                    >
                      Velg periode
                    </Button>

                  </Table.DataCell>
                  <Table.DataCell style={{
                    maxWidth: "210px",
                  }}>
                    {
                      // Map out innterruptions (vaktbytter)
                      interruptions.map((interruptions, index) => {
                        return (
                          <div key={index}>
                            {interruptions.user_id} - {new Date(interruptions.start_timestamp * 1000).toLocaleDateString()} - {new Date(interruptions.end_timestamp * 1000).toLocaleDateString()}
                          </div>
                        );
                      })
                    }

                  </Table.DataCell>
                  <Table.DataCell style={{
                    maxWidth: "210px",
                  }}>
                    {
                      // Map out bakvakter
                      bakvakter.map((bakvakter, index) => {
                        return (
                          <div key={index}>
                            {bakvakter.user_id} - {new Date(bakvakter.start_timestamp * 1000).toLocaleDateString()} - {new Date(bakvakter.end_timestamp * 1000).toLocaleDateString()}
                          </div>
                        );
                      })
                    }
                  </Table.DataCell>
                </Table.Row>
              );
            }
          )}
        </Table.Body>
      </Table>
    </>
  );
};

export default UpdateSchedule;
