import { Modal, Button, Alert, Heading, BodyLong } from "@navikt/ds-react";
import "@navikt/ds-css";
import { useEffect, useState } from "react";




const GroupDetailsModal = (props: { handleClose: Function }) => {
  useEffect(() => {
    if (Modal && Modal.setAppElement) {
      Modal.setAppElement("#__next");
    }

  },[])

  
  return (
    <>
      <Modal
        open={true}
        aria-label="Modal demo"
        onClose={() => props.handleClose()}
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
