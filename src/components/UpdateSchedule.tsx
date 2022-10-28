import {
  Button,
  Table,
} from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { Schedules, Period } from "../types/types";
import moment from "moment";
import ScheduleModal from "./schedule_modal";

const mapPeriods = (periods: Period[]) =>
  periods.map((bakvakter, index) => (
    <div key={index}>
      {bakvakter.user.name} -{" "}<br />
      {new Date(bakvakter.start_timestamp * 1000).toLocaleString().slice(0, -3)} -{" "}
      {new Date(bakvakter.end_timestamp * 1000).toLocaleString().slice(0, -3)}
    </div>
  ));

const UpdateSchedule = () => {
  const [scheduleData, setScheduleData] = useState<Schedules[]>([]);
  const [selectedSchedule, setSchedule] = useState<Schedules>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [response, setResponse] = useState();
  const [Vakt, addVakt] = useState()

  useEffect(() => {
    Promise.all([fetch("/vaktor/api/group_schedules")])
      .then(async ([scheduleRes]) => {
        const scheduleData = await scheduleRes.json();
        return [scheduleData];
      })
      .then(([scheduleData]) => {
        scheduleData.sort(
          (a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp
        );
        setScheduleData(scheduleData);
      });
  }, [response, Vakt]);

  return (
    <>
      {selectedSchedule ? (
        <ScheduleModal
          schedule={selectedSchedule}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          setResponse={setResponse}
          addVakt={addVakt}
        />
      ) : (
        <></>
      )}
      <Table
        style={{
          minWidth: "900px",
        }}
      >
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
          {scheduleData.map((schedule: Schedules, i) => {
            //approve_level = 0;
            return (
              <Table.Row key={i}>
                <Table.HeaderCell scope="row">
                  {schedule.user.name}
                </Table.HeaderCell>

                <Table.DataCell>
                  {moment(schedule.start_timestamp * 1000).week()}
                </Table.DataCell>

                <Table.DataCell>
                  {new Date(
                    schedule.start_timestamp * 1000
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(schedule.end_timestamp * 1000).toLocaleDateString()}
                  <br />
                  <Button
                    style={{
                      height: "30px",
                      marginTop: "10px",
                      marginBottom: "5px",
                      minWidth: "210px",
                    }}
                    onClick={() => {
                      setSchedule(schedule);
                      setIsOpen(true);
                    }}
                  >
                    Legg til endringer
                  </Button>
                </Table.DataCell>
                <Table.DataCell
                  style={{
                    maxWidth: "210px",
                  }}
                >
                  {
                    // Map out innterruptions (vaktbytter)
                    mapPeriods(schedule.interruptions)
                  }
                </Table.DataCell>
                <Table.DataCell
                  style={{
                    maxWidth: "210px",
                  }}
                >
                  {
                    // Map out bakvakter
                    mapPeriods(schedule.bakvakter)
                  }
                </Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
};

export default UpdateSchedule;
