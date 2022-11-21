import { useEffect, useState, Dispatch } from "react";
import React from "react";
import {
  Button,
  Select,
  RadioGroup,
  Radio,
  TextField,
  Modal,
  ConfirmationPanel,
} from "@navikt/ds-react";
import { Schedules, User } from "../types/types";
import moment from "moment";
//import TextField from "./testComp";

const update_schedule = async (
  period: Schedules,
  action: string,
  selectedVakthaver: string,
  addVakt: Dispatch<any>,
) => {
  await fetch(
    `/vaktor/api/update_schedule?schedule_id=${period.id}&action=${action}&selectedVakthaver=${selectedVakthaver}&group_id=${period.group_id}&dateFrom=${period.start_timestamp}&dateTo=${period.end_timestamp}`
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
  const [action, setAction] = useState("");
  const [timeFrom, setTimeFrom] = useState(props.schedule.start_timestamp);
  const [timeTo, setTimeTo] = useState(props.schedule.end_timestamp);
  const [confirmState, setConfirmState] = useState(false);

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

  console.log(timeTo)
  const tilComp = React.cloneElement(
    <TextField
      onChange={(e) => setTimeTo(new Date(e.target.value).getTime())}
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
      onChange={(e) => setTimeFrom(new Date(e.target.value).getTime())}
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
        aria-label="Modal for vaktperioder"
        onClose={() => {
          props.setIsOpen(!props.isOpen);
          setConfirmState(false);
        }
        }
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
              {mapGroupOptions(groupData.filter((user: User) => user.id.toUpperCase() !== props.schedule.user_id.toUpperCase()))}
            </Select>

            <RadioGroup
              legend="Hva skal gjøres med opprinnelig plan"
              onChange={(valg: any) => setAction(valg)}
            >
              <Radio value="bakvakt">
                Legg til som bakvakt
              </Radio>
              <Radio value="bytte">
                Erstatt eksisterende vakt (f.eks ved bytte)
              </Radio>
              <Radio value="bistand">
                Sett eksisterede person som bakvakt og bistå (f.eks ved sykdom for opprinnelig vakthaver)
              </Radio>
              <Radio value="replace">
                Bytt hele vaktperioden med en annen (skal <b>ikke</b> brukes ved sykdom)
              </Radio>
            </RadioGroup>
            {action !== "replace" &&
              <div style={{ display: "flex", justifyContent: "space-evenly" }}>
                {fraComp}
                {tilComp}
              </div>
            }
            <br />
            <ConfirmationPanel
              checked={confirmState}
              label="Ja, jeg har fylt ut korrekt."
              onChange={() => setConfirmState((x) => !x)}
            >
              Vær nøyaktig når du fyller ut start/slutt <b>dato</b> og <b>tid</b>.
            </ConfirmationPanel>
            <br />
            <Button
              className="buttonConfirm"
              //disabled={selectedVakthaver === ""}
              disabled={confirmState === false}
              style={{
                height: "50px",
                marginTop: "25px",
                marginBottom: "25px",
                minWidth: "300px",

              }}
              onClick={() => {
                let period = {
                  ...props.schedule,
                  start_timestamp: action === "replace" ? props.schedule.start_timestamp : timeFrom / 1000,
                  end_timestamp: action === "replace" ? props.schedule.end_timestamp : timeTo / 1000,
                  schedule_id: props.schedule.id,
                };
                update_schedule(period, action, selectedVakthaver, props.addVakt);
                props.setIsOpen(false);
                setConfirmState(false);


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
