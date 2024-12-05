// ApproveStatus.tsx

import { Table } from '@navikt/ds-react'
import React from 'react'
import { Error_messages } from '../../types/types'

interface ApproveStatusProps {
    status: number
    error: any
}

const MapApproveStatus: React.FC<ApproveStatusProps> = ({ status, error }) => {
    let statusText = ''
    let statusColor = ''
    let errorText = ''

    switch (status) {
        case 1:
            statusText = 'Godkjent av ansatt'
            statusColor = '#66CBEC'
            break
        case 2:
            statusText = 'Venter på utregning '
            statusColor = '#99DEAD'
            errorText = error.map((messages: Error_messages, idx: number) => (
                <div
                    key={idx}
                    style={{
                        color: 'red',
                    }}
                >
                    {messages.error}
                </div>
            ))
            break
        case 3:
            statusText = 'Godkjent av vaktsjef'
            statusColor = '#99DEAD'
            break
        case 4:
            statusText = 'Godkjent av BDM'
            statusColor = '#E18071'
            break
        case 5:
            statusText = 'Overført til lønn'
            statusColor = '#E18071'
            break
        case 6:
            statusText = 'Venter på utregning av diff'
            statusColor = '#99DEAD'
            break
        case 7:
            statusText = 'Utregning fullført med diff'
            statusColor = '#99DEAD'
            break
        case 8:
            statusText = 'Overført til lønn etter rekjøring'
            statusColor = '#E18071'
            break
        default:
            statusText = 'Trenger godkjenning'
            statusColor = '#FFFFFF'
            break
    }

    return (
        <Table.DataCell
            style={{
                backgroundColor: statusColor,
                maxWidth: '150',
                minWidth: '150',
            }}
        >
            {statusText}
            {errorText}
        </Table.DataCell>
    )
}

export default MapApproveStatus
