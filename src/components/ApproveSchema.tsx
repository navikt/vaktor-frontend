import { Button, Table, Loader } from "@navikt/ds-react";
import { useEffect, useState, Dispatch } from "react";
import { Schedules } from "../types/types";

//let today = Date.now() / 1000
let today = 1668470400

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

const mapApproveStatus = (status: number) => {
	let statusText = "";
	let statusColor = "";
	switch (status) {
		case 1:
			statusText = "Godkjent av ansatt";
			statusColor = "#66CBEC";
			break;
		case 2:
			statusText = "Godkjent av vaktsjef";
			statusColor = "#99DEAD";
			break;
		case 3:
			statusText = "Overført til lønn";
			statusColor = "#E18071";
			break;
		default:
			statusText = "Trenger godkjenning";
			statusColor = "#FFFFFF";
			break;
	}

	return (
		<Table.DataCell style={{ backgroundColor: statusColor, maxWidth: "90px" }}>
			{statusText}
		</Table.DataCell>
	);
};

const Admin = () => {
	const [itemData, setItemData] = useState<Schedules[]>([]);
	const [response, setResponse] = useState();
	const [buttonLoading, setButtonLoading] = useState(false);
	const [loading, setLoading] = useState(false);

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
		<Table>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell scope="col">Navn</Table.HeaderCell>
					<Table.HeaderCell scope="col">start</Table.HeaderCell>
					<Table.HeaderCell scope="col">slutt</Table.HeaderCell>
					<Table.HeaderCell scope="col">gruppe</Table.HeaderCell>
					<Table.HeaderCell scope="col">actions</Table.HeaderCell>
					<Table.HeaderCell scope="col">status</Table.HeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{itemData.map(
					(
						{ id, user, group, start_timestamp, end_timestamp, approve_level },
						i
					) => {
						//approve_level = 2;
						return (
							<Table.Row key={i}>
								<Table.HeaderCell scope="row">{user.name}</Table.HeaderCell>
								<Table.DataCell>
									{new Date(start_timestamp * 1000).toLocaleDateString()}
								</Table.DataCell>
								<Table.DataCell>
									{new Date(end_timestamp * 1000).toLocaleDateString()}
								</Table.DataCell>
								<Table.DataCell>{group.name}</Table.DataCell>
								<Table.DataCell style={{ maxWidth: "150px" }}>
									<div>
										{(approve_level != 0 || end_timestamp > today) && !buttonLoading && (
											< Button disabled
												style={{
													height: "35px"
												}}
											>
												{" "}
												Godkjenn{" "}
											</Button>
										)}

										{approve_level === 0 && end_timestamp < today && !buttonLoading && (
											<Button
												style={{
													height: "35px"
												}}
												onClick={() => {
													console.log(id, approve_level);
													confirm_schedule(id, setResponse, setButtonLoading);
												}}
											>
												{" "}
												Godkjenn{" "}
											</Button>
										)}

										{approve_level === 1 && !buttonLoading && (
											<Button
												style={{
													backgroundColor: "#f96c6c",
													marginLeft: "5px",
													height: "35px",
												}}
												onClick={() =>
													disprove_schedule(id, setResponse, setButtonLoading)
												}
											>
												{" "}
												Avgodkjenn{" "}
											</Button>
										)}

										{approve_level != 1 && !buttonLoading && (
											<Button disabled
												style={{
													backgroundColor: "#f96c6c",
													marginLeft: "5px",
													height: "35px",
												}}
											>
												{" "}
												Avgodkjenn{" "}
											</Button>
										)}

										{/*buttonLoading && <Button loading>Loading</Button>*/}
									</div>
								</Table.DataCell>
								{mapApproveStatus(approve_level)}
							</Table.Row>
						);
					}
				)}
			</Table.Body>
		</Table >
	);
};

export default Admin;