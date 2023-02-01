import { Button, Popover } from "@navikt/ds-react";
import { Dispatch, useRef, useState } from "react";

const confirm_schedule = async (
    schedule_id: string,
    setResponse: Dispatch<any>,
) => {

    await fetch(`/vaktor/api/confirm_schedule?schedule_id=${schedule_id}`)
        .then((r) => r.json())
        .then((data) => {
            setResponse(data)
        })
}

const ApproveButton: Function = (props: {
    vakt: string;
    setResponse: Dispatch<any>
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [openState, setOpenState] = useState<boolean>(false);

    return (
        <>
            <Button
                onClick={() => {
                    setOpenState(true);
                }}
                style={{
                    height: "30px",
                    marginBottom: "5px",
                    minWidth: "210px",
                }}
                size="small"
                ref={buttonRef}
            >
                Godkjenn
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
                        width: "250px"
                    }}
                >
                    Er du sikker på at du vil godkjenne denne perioden på vegne av vakthaver?
                    <Button
                        style={{
                            height: "30px",
                            marginBottom: "5px",
                            minWidth: "210px",
                        }}
                        size="small"
                        variant="danger"
                        onClick={() => {
                            confirm_schedule(props.vakt, props.setResponse),
                                setOpenState(false),
                                console.log(props.vakt)
                        }

                        }
                    >
                        Godkjenn!
                    </Button>
                </Popover.Content>
            </Popover>
        </>
    )
}

export default ApproveButton