import { Button, Table, Loader, ReadMore } from "@navikt/ds-react";
import { useEffect, useState, Dispatch } from "react";
import { Audit, Schedules } from "../types/types";

let today = Date.now() / 1000
//let today = 1668470400  // 15. November 2022 00:00:00

const confirm_schedule = async (
	schedule_id: string,
	setResponse: Dispatch<any>,
	setLoading: Dispatch<any>
) => {
	setLoading(true);

	await fetch(`/vaktor/api/confirm_schedule?schedule_id=${schedule_id}`)
		.then((r) => r.json())
		.then((data) => {
			setLoading(false);
			setResponse(data);
		});
};

const disprove_schedule = async (
	schedule_id: string,
	setResponse: Dispatch<any>,
	setLoading: Dispatch<any>
) => {
	setLoading(true);
	await fetch(`/vaktor/api/disprove_schedule?schedule_id=${schedule_id}`)
		.then((r) => r.json())
		.then((data) => {
			setLoading(false);
			setResponse(data);
		});
};

const mapAudit = (audit: Audit[]) => {
	return audit.map((audit: Audit, index) => (
		<div key={audit.id}>
			<ReadMore header={audit.timestamp.slice(0, -10).replace("T", " ")} size="small" style={audit.action.includes("Avgodkjent") ? { color: "red" } : { color: "green" }} >
				{audit.action} - {audit.user.name}

			</ReadMore>
		</div >
	));
};


const mapApproveStatus = (status: number) => {
	let statusText = "";
	let statusColor = "";
	switch (status) {
		case 1:
			statusText = "Godkjent av ansatt";
			statusColor = "#66CBEC";
			break;
		case 2:
			statusText = "Venter på utregning";
			statusColor = "#99DEAD";
			break;
		case 3:
			statusText = "Godkjent av vaktsjef";
			statusColor = "#99DEAD";
			break;
		case 4:
			statusText = "Overført til lønn";
			statusColor = "#E18071";
			break;
		default:
			statusText = "Trenger godkjenning";
			statusColor = "#FFFFFF";
			break;
	}

	return (
		<Table.DataCell style={{ backgroundColor: statusColor, maxWidth: "110px", minWidth: "100px" }}>
			{statusText}
		</Table.DataCell>
	);
};

const Admin = () => {
	const [itemData, setItemData] = useState();
	const [response, setResponse] = useState();
	const [loading, setLoading] = useState(false);



	const mapVakter = (vaktliste: Schedules[]) => vaktliste.map((vakter, index) => (
		//approve_level = 2;
		< Table.Row key={vakter.id} >
			<Table.HeaderCell scope="row">{vakter.group.name}</Table.HeaderCell>
			<Table.DataCell>{vakter.type}</Table.DataCell>

			<Table.DataCell>
				{new Date(vakter.start_timestamp * 1000).toLocaleString().slice(0, -3)}
			</Table.DataCell>
			<Table.DataCell>
				{new Date(vakter.end_timestamp * 1000).toLocaleString().slice(0, -3)}
			</Table.DataCell>
			<Table.DataCell style={{ maxWidth: "230px" }}>
				<div>
					< Button disabled={(vakter.approve_level != 0 || vakter.end_timestamp > today)}
						style={{
							height: "30px",
							marginBottom: "5px",
							minWidth: "210px",
						}}
						onClick={() =>
							confirm_schedule(vakter.id, setResponse, setLoading)
						}
					>
						{" "}
						Godkjenn{" "}
					</Button>

					<Button disabled={(vakter.approve_level != 1)}
						style={{
							backgroundColor: "#f96c6c",
							height: "30px",
							minWidth: "210px",
						}}
						onClick={() =>
							disprove_schedule(vakter.id, setResponse, setLoading)
						}
					>
						{" "}
						Avgodkjenn{" "}
					</Button>

				</div>
			</Table.DataCell>
			{mapApproveStatus(vakter.approve_level)}
			<Table.DataCell>
				{vakter.cost.length !== 0 ? vakter.cost[0].total_cost : "ingen beregning foreligger"}
			</Table.DataCell>
			<Table.DataCell>
				{vakter.audits.length !== 0 ? mapAudit(vakter.audits) : "Ingen hendelser"}
			</Table.DataCell>
		</Table.Row >
	));

	useEffect(() => {
		setLoading(true);
		Promise.all([fetch("/vaktor/api/get_current_user_schedules")])
			.then(async ([scheduleRes]) => {
				const schedulejson = await scheduleRes.json();
				return [schedulejson];
			})
			.then(([itemData]) => {
				itemData.sort(
					(a: Schedules, b: Schedules) => a.start_timestamp - b.start_timestamp
				);

				setItemData(itemData);
				setLoading(false);
			});
	}, [response]);

	if (loading === true) return <Loader></Loader>;

	return (
		<Table
			style={{
				minWidth: "900px",
				backgroundColor: "white",
				marginBottom: "3vh",
			}}>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell scope="col">Gruppe</Table.HeaderCell>
					<Table.HeaderCell scope="col">Type vakt</Table.HeaderCell>
					<Table.HeaderCell scope="col">Start</Table.HeaderCell>
					<Table.HeaderCell scope="col">Slutt</Table.HeaderCell>
					<Table.HeaderCell scope="col">Actions</Table.HeaderCell>
					<Table.HeaderCell scope="col">Status</Table.HeaderCell>
					<Table.HeaderCell scope="col">Godtgjørelse</Table.HeaderCell>
					<Table.HeaderCell scope="col">Audit</Table.HeaderCell>

				</Table.Row>
			</Table.Header>
			<Table.Body>

				{itemData ? mapVakter(itemData) : <Table.Row></Table.Row>}

			</Table.Body>
		</Table >
	);
};

export default Admin;