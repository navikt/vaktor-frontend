import { Modal, Heading, BodyLong, Textarea } from "@navikt/ds-react"
import {
    InformationColored,
    People,
    CoApplicant,
    Calender,
    Telephone,
    Notes,
    Dialog,
} from "@navikt/ds-icons"
import "@navikt/ds-css"
import { useEffect, useState } from "react"
import {
    IconWrapper,
    InformationLine,
    InfoTextWrapper,
    HeadingIcon,
    InfoHeadWrapper,
    Spacer,
} from "./GroupDetailsModal"
import moment from "moment"
import { User } from "../types/types"

const UpdateDescription = async (value: string) => {
    await fetch(`/vaktor/api//?textValue=${value}`)
}

const UpdateContactInfo = async (value: string, user: User) => {
    user.contact_info = value
    var fetchOptions = {
        method: "PUT",
        body: JSON.stringify(user),
    }

    await fetch(`/vaktor/api/update_user/`, fetchOptions)
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

    var endTime = props.endTime

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

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        <div style={{ display: "flex", gap: "8px" }}>
                            <CoApplicant />
                            <b>Vaktlag:</b>
                            {props.groupName}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Telephone />
                            <b>Vakttelefon:</b> {phonetext}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <People />
                            <b>Vakthaver:</b>
                            {props.userName}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Dialog />
                            <b>Kontaktinfo:</b>{" "}
                            {props.canEdit ? (
                                <Textarea
                                    maxRows={3}
                                    label="Har du noen tilbakemeldinger?"
                                    hideLabel
                                    defaultValue={props.user.contact_info}
                                    style={{ minWidth: "250px" }}
                                    onBlur={(e) =>
                                        UpdateContactInfo(
                                            e.target.value,
                                            props.user
                                        )
                                    }
                                />
                            ) : (
                                props.user.contact_info
                            )}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Notes />
                            <b>Beskrivelse:</b>{" "}
                            {props.canEdit ? (
                                <Textarea
                                    maxRows={3}
                                    label="Har du noen tilbakemeldinger?"
                                    hideLabel
                                    defaultValue={props.description}
                                    style={{ minWidth: "250px" }}
                                    onBlur={(e) =>
                                        UpdateDescription(e.target.value)
                                    }
                                />
                            ) : (
                                props.description
                            )}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Calender />
                            <b>Valgt periode:</b> {props.startTime} -{" "}
                            {props.endTime}
                        </div>
                    </div>
                </Modal.Content>
            </Modal>
        </>
    )
}
export default ItemDetailsModal
