import { useEffect, useMemo, useState } from 'react'
import { Cost, Artskoder, Schedules } from '../../types/types'
import { ReadMore } from '@navikt/ds-react'
import { useTheme } from '../../context/ThemeContext'

const mapCostStatus = (status: number, isDarkMode: boolean) => {
    let statusText = ''
    let colorClass = ''

    switch (status) {
        case 1:
            statusText = 'Ordinær kjøring'
            colorClass = isDarkMode ? 'text-blue-300' : 'text-blue-600'
            break
        case 2:
            statusText = 'Lønnsendring'
            colorClass = isDarkMode ? 'text-green-300' : 'text-green-600'
            break
        case 3:
            statusText = 'Feilutregning/feil i vaktor'
            colorClass = isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
            break
        case 4:
            statusText = 'Sekundærkjøring'
            colorClass = isDarkMode ? 'text-red-300' : 'text-red-600'
            break
        default:
            statusText = 'Ukjent status'
            colorClass = 'text-text-subtle'
            break
    }

    return (
        <div className={colorClass}>
            <b>{statusText}</b>
        </div>
    )
}

const MapCost = (props: { vakt: Schedules; avstemming?: boolean }) => {
    const { theme } = useTheme()
    const isDarkMode = theme === 'dark'
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
                        <div key={cost.id} className="mb-5 text-sm">
                            {idx > 0 ? <hr className="my-3" /> : null}
                            {props.avstemming === true ? (
                                <div className="text-sm text-text-subtle mb-1">
                                    <b>ID:</b>{' '}
                                    <span
                                        className="inline-block border border-border-default px-1.5 py-0.5 cursor-pointer bg-surface-subtle text-sm"
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
                            <div className="mt-1.5">
                                <div>
                                    {mapCostStatus(Number(cost.type_id), isDarkMode)}
                                    <div className="mt-1">
                                        Total:{' '}
                                        <b className={isDarkMode ? 'text-green-400' : 'text-green-700'}>
                                            {Number(cost.total_cost).toLocaleString('no-NO', { minimumFractionDigits: 2 })}
                                        </b>
                                    </div>
                                    <div className="text-sm text-text-subtle">
                                        Koststed: <b>{cost.koststed}</b>
                                    </div>
                                    {prevTotalCost !== undefined && cost.type_id >= 1 && idx > 0 && (
                                        <div
                                            className={`text-sm mt-1 ${diff < 0 ? (isDarkMode ? 'text-red-400' : 'text-red-600') : isDarkMode ? 'text-green-400' : 'text-green-700'}`}
                                        >
                                            Diff: ({diff < 0 ? '-' : '+'}
                                            {Math.abs(diff).toLocaleString('no-NO', { minimumFractionDigits: 2 })})
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-4 mt-3">
                                <div>
                                    <b>Artskoder</b>
                                    {cost.artskoder
                                        .sort((a: Artskoder, b: Artskoder) => Number(a.type) - Number(b.type))
                                        .map((artskode, index) => (
                                            <div key={index}>
                                                <b>{artskode.type}:</b> {Number(artskode.sum).toLocaleString('no-NO', { minimumFractionDigits: 2 })}
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

        [isDarkMode, props.vakt.cost, props.avstemming, props.vakt.is_double]
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

    const costDiffPanel = useMemo(() => {
        if (props.vakt.cost.length < 2) return null
        const sorted = [...props.vakt.cost].sort((a, b) => Number(a.order_id) - Number(b.order_id))
        const latest = sorted[sorted.length - 1]
        const prev = sorted[sorted.length - 2]
        const totalDiff = Number(latest.total_cost) - Number(prev.total_cost)

        const prevArtMap = Object.fromEntries(prev.artskoder.map((a) => [a.type, a]))
        const latestArtMap = Object.fromEntries(latest.artskoder.map((a) => [a.type, a]))
        const allTypes = Array.from(new Set([...Object.keys(prevArtMap), ...Object.keys(latestArtMap)])).sort()

        const posColor = isDarkMode ? '#7ecf9a' : '#1a5c2e'
        const negColor = isDarkMode ? '#f08080' : '#c00'
        const neutralColor = isDarkMode ? '#b0b0b0' : '#555'

        return (
            <div
                style={{
                    marginBottom: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDarkMode ? '#3a6b4a' : '#b2dfdb'}`,
                    backgroundColor: isDarkMode ? '#1a2e20' : '#f0faf5',
                    fontSize: '0.8em',
                }}
            >
                <div style={{ fontWeight: 700, marginBottom: '6px', color: isDarkMode ? '#7ecf9a' : '#1a5c2e' }}>
                    Endring fra forrige beregning
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ color: neutralColor }}>
                        {Number(prev.total_cost).toLocaleString('no-NO', { minimumFractionDigits: 2 })}
                    </span>
                    <span style={{ color: neutralColor }}>→</span>
                    <span style={{ fontWeight: 700, color: neutralColor }}>
                        {Number(latest.total_cost).toLocaleString('no-NO', { minimumFractionDigits: 2 })}
                    </span>
                    <span
                        style={{
                            marginLeft: '4px',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: totalDiff === 0 ? (isDarkMode ? '#333' : '#e0e0e0') : totalDiff > 0 ? (isDarkMode ? '#1e3a28' : '#d4edda') : (isDarkMode ? '#3a1e1e' : '#fde8e8'),
                            color: totalDiff === 0 ? neutralColor : totalDiff > 0 ? posColor : negColor,
                        }}
                    >
                        {totalDiff === 0 ? '±0' : `${totalDiff > 0 ? '+' : ''}${totalDiff.toLocaleString('no-NO', { minimumFractionDigits: 2 })}`}
                    </span>
                </div>
                {allTypes.map((type) => {
                    const prevSum = Number(prevArtMap[type]?.sum ?? 0)
                    const latSum = Number(latestArtMap[type]?.sum ?? 0)
                    const sumDiff = latSum - prevSum
                    const prevHours = Number(prevArtMap[type]?.hours ?? 0)
                    const latHours = Number(latestArtMap[type]?.hours ?? 0)
                    const hoursDiff = latHours - prevHours
                    if (sumDiff === 0 && hoursDiff === 0) return null
                    return (
                        <div key={type} style={{ marginTop: '4px', color: neutralColor }}>
                            <span style={{ fontWeight: 600 }}>{type}:</span>
                            {sumDiff !== 0 && (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
                                    <span style={{ minWidth: '50px', color: isDarkMode ? '#888' : '#999' }}>kr</span>
                                    <span>{prevSum.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</span>
                                    <span>→</span>
                                    <span>{latSum.toLocaleString('no-NO', { minimumFractionDigits: 2 })}</span>
                                    <span style={{ fontWeight: 700, color: sumDiff > 0 ? posColor : negColor }}>
                                        ({sumDiff > 0 ? '+' : ''}{sumDiff.toLocaleString('no-NO', { minimumFractionDigits: 2 })})
                                    </span>
                                </div>
                            )}
                            {hoursDiff !== 0 && (
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '8px' }}>
                                    <span style={{ minWidth: '50px', color: isDarkMode ? '#888' : '#999' }}>timer</span>
                                    <span>{prevHours}</span>
                                    <span>→</span>
                                    <span>{latHours}</span>
                                    <span style={{ fontWeight: 700, color: hoursDiff > 0 ? posColor : negColor }}>
                                        ({hoursDiff > 0 ? '+' : ''}{hoursDiff})
                                    </span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }, [props.vakt.cost, isDarkMode])

    return (
        <div>
            {props.vakt.cost.length !== 0 ? (
                <>
                    {costDiffPanel}
                    {hasMultipleCosts && (
                        <ReadMore
                            header={`Vis ${props.vakt.cost.length - 1} tidligere beregning${props.vakt.cost.length - 1 > 1 ? 'er' : ''}`}
                            size="small"
                            className="mb-2 text-sm"
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
