import React from 'react'
import { Modal } from '@navikt/ds-react'
import { Alert, Heading } from '@navikt/ds-react'
import { XMarkOctagonIcon } from '@navikt/aksel-icons'

type Props = {
    errorMessage: string | null
    onClose: () => void
}

const ErrorModal: React.FC<Props> = ({ errorMessage, onClose }) => {
    return (
        <Modal
            open={Boolean(errorMessage)}
            onClose={onClose}
            closeOnBackdropClick={true}
            header={{
                heading: 'En feil har oppstått!',
            }}
        >
            <Modal.Body>
                <Alert variant="error">{errorMessage}</Alert>
            </Modal.Body>
        </Modal>
    )
}

export default ErrorModal
