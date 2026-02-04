import { Button, ReadMore } from '@navikt/ds-react'
import { DateTime } from 'luxon'
import { Audit } from '../../types/types'
import { useState } from 'react'

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'

const MapAudit = ({ audits }: { audits: Audit[] }) => {
    const [expanded, setExpanded] = useState(false)

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    audits.sort((a, b) => {
        const timestampA = DateTime.fromISO(a.timestamp, { zone: 'utc' }).setZone('Europe/Oslo')
        const timestampB = DateTime.fromISO(b.timestamp, { zone: 'utc' }).setZone('Europe/Oslo')
        return timestampA.valueOf() - timestampB.valueOf()
    })

    let visibleAudits = audits
    let hiddenAudits: Audit[] = []
    if (audits.length > 5) {
        visibleAudits = audits.slice(audits.length - 5)
        hiddenAudits = audits.slice(0, audits.length - 5)
    }

    return (
        <div style={{ fontSize: '0.85em' }}>
            {hiddenAudits.length > 0 && (
                <div>
                    <Button
                        size="small"
                        style={{ display: 'flex', minWidth: '200px', backgroundColor: 'transparent', color: 'green' }}
                        onClick={toggleExpanded}
                    >
                        {expanded ? (
                            <div>
                                <ChevronUpIcon /> View Less
                            </div>
                        ) : (
                            <div>
                                <ChevronDownIcon /> View More
                            </div>
                        )}
                    </Button>
                </div>
            )}

            {expanded &&
                hiddenAudits.map((audit: Audit, index) => {
                    const timestamp = DateTime.fromISO(audit.timestamp, { zone: 'utc' }).setZone('Europe/Oslo')

                    const date = timestamp.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                    const time = timestamp.toLocaleString(DateTime.TIME_24_WITH_SECONDS)

                    return (
                        <div key={audit.id}>
                            <ReadMore
                                header={`${date} - ${time}`}
                                size="small"
                                style={
                                    audit.action.includes('Avgodkjent')
                                        ? { color: 'red', fontSize: '0.85em' }
                                        : { color: 'green', fontSize: '0.85em' }
                                }
                            >
                                <span style={{ fontSize: '0.9em' }}>
                                    {audit.action} - {audit.user.name}
                                </span>
                            </ReadMore>
                        </div>
                    )
                })}

            {visibleAudits.map((audit: Audit, index) => {
                const timestamp = DateTime.fromISO(audit.timestamp, { zone: 'utc' }).setZone('Europe/Oslo')

                const date = timestamp.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                const time = timestamp.toLocaleString(DateTime.TIME_24_WITH_SECONDS)

                return (
                    <div key={audit.id}>
                        <ReadMore
                            header={`${date} - ${time}`}
                            size="small"
                            style={
                                audit.action.includes('Avgodkjent') ? { color: 'red', fontSize: '0.85em' } : { color: 'green', fontSize: '0.85em' }
                            }
                        >
                            <span style={{ fontSize: '0.9em' }}>
                                {audit.action} - {audit.user.name}
                            </span>
                        </ReadMore>
                    </div>
                )
            })}
        </div>
    )
}

export default MapAudit
