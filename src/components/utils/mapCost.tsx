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
                                        Total: <b className={isDarkMode ? 'text-green-400' : 'text-green-700'}>{cost.total_cost}</b>
                                    </div>
                                    <div className="text-sm text-text-subtle">
                                        Koststed: <b>{cost.koststed}</b>
                                    </div>
                                    {prevTotalCost !== undefined && cost.type_id >= 1 && idx > 0 && (
                                        <div
                                            className={`text-sm mt-1 ${diff < 0 ? (isDarkMode ? 'text-red-400' : 'text-red-600') : isDarkMode ? 'text-green-400' : 'text-green-700'}`}
                                        >
                                            Diff: ({diff < 0 ? '-' : '+'}&#39;{Math.abs(diff).toFixed(2)})
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

    return (
        <div>
            {props.vakt.cost.length !== 0 ? (
                <>
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
