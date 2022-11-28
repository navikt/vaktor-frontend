import { Button, Popover } from "@navikt/ds-react";
import { RefObject, Dispatch, useRef, useState } from "react";
import { Schedules } from "../types/types";

const ScheduleChanges = (props: {
  periods: Schedules[];
  setResponse: Dispatch<any>;
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openState, setOpenState] = useState<boolean>(false);

  return (
    <>
      {props.periods.map((bakvakter, index) => (
        <div key={index}>
          <b>{bakvakter.user.name}</b>
          <br />
          Fra:{" "}
          {new Date(bakvakter.start_timestamp * 1000)
            .toLocaleString()
            .slice(0, -3)}
          <br />
          Til:{" "}
          {new Date(bakvakter.end_timestamp * 1000)
            .toLocaleString()
            .slice(0, -3)}
          <br />
          {bakvakter.approve_level === 0 ? (
            <>
              <Button
                onClick={() => {
                  setOpenState(true);
                  console.log("Schedule id", bakvakter.id);
                }}
                style={{
                  maxWidth: "210px",
                  marginTop: "5px",
                  marginBottom: "5px",
                }}
                variant="danger"
                size="small"
                ref={buttonRef}
              >
                Slett endring
              </Button>
              <Popover
                open={openState}
                onClose={() => setOpenState(false)}
                anchorEl={buttonRef.current}
              >
                <Popover.Content
                  style={{
                    backgroundColor: "rgba(241, 241, 241, 1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  Sletting av perioden kan ikke angres!
                  <Button
                    style={{ minWidth: "50%", margin: "auto" }}
                    size="small"
                    variant="danger"
                    onClick={() =>
                      delete_schedule(bakvakter.id, props.setResponse)
                    }
                  >
                    Slett!
                  </Button>
                </Popover.Content>
              </Popover>
            </>
          ) : (
            <div style={{ color: "red" }}>Kan ikke slettes</div>
          )}
        </div>
      ))}
    </>
  );
};

const delete_schedule = async (
  schedule_id: string,
  setResponse: Dispatch<any>
) => {
  await fetch(`/vaktor/api/delete_schedule?schedule_id=${schedule_id}`)
    .then((r) => r.json())
    .then((data) => {
      setResponse(data);
    });
};

export default ScheduleChanges;
