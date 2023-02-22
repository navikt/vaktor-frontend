import { Modal, Button, Alert, Heading, BodyLong } from '@navikt/ds-react'
import { Telephone, Dialog, InformationColored, Clock } from '@navikt/ds-icons'
import '@navikt/ds-css'
import styled from 'styled-components'
import { useEffect, useState } from 'react'

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

const GroupDetailsModal = (props: { handleClose: Function; groupName: string; groupType?: string; groupTelephone?: string }) => {
    useEffect(() => {
        if (Modal && Modal.setAppElement) {
            Modal.setAppElement('#__next')
        }
    }, [])

    const phonetext = props.groupTelephone == '??' ? 'n/a' : '(+47) ' + props.groupTelephone

    return (
        <>
            <Modal
                open={true}
                aria-label="Informasjons-modal for vaktlag"
                onClose={() => props.handleClose()}
                style={{
                    overlay: {},
                    content: {
                        width: '20%',
                        minWidth: '470px',
                        padding: '5px',
                        paddingTop: '20px',
                        position: 'sticky',
                    },
                }}
            >
                <Modal.Content>
                    {/*Vaktlag Heading*/}
                    <InformationLine>
                        <Heading spacing level="1" size="medium">
                            <HeadingIcon>
                                <InformationColored />
                            </HeadingIcon>
                            <InfoHeadWrapper>{props.groupName}</InfoHeadWrapper>
                        </Heading>
                    </InformationLine>

                    {/*Slack*/}
                    <Spacer height={8} />
                    <InformationLine>
                        <IconWrapper topPosition={92}>
                            <Clock />
                        </IconWrapper>
                        <InfoTextWrapper>
                            <b>{props.groupType}</b>
                        </InfoTextWrapper>
                    </InformationLine>

                    <BodyLong spacing>
                        {/*Vakttelefon*/}
                        <Spacer height={12} />
                        <InformationLine>
                            <IconWrapper topPosition={130}>
                                <Telephone />
                            </IconWrapper>
                            <InfoTextWrapper>
                                <b>Vakttelefon:&nbsp; </b>

                                {phonetext}
                            </InfoTextWrapper>
                        </InformationLine>
                    </BodyLong>
                </Modal.Content>
            </Modal>
        </>
    )
}
export default GroupDetailsModal
