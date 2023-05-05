import { Cost, Artskoder, Schedules } from '../../types/types'

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

    return <div>{statusText}</div>
}

const MapCost: Function = (props: { vakt: Schedules; avstemming?: boolean }) => {
    return props.vakt.cost
        .sort((a: Cost, b: Cost) => Number(a.type_id) - Number(b.type_id))
        .map((cost: Cost, idx) => {
            return (
                <div
                    key={cost.id}
                    style={{
                        marginBottom: '25px',
                    }}
                >
                    {props.avstemming === true ? <b>ID: {cost.id}</b> : false}
                    <div>{props.vakt.is_double === true ? <b>Dobbeltvakt</b> : ''}</div>
                    <div
                        style={{
                            marginTop: '5px',
                            display: 'flex',
                            gap: '20px',
                        }}
                    >
                        <div>
                            Total Sum: <b style={{ color: 'green' }}> {cost.total_cost}</b>{' '}
                        </div>
                        {mapCostStatus(Number(cost.type_id))}
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '15px',
                            marginTop: '15px',
                        }}
                    >
                        <div>
                            <b>Artskoder</b>
                            {cost.artskoder
                                .sort((a: Artskoder, b: Artskoder) => Number(a.type) - Number(b.type))
                                .map((artskode, index) => (
                                    <div key={index}>
                                        <b> {artskode.type}:</b> {artskode.sum}
                                    </div>
                                ))}
                        </div>
                        <div>
                            <b>Antall timer</b>
                            {cost.artskoder
                                .sort((a: Artskoder, b: Artskoder) => Number(a.type)! - Number(b.type)!)
                                .map((artskode, index) => (
                                    <div key={index}>
                                        <b> {artskode.type}: </b> {artskode.hours}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )
        })
}

export default MapCost
