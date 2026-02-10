import { Button, Modal } from '@navikt/ds-react'
import { InformationColored, People, CoApplicant, Calender, Telephone, Notes, Dialog } from '@navikt/ds-icons'
import '@navikt/ds-css'
import { useEffect } from 'react'
import { User } from '../types/types'
import UserInfoDetails from './utils/UserInfoDetails'
import { useAuth } from '../context/AuthContext'

const iconStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '53px',
    marginRight: '10px',
}

const hasAnyRole = (user: User, roleTitles: string[]): boolean => {
    const hasGlobalRole = user.roles?.some((role) => roleTitles.includes(role.title)) ?? false
    const hasGroupRole = user.group_roles?.some((gr) => roleTitles.includes(gr.role?.title)) ?? false
    return hasGlobalRole || hasGroupRole
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
    schedule_id: string
}) => {
    useEffect(() => {}, [])
    const { user } = useAuth()
    const phonetext = props.telephone == '??' ? 'n/a' : '(+47) ' + props.telephone

    const handleSplitSchedule = async () => {
        await fetch(`/api/split_schedule/?schedule_id=${props.schedule_id}`).then(props.handleClose())
    }

    return (
        <>
            <Modal
                open={true}
                aria-label="Informasjonsmodal for vaktperiode"
                onClose={() => props.handleClose()}
                header={{
                    label: 'Informasjon om valgt periode',
                    icon: <InformationColored />,
                    heading: 'Vaktperiode',
                }}
                width="small"
                closeOnBackdropClick
            >
                <Modal.Body>
                    {/*Vaktperiode Heading*/}

                    <UserInfoDetails infoName="Vaktlag: " infoText={props.groupName!} icon={<CoApplicant style={iconStyle} />} />

                    <UserInfoDetails infoName="Vaktnummer: " infoText={phonetext} icon={<Telephone style={iconStyle} />} />

                    <UserInfoDetails infoName="Vakthaver: " infoText={props.user.name} icon={<People style={iconStyle} />} />

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
                    {hasAnyRole(user, ['admin']) ? <Button onClick={handleSplitSchedule}>Split vakt</Button> : <></>}
                </Modal.Body>
            </Modal>
        </>
    )
}
export default ItemDetailsModal
