import { Dispatch, useState } from "react";
import { User } from "../types/types";
import { Switch, Table, TextField } from "@navikt/ds-react";


const PerioderOptions = (props: { member: User, activeMembers: User[], setActiveMembers: Dispatch<User[]> }) => {
    const handleChange = (isActive: boolean) => {
        if (isActive == true) {
            props.setActiveMembers([...props.activeMembers, props.member])
        } else {
            var tmpArray = [...props.activeMembers]
            tmpArray.forEach((user, idx) => {
                if (user.ressursnummer === props.member.ressursnummer) {
                    tmpArray.splice(idx, 1)
                    props.setActiveMembers(tmpArray)
                }
            });
        }
    }
    return (

        < Table.Row key={props.member.name} >
            <Table.DataCell>
                <TextField
                    label="ID"
                    hideLabel
                    defaultValue=""
                    size="small"
                    htmlSize={14}
                    type="number"
                />
            </Table.DataCell>
            <Table.HeaderCell scope="row">{props.member.id}</Table.HeaderCell>
            <Table.DataCell>{props.member.name}</Table.DataCell>
            <Table.DataCell>{props.member.role}</Table.DataCell>
            <Table.DataCell>
                <Switch defaultChecked onChange={(e) => handleChange(e.target.checked)}>Aktiv</Switch>

            </Table.DataCell>


        </Table.Row >
    );
}

export default PerioderOptions;



