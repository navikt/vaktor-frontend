import { Modal, Heading, BodyLong } from "@navikt/ds-react";
import {
  InformationColored,
  People,
  CoApplicant,
  Calender,
} from "@navikt/ds-icons";
import "@navikt/ds-css";
import { useEffect, useState } from "react";
import {
  IconWrapper,
  InformationLine,
  InfoTextWrapper,
  Spacer,
} from "./GroupDetailsModal";
import moment from "moment";

const ItemDetailsModal = (props: {
  handleClose: Function;
  groupName?: string;
  userName?: string;
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
          {/*Vaktperiode Heading*/}
          <InformationLine>
            <Heading spacing level="1" size="large">
              <IconWrapper topPosition={40}>
                <InformationColored />
              </IconWrapper>
              <InfoTextWrapper leftPosition={47}>Vaktperiode</InfoTextWrapper>
            </Heading>
          </InformationLine>

          <BodyLong spacing>
            {/*Vaktlag*/}
            <Spacer height={10} />
            <InformationLine>
              <IconWrapper topPosition={106}>
                <CoApplicant />
              </IconWrapper>
              <InfoTextWrapper leftPosition={24}>
                <b>Vaktlag: </b>
                {props.groupName}
              </InfoTextWrapper>
            </InformationLine>

            {/*Vakthaver*/}
            <Spacer height={12} />
            <InformationLine>
              <IconWrapper topPosition={147}>
                <People />
              </IconWrapper>
              <InfoTextWrapper leftPosition={24}>
                <b>Vakthaver: </b>
                {props.userName}
              </InfoTextWrapper>
            </InformationLine>

            {/*Varighet på vaktperiode*/}
            <Spacer height={12} />
            <InformationLine>
              <IconWrapper topPosition={187}>
                <Calender />
              </IconWrapper>
            </InformationLine>
            <InfoTextWrapper leftPosition={24}>
              <b>Varighet: </b>
              {props.startTime}
              {" - "}
              {props.endTime}
            </InfoTextWrapper>
          </BodyLong>
        </Modal.Content>
      </Modal>
    </>
  );
};
export default ItemDetailsModal;
