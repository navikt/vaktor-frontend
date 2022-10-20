import {
  Button,
  Table,
  Loader,
  UNSAFE_useRangeDatepicker,
  UNSAFE_DatePicker,
} from "@navikt/ds-react";
import { useEffect, useState, Dispatch } from "react";
import { Schedules } from "../types/types";
import moment from "moment";

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

const get_week_number = (start_timestamp: number) => {
  const today = new Date(start_timestamp * 1000);
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear =
    (today.valueOf() - firstDayOfYear.valueOf()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const UpdateSchedule = () => {
  const [scheduleData, setScheduleData] = useState<Schedules[]>([]);
  const [response, setResponse] = useState();
  const [loading, setLoading] = useState(false);
  const { datepickerProps, toInputProps, fromInputProps, selectedRange } =
    UNSAFE_useRangeDatepicker({
      fromDate: new Date("Aug 23 2019"),
    });

  useEffect(() => {
    setLoading(true);
    Promise.all([fetch("/vaktor/api/group_schedules")])
      .then(async ([groupsRes]) => {
        const scheduleData = await groupsRes.json();
        return [scheduleData];
      })
      .then(([scheduleData]) => {
        scheduleData.sort(
          (a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp
        );
        setScheduleData(scheduleData);
        setLoading(false);
      });
  }, [response]);

  if (loading === true) return <Loader></Loader>;
  return (
    <>
      <div className="min-h-96">
        <UNSAFE_DatePicker {...datepickerProps}>
          <div className="flex flex-wrap justify-center gap-4">
            <UNSAFE_DatePicker.Input {...fromInputProps} label="Fra" />
            <UNSAFE_DatePicker.Input {...toInputProps} label="Til" />
          </div>
        </UNSAFE_DatePicker>
        {selectedRange && (
          <div className="pt-4">
            <div>
              {selectedRange?.from && selectedRange.from.toDateString()}
            </div>
            <div>{selectedRange?.to && selectedRange.to.toDateString()}</div>
          </div>
        )}
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Navn</Table.HeaderCell>
            <Table.HeaderCell scope="col">Ukenummer</Table.HeaderCell>
            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
            <Table.HeaderCell scope="col">Handling</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {scheduleData.map(
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
                  </Table.DataCell>
                  <Table.DataCell style={{ maxWidth: "150px" }}>
                    <Button
                      style={{
                        height: "30px",
                        marginBottom: "5px",
                        minWidth: "210px",
                      }}
                      onClick={() => {
                        console.log(id, approve_level);
                        confirm_schedule(id, setResponse, setLoading);
                      }}
                    >
                      Endre
                    </Button>
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
