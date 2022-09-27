import { Modal, Button, Alert, Heading, BodyLong } from "@navikt/ds-react";
import { Telephone, Dialog, InformationColored } from "@navikt/ds-icons";
import "@navikt/ds-css";
import styled from "styled-components";
import { useEffect, useState } from "react";

const InformationLine = styled.div.attrs(
  (props: { leftPosition?: number }) => props
)`
  display: block;
  padding-left: ${(props) => props.leftPosition}px;
`;

const IconWrapper = styled.div.attrs((props: { topPosition: number }) => props)`
  display: inline-block;
  position: absolute;
  top: ${(props) => props.topPosition}px;
`;

const InfoTextWrapper = styled.div.attrs(
  (props: { leftPosition: number }) => props
)`
  display: inline-block;
  position: relative;
  left: ${(props) => props.leftPosition}px;
`;

const GroupDetailsModal = (props: {
  handleClose: Function;
  groupName: string;
  groupTelephone?: string;
  groupSlack?: string;
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
        aria-label="Modal demo"
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
              <InfoTextWrapper leftPosition={44}>
                {props.groupName}
              </InfoTextWrapper>
            </Heading>
          </InformationLine>

          <BodyLong spacing>
            <InformationLine>
              <IconWrapper topPosition={96}>
                <Telephone />
              </IconWrapper>

              <InfoTextWrapper leftPosition={24}>
                <b>Vakttelefon: </b>
                {"(+47) 12 34 56 78"}
              </InfoTextWrapper>
            </InformationLine>
            <InformationLine>
              <IconWrapper topPosition={126}>
                <Dialog />
              </IconWrapper>

              <InfoTextWrapper leftPosition={24}>
                <b>Slack: </b>
                {"@slack.name"}
              </InfoTextWrapper>
            </InformationLine>
          </BodyLong>
        </Modal.Content>
      </Modal>
    </>
  );
};
export default GroupDetailsModal;
