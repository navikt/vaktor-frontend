import { Modal, Heading, BodyLong, Textarea } from "@navikt/ds-react"
import {
    InformationColored,
    People,
    CoApplicant,
    Calender,
    Telephone,
    Notes,
    Dialog,
    Edit,
    SuccessStroke,
    SuccessColored,
} from "@navikt/ds-icons"
import "@navikt/ds-css"
import { useEffect } from "react"
import {
    InformationLine,
    HeadingIcon,
    InfoHeadWrapper,
} from "./GroupDetailsModal"
import { User } from "../types/types"
import UserInfoDetails from "./userInfoDetails"

const iconStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "53px",
    marginRight: "10px",
}

const ItemDetailsModal = (props: {
    handleClose: Function
    groupName?: string
    userName?: string
    description?: string
    telephone?: string
    startTime?: string
    endTime?: string
    canEdit: boolean
    user: User
}) => {
    useEffect(() => {
        if (Modal && Modal.setAppElement) {
            Modal.setAppElement("#__next")
        }
    }, [])

    const phonetext =
        props.telephone == "??" ? "n/a" : "(+47) " + props.telephone

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

                    <UserInfoDetails
                        infoName="Vaktlag: "
                        infoText={props.groupName!}
                        icon={<CoApplicant style={iconStyle} />}
                    />

                    <UserInfoDetails
                        infoName="Vaktnummer: "
                        infoText={phonetext}
                        icon={<Telephone style={iconStyle} />}
                    />

                    <UserInfoDetails
                        infoName="Vakthaver: "
                        infoText={props.user.name}
                        icon={<People style={iconStyle} />}
                    />

                    <UserInfoDetails
                        infoName="Kontaktinfo: "
                        infoText={props.user.contact_info}
                        editable={props.canEdit}
                        icon={<Dialog style={iconStyle} />}
                        user={props.user}
                    />

                    <UserInfoDetails
                        infoName="Beskrivelse: "
                        infoText={props.user.description}
                        editable={props.canEdit}
                        icon={<Notes style={iconStyle} />}
                        user={props.user}
                    />

                    <UserInfoDetails
                        infoName="Valgt periode: "
                        infoText={`${props.startTime} - ${props.endTime}`}
                        icon={<Calender style={iconStyle} />}
                    />
                </Modal.Content>
            </Modal>
        </>
    )
}
export default ItemDetailsModal
