import { ReadMore } from '@navikt/ds-react'
import { DateTime } from 'luxon'
import { Audit } from '../../types/types'

const MapAudit = ({ audits }: { audits: Audit[] }) => {
    return (
        <div>
            {audits.map((audit: Audit, index) => {
                const timestamp = DateTime.fromISO(audit.timestamp, { zone: 'utc' }).setZone('Europe/Oslo') // convert to local timezone

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
