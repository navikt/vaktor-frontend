import { Modal, Button, Alert, Heading, BodyLong } from '@navikt/ds-react'
import { Telephone, Dialog, InformationColored, Clock, CoApplicant } from '@navikt/ds-icons'
import '@navikt/ds-css'
import styled from 'styled-components'
import { useEffect, useState } from 'react'
import UserInfoDetails from './userInfoDetails'

export const InformationLine = styled.div.attrs((props: { leftPosition?: number }) => props)`
    display: block;
    padding-left: ${(props) => props.leftPosition}px;
`

export const HeadingIcon = styled.div`
    display: inline-block;
    position: absolute;
    top: 40px;
`

export const InfoHeadWrapper = styled.div`
    display: inline-block;
    position: relative;
    left: 40px;
`

export const IconWrapper = styled.div.attrs((props: { topPosition: number; leftPosition?: number }) => props)`
    display: inline-block;
    position: absolute;
    top: ${(props) => props.topPosition}px;
    left: 15px;
`

export const InfoTextWrapper = styled.div`
    display: inline-block;
    position: relative;
    left: 20px;
`

export const Spacer = styled.div.attrs((props: { height: number }) => props)`
    height: ${(props) => props.height}px;
`
const iconStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '53px',
    marginRight: '10px',
}

const GroupDetailsModal = (props: { handleClose: Function; groupName: string; groupType?: string; groupTelephone?: string }) => {
    useEffect(() => {}, [])

    const phonetext = props.groupTelephone == '??' ? 'n/a' : '(+47) ' + props.groupTelephone

    return (
        <>
            <Modal
                open={true}
                aria-label="Informasjons-modal for vaktlag"
                onClose={() => props.handleClose()}
                header={{
                    label: 'Informasjon om vaktlag',
                    icon: <InformationColored />,
                    heading: props.groupName,
                }}
                width="medium"
                closeOnBackdropClick
            >
                <Modal.Body>
                    <UserInfoDetails infoName="Vakttype: " infoText={props.groupType!} icon={<CoApplicant style={iconStyle} />} />

                    <UserInfoDetails infoName="Vaktnummer: " infoText={phonetext} icon={<Telephone style={iconStyle} />} />
                </Modal.Body>
            </Modal>
        </>
    )
}
export default GroupDetailsModal
