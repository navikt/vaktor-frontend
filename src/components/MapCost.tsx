import { Cost, Artskoder } from "../types/types"

const MapCost: Function = (props: {
    cost: Cost[];
    avstemming?: boolean;
}) => {
    return props.cost
        .map((cost: Cost) => {
            return (
                <div key={cost.id}>
                    {props.avstemming === true ? <b>ID: {cost.id}</b> : false}
                    <div style={{
                        marginTop: "15px"
                    }}>Total Sum: <b style={{ color: "green" }}> {cost.total_cost}</b> </div>
                    <div style={{
                        display: "flex",
                        gap: "15px",
                        marginTop: "15px"
                    }}>
                        <div>
                            <b>Artskoder</b>
                            {cost.artskoder
                                .sort((a: Artskoder, b: Artskoder) => Number(a.type) - Number(b.type))
                                .map((artskode) => <div><b> {artskode.type}:</b> {artskode.sum}</div>)}
                        </div>
                        <div>
                            <b>Antall timer</b>
                            {cost.artskoder
                                .sort((a: Artskoder, b: Artskoder) => Number(a.type)! - Number(b.type)!)
                                .map((artskode) => <div><b> {artskode.type}: </b> {artskode.hours}</div>)}
                        </div>
                    </div>
                </div >
            )
        })
}

export default MapCost