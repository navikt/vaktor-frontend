import { Textarea } from '@navikt/ds-react'
import { Edit, SuccessStroke } from '@navikt/ds-icons'
import '@navikt/ds-css'
import { useState } from 'react'
import { User } from '../types/types'

const UpdateUserInfo = async (user: User) => {
    var fetchOptions = {
        method: 'PUT',
        body: JSON.stringify(user),
    }

    await fetch(`/vaktor/api/update_user/`, fetchOptions)
}

// Required props
interface requiredProps {
    infoName: string
    infoText: string
}
// Optional props
interface optionalProps {
    editable: boolean
    icon: JSX.Element
    user: User
}
// Combine required and optional props to build the full prop interface
interface props extends requiredProps, optionalProps {}

// set default value on optional props
const defaultProps: optionalProps = {
    editable: false,
    icon: <></>,
    user: {} as User,
}

const UserInfoDetails = (props: props) => {
    const { infoName, infoText, editable, icon, user } = props
    const [edit, setEdit] = useState<boolean>(false)
    const [userInfo, setUserInfo] = useState<string>(infoText)

    return editable ? (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
            }}
        >
            {edit ? (
                <>
                    {icon}
                    <p>
                        <b> {infoName}</b>
                    </p>
                    <Textarea label="" hideLabel defaultValue={userInfo} onChange={(e) => setUserInfo(e.target.value)} />
                    <SuccessStroke
                        style={{ marginLeft: '20px' }}
                        onClick={() => {
                            infoName == 'Kontaktinfo: ' ? (user.contact_info = userInfo) : (user.description = userInfo)
                            UpdateUserInfo(user)
                            setEdit(false)
                        }}
                    />
                </>
            ) : (
                <>
                    {icon}
                    <p>
                        <b> {infoName}</b>
                        {userInfo}
                        <Edit style={{ marginLeft: '20px' }} onClick={() => setEdit(true)} />
                    </p>
                </>
            )}
        </div>
    ) : (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
            }}
        >
            {icon}
            <b> {infoName}</b> {infoText}
        </div>
    )
}
UserInfoDetails.defaultProps = defaultProps

export default UserInfoDetails
