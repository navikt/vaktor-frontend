import { Modal, Heading, BodyLong } from "@navikt/ds-react";
import {
  InformationColored,
  People,
  CoApplicant,
  Calender,
  Telephone,
  Notes,
} from "@navikt/ds-icons";
import "@navikt/ds-css";
import { useEffect, useState } from "react";
import {
  IconWrapper,
  InformationLine,
  InfoTextWrapper,
  HeadingIcon,
  InfoHeadWrapper,
  Spacer,
} from "./GroupDetailsModal";
import moment from "moment";

const ItemDetailsModal = (props: {
  handleClose: Function;
  groupName?: string;
  userName?: string;
  description?: string;
  telephone?: string;
  startTime?: string;
  endTime?: string;
}) => {
  useEffect(() => {
    if (Modal && Modal.setAppElement) {
      Modal.setAppElement("#__next");
    }
  }, []);

  var endTime = props.endTime;

  return (
    <>
      <Modal
        open={true}
        aria-label="Informasjonsmodal for vaktperiode"
        onClose={() => props.handleClose()}
        style={{
          overlay: {},
          content: {
            width: "20%",
            minWidth: "500px",
            padding: "5px",
            paddingTop: "20px",
            position: "sticky",
          },
        }}
      >
        <Modal.Content>
          {/*Vaktperiode Heading*/}
          <InformationLine>
            <Heading spacing level="1" size="medium">
              <HeadingIcon>
                <InformationColored />
              </HeadingIcon>
              <InfoHeadWrapper>Vaktperiode</InfoHeadWrapper>
            </Heading>
          </InformationLine>

          <BodyLong spacing>
            {/*Vaktlag*/}
            <Spacer height={8} />
            <InformationLine>
              <IconWrapper topPosition={92}>
                <CoApplicant />
              </IconWrapper>
              <InfoTextWrapper>
                <b>Vaktlag:&nbsp; </b>
                {props.groupName}
              </InfoTextWrapper>
            </InformationLine>

            {/*Vakthaver*/}

            <InformationLine>
              <IconWrapper topPosition={120}>
                <People />
              </IconWrapper>
              <InfoTextWrapper>
                <b>Vakthaver:&nbsp; </b>
                {props.userName}
              </InfoTextWrapper>
            </InformationLine>

            {/*Vakttelefon*/}

            <InformationLine>
              <IconWrapper topPosition={150}>
                <Telephone />
              </IconWrapper>
              <InfoTextWrapper>
                <b>Vakttelefon:&nbsp; </b>

                {"(+47) "}
                {props.telephone}
              </InfoTextWrapper>
            </InformationLine>

            <Spacer height={10} />
            <InformationLine>
              <IconWrapper topPosition={188}>
                <Notes />
              </IconWrapper>
              <InfoTextWrapper>
                <b>Beskrivelse:&nbsp; </b>
                {props.description}
              </InfoTextWrapper>
            </InformationLine>

            {/*Varighet på vaktperiode*/}
            <Spacer height={10} />
            <InformationLine>
              <IconWrapper topPosition={228}>
                <Calender />
              </IconWrapper>
              <InfoTextWrapper>
                <b>Varighet:&nbsp; </b>
                {props.startTime}
                {" - "}
                {props.endTime}
              </InfoTextWrapper>
            </InformationLine>
          </BodyLong>
        </Modal.Content>
      </Modal>
    </>
  );
};
export default ItemDetailsModal;
