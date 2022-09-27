import { Modal, Button, Alert, Heading, BodyLong } from "@navikt/ds-react";
import { Telephone, Dialog, InformationColored } from "@navikt/ds-icons";
import "@navikt/ds-css";
import styled from "styled-components";
import { useEffect, useState } from "react";
import {
  IconWrapper,
  InformationLine,
  InfoTextWrapper,
} from "./GroupDetailsModal";

const ItemDetailsModal = (props: {
  handleClose: Function;
  groupName?: string;
  userName?: string;
  startTime?: number;
  endTime?: number;
}) => {
  useEffect(() => {
    if (Modal && Modal.setAppElement) {
      Modal.setAppElement("#__next");
    }
  }, []);

  return (
    <>
      <Modal
        open={true}
        aria-label="Informasjons-modal for vaktperiode"
        onClose={() => props.handleClose()}
        style={{
          overlay: {
            maxHeight: "827px",
          },
          content: {
            width: "20%",
            minWidth: "400px",
            padding: "5px",
            paddingTop: "20px",
            position: "sticky",
          },
        }}
      >
        <Modal.Content>
          <InformationLine>
            <Heading spacing level="1" size="large">
              <IconWrapper topPosition={40}>
                <InformationColored />
              </IconWrapper>
              <InfoTextWrapper leftPosition={44}>Vaktperiode</InfoTextWrapper>
            </Heading>
          </InformationLine>

          <BodyLong spacing>
            <InformationLine>
              <IconWrapper topPosition={96}>
                <Telephone />
              </IconWrapper>

              <InfoTextWrapper leftPosition={24}>
                <b>Vakthaver: </b>
                {props.userName}
              </InfoTextWrapper>
            </InformationLine>
            <InformationLine>
              <IconWrapper topPosition={126}>
                <Dialog />
              </IconWrapper>

              <InfoTextWrapper leftPosition={24}>
                <b>Vakthaver: </b>
                {"@slack.name"}
              </InfoTextWrapper>
            </InformationLine>
          </BodyLong>
        </Modal.Content>
      </Modal>
    </>
  );
};
export default ItemDetailsModal;
