import { ReadMore } from '@navikt/ds-react'
import { DateTime } from 'luxon'
import { Audit } from '../../types/types'

const MapAudit = ({ audits }: { audits: Audit[] }) => {
    // Sort audits by timestamp in ascending order
    audits.sort((a, b) => {
        const timestampA = DateTime.fromISO(a.timestamp, { zone: 'utc' }).setZone('Europe/Oslo')
        const timestampB = DateTime.fromISO(b.timestamp, { zone: 'utc' }).setZone('Europe/Oslo')
        return timestampA.valueOf() - timestampB.valueOf()
    })

    return (
        <div>
            {audits.map((audit: Audit, index) => {
                const timestamp = DateTime.fromISO(audit.timestamp, { zone: 'utc' }).setZone('Europe/Oslo')

                const date = timestamp.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                const time = timestamp.toLocaleString(DateTime.TIME_24_WITH_SECONDS)

                return (
                    <div key={audit.id}>
                        <ReadMore
                            header={`${date} - ${time}`}
                            size="small"
                            style={audit.action.includes('Avgodkjent') ? { color: 'red' } : { color: 'green' }}
                        >
                            {audit.action} - {audit.user.name}
                        </ReadMore>
                    </div>
                )
            })}
        </div>
    )
}

export default MapAudit
