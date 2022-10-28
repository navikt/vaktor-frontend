import { useEffect, useState, Dispatch } from "react";
import React from "react";
import {
  Button,
  Select,
  RadioGroup,
  Radio,
  TextField,
  Modal,
} from "@navikt/ds-react";
import { Schedules, User, Period } from "../types/types";
import moment from "moment";
//import TextField from "./testComp";

const update_schedule = async (
  period: Period,
  isBakvakt: boolean,
  selectedVakthaver: string,
  addVakt: Dispatch<any>,
) => {
  await fetch(
    `/vaktor/api/update_schedule?schedule_id=${period.schedule_id}&bakvakt=${isBakvakt}&selectedVakthaver=${selectedVakthaver}&group_id=${period.group_id}&dateFrom=${period.start_timestamp}&dateTo=${period.end_timestamp}`
  )
    .then((r) => r.json())
    .then((data) => {
      addVakt(data);
    });
};

const mapGroupOptions = (members: User[]) => {
  return members.map((user: User, index) => (
    <option key={index} value={user.id}>
      {user.name}
    </option>
  ));
};

type props = {
  schedule: Schedules;
  isOpen: boolean;
  setIsOpen: Dispatch<boolean>;
  setResponse: Dispatch<any>;
  addVakt: Dispatch<any>;
};

const removeMilliFromISO = (timestamp: number) => {
  let m_date = moment
    .unix(timestamp)
    .toISOString(true)
    .split("Z")[0]
    .slice(0, -13);
  return m_date;
};

const ScheduleModal = (props: props) => {
  const [groupData, setgroupData] = useState<User[]>([]);
  const [selectedVakthaver, setVakthaver] = useState("");
  const [bakvakt, setBakvakt] = useState(true);
  const [timeFrom, setTimeFrom] = useState(new Date().setHours(12, 0));
  const [timeTo, setTimeTo] = useState(new Date().setHours(12, 0))

  useEffect(() => {
    if (Modal && Modal.setAppElement) {
      Modal.setAppElement("#__next");
    }
    Promise.all([fetch("/vaktor/api/get_my_groupmembers")])

      .then(async ([membersRes]) => {
        props.setResponse(membersRes.status);
        const groupData = await membersRes.json();
        return [groupData];
      })
      .then(([groupData]) => {
        setgroupData(groupData);
      });
  }, [props]);

  const tilComp = React.cloneElement(
    <TextField
      onChange={(e) => setTimeTo(new Date(e.target.value).getTime() / 1000)}
      label="Til"
      min={removeMilliFromISO(props.schedule.start_timestamp)}
      max={removeMilliFromISO(props.schedule.end_timestamp)}
    />,
    {
      type: "datetime-local",
    }
  );

  const fraComp = React.cloneElement(
    <TextField
      onChange={(e) => setTimeFrom(new Date(e.target.value).getTime() / 1000)}
      label="Fra"
      min={removeMilliFromISO(props.schedule.start_timestamp)}
      max={removeMilliFromISO(props.schedule.end_timestamp)}
    />,
    {
      type: "datetime-local",
    }
  );

  return (
    <>
      <Modal
        open={props.isOpen}
        aria-label="Modal demo"
        onClose={() => props.setIsOpen(!props.isOpen)}
        aria-labelledby="modal-heading"
      >
        <Modal.Content>
          {" "}
          <div className="contentEndring">
            <Select
              label="vakthaver"
              className="buttonConfirm"
              onChange={(e) => {
                setVakthaver(e.target.value);
              }}
              size="medium"
              style={{
                marginBottom: "20px",
              }}
            >
              <option value="">Velg vakthaver</option>
              {mapGroupOptions(groupData)}
            </Select>

            <RadioGroup
              legend="Hva skal gjøres med opprinnelig plan"
              onChange={(valg: any) => setBakvakt(valg)}
            >
              <Radio value="true">
                Legg eksisterende person som bakvakt (f.eks ved sykdom)
              </Radio>
              <Radio value="false">
                Erstatt eksisterende vakt (f.eks ved bytte)
              </Radio>
            </RadioGroup>
            <div style={{ display: "flex" }}>
              {fraComp}
              {tilComp}
            </div>

            <br />
            <Button
              className="buttonConfirm"
              disabled={selectedVakthaver === ""}
              style={{
                height: "50px",
                marginTop: "25px",
                marginBottom: "25px",
                minWidth: "300px",
              }}
              onClick={() => {
                let period = {
                  ...props.schedule,
                  start_timestamp: timeFrom,
                  end_timestamp: timeTo,
                  schedule_id: props.schedule.id,
                };
                update_schedule(period, bakvakt, selectedVakthaver, props.addVakt);
                props.setIsOpen(false);
              }}
            >
              Legg til endring
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default ScheduleModal;
