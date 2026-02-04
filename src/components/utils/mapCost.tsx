import { useEffect, useMemo, useState } from 'react'
import { Cost, Artskoder, Schedules } from '../../types/types'
import { ReadMore } from '@navikt/ds-react'

const mapCostStatus = (status: number) => {
    let statusText = ''
    let statusColor = ''
    switch (status) {
        case 1:
            statusText = 'Ordinær kjøring'
            statusColor = '#66CBEC'
            break
        case 2:
            statusText = 'Lønnsendring'
            statusColor = '#99DEAD'
            break
        case 3:
            statusText = 'Feilutregning/feil i vaktor'
            statusColor = '#99DEAD'
            break
        case 4:
            statusText = 'Sekundærkjøring'
            statusColor = '#E18071'
            break
        default:
            statusText = 'Ukjent status'
            statusColor = '#FFFFFF'
            break
    }

    return (
        <div>
            <b>{statusText}</b>
        </div>
    )
}

const MapCost = (props: { vakt: Schedules; avstemming?: boolean }) => {
    const [prevTotalCost, setPrevTotalCost] = useState<number | undefined>()

    const elements = useMemo(
        () =>
            props.vakt.cost
                .sort((a: Cost, b: Cost) => Number(a.order_id) - Number(b.order_id))
                .map((cost: Cost, idx) => {
                    const currentTotalCost = cost.total_cost
                    const prevCost = idx > 0 ? props.vakt.cost[idx - 1] : null
                    const prevTotalCost = prevCost ? prevCost.total_cost : undefined
                    const diff = prevTotalCost !== undefined ? currentTotalCost - prevTotalCost : 0
                    const element = (
                        <div
                            key={cost.id}
                            style={{
                                marginBottom: '20px',
                                fontSize: '0.9em',
                            }}
                        >
                            {idx > 0 ? <hr style={{ margin: '12px 0' }}></hr> : <></>}
                            {props.avstemming === true ? (
                                <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px' }}>
                                    <b>ID:</b>{' '}
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            border: '1px solid #ccc',
                                            padding: '2px 5px',
                                            cursor: 'pointer',
                                            backgroundColor: '#f9f9f9',
                                            fontSize: '0.9em',
                                        }}
                                        onClick={() => navigator.clipboard.writeText(cost.id)}
                                        title="Click to copy"
                                    >
                                        {cost.id}
                                    </span>
                                </div>
                            ) : (
                                false
                            )}
                            <div>{props.vakt.is_double === true ? <b>Dobbeltvakt</b> : ''}</div>
                            <div
                                style={{
                                    marginTop: '6px',
                                }}
                            >
                                <div>
                                    {mapCostStatus(Number(cost.type_id))}
                                    <div style={{ marginTop: '4px' }}>
                                        Total: <b style={{ color: 'green' }}>{cost.total_cost}</b>
                                    </div>
                                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                                        Koststed: <b>{cost.koststed}</b>
                                    </div>
                                    {prevTotalCost !== undefined && cost.type_id >= 1 && idx > 0 && (
                                        <div style={{ color: diff < 0 ? 'red' : 'green', fontSize: '0.9em', marginTop: '4px' }}>
                                            Diff: ({diff < 0 ? '-' : '+'}
                                            {Math.abs(diff).toFixed(2)})
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '15px',
                                    marginTop: '12px',
                                }}
                            >
                                <div>
                                    <b>Artskoder</b>
                                    {cost.artskoder
                                        .sort((a: Artskoder, b: Artskoder) => Number(a.type) - Number(b.type))
                                        .map((artskode, index) => (
                                            <div key={index}>
                                                <b>{artskode.type}:</b> {artskode.sum}
                                            </div>
                                        ))}
                                </div>
                                <div>
                                    <b>Antall timer</b>
                                    {cost.artskoder
                                        .sort((a: Artskoder, b: Artskoder) => Number(a.type)! - Number(b.type)!)
                                        .map((artskode, index) => (
                                            <div key={index}>
                                                <b>{artskode.type}:</b> {artskode.hours}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )
                    return element
                }),

        [prevTotalCost, props.vakt.cost, props.avstemming, props.vakt.is_double]
    )

    useEffect(() => {
        const updatePrevCost = () => {
            if (props.vakt.cost.length > 0) {
                const currentTotalCost = props.vakt.cost[0].total_cost
                setPrevTotalCost(currentTotalCost)
            }
        }
        updatePrevCost()
    }, [props.vakt.cost])

    const hasMultipleCosts = props.vakt.cost.length > 1

    return (
        <div>
            {props.vakt.cost.length !== 0 ? (
                <>
                    {hasMultipleCosts && (
                        <ReadMore
                            header={`Vis ${props.vakt.cost.length - 1} tidligere beregning${props.vakt.cost.length - 1 > 1 ? 'er' : ''}`}
                            size="small"
                            style={{ marginBottom: '8px', fontSize: '0.85em' }}
                        >
                            {elements.slice(0, -1)}
                        </ReadMore>
                    )}
                    {elements.slice(-1)}
                </>
            ) : (
                'ingen beregning foreligger'
            )}
        </div>
    )
}

export default MapCost
