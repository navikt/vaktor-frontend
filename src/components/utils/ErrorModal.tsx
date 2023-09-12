import React from 'react'
import { Modal } from '@navikt/ds-react'
import { Alert, Heading } from '@navikt/ds-react'

type Props = {
    errorMessage: string | null
    onClose: () => void
}

const ErrorModal: React.FC<Props> = ({ errorMessage, onClose }) => {
    return (
        <Modal open={Boolean(errorMessage)} onClose={onClose}>
            <Modal.Body>
                <Alert variant="error">
                    <Heading spacing size="small" level="3">
                        En feil har oppstått!
                    </Heading>
                    {errorMessage}
                </Alert>
            </Modal.Body>
        </Modal>
    )
}

export default ErrorModal
