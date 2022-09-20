import { Modal, Button, Alert, Heading, BodyLong } from "@navikt/ds-react";
import "@navikt/ds-css";
import { useEffect, useState } from "react";
function ModalBox() {
  const [openState, setOpen] = useState(false);
  useEffect(() => {
    const appElement =
      typeof document !== "undefined"
        ? (document.getElementById("#_next") as HTMLElement)
        : undefined;
    if (Modal && Modal.setAppElement) {
      Modal.setAppElement(appElement);
    }
  }, []);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Åpne modal</Button>
      <Modal
        open={openState}
        aria-label="Modal demo"
        onClose={() => setOpen((x) => !x)}
      >
        <Modal.Content>
          <Heading spacing level="1" size="large">
            Laborum proident id ullamco
          </Heading>
          <Heading spacing level="2" size="medium">
            Excepteur labore nostrud incididunt exercitation.
          </Heading>
          <BodyLong spacing>
            Culpa aliquip ut cupidatat laborum minim quis ex in aliqua. Qui
            incididunt dolor do ad ut. Incididunt eiusmod nostrud deserunt duis
            laborum. Proident aute culpa qui nostrud velit adipisicing minim.
            Consequat aliqua aute dolor do sit Lorem nisi mollit velit. Aliqua
            exercitation non minim minim pariatur sunt laborum ipsum.
            Exercitation nostrud est laborum magna non non aliqua qui esse.
          </BodyLong>
        </Modal.Content>
      </Modal>
    </>
  );
}
export default ModalBox;
