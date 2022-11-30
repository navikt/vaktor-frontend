import { Table } from "@navikt/ds-react"
import { Vaktlag } from "../types/types"

const Overview = (props: { groups: Vaktlag[] }) => {
    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Vaktlag</Table.HeaderCell>
                    <Table.HeaderCell scope="col">
                        Vakttelefon.
                    </Table.HeaderCell>
                    <Table.HeaderCell scope="col">Slack</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Beskrivelse</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Type</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {props.groups.map(
                    ({ name, phone, slack, id, description, type }, i) => {
                        return (
                            <Table.Row key={i + id}>
                                <Table.DataCell>{name}</Table.DataCell>
                                <Table.DataCell>{phone}</Table.DataCell>
                                <Table.DataCell>
                                    {slack === "" ? "Ikke oppgitt" : slack}
                                </Table.DataCell>
                                <Table.DataCell>{description}</Table.DataCell>
                                <Table.DataCell>{type}</Table.DataCell>
                            </Table.Row>
                        )
                    }
                )}
            </Table.Body>
        </Table>
    )
}

export default Overview
