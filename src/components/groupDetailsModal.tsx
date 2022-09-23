import { Modal, Button, Alert, Heading, BodyLong } from "@navikt/ds-react";
import "@navikt/ds-css";
import { useEffect, useState } from "react";

function GroupDetailsModal(props: { isOpen: boolean }) {
  const [openState, setOpen] = useState(false);

  console.log("props = " + props.isOpen);

  useEffect(() => {
    const appElement =
      typeof document !== "undefined"
        ? (document.getElementById("#_next") as HTMLElement)
        : undefined;
    if (Modal && Modal.setAppElement) {
      Modal.setAppElement(appElement);
    }
  }, []);
  setOpen(props.isOpen);
  console.log("Modal state is " + openState);
  return (
    <>
      <Modal
        open={openState}
        aria-label="Modal demo"
        onClose={() => setOpen((x) => !x)}
      >
        <Modal.Content>
          <Heading spacing level="1" size="large">
            Clicked Group
          </Heading>
          <BodyLong spacing>Group info. blablabla</BodyLong>
        </Modal.Content>
      </Modal>
    </>
  );
}
export default GroupDetailsModal;
