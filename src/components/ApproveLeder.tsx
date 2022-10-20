import { Button, Table, Loader, UNSAFE_MonthPicker, UNSAFE_useMonthpicker } from "@navikt/ds-react";
import { useEffect, useState, Dispatch } from "react";
import { Schedules } from "../types/types";

//let today = Date.now() / 1000
let today = 1668470400  // 15. November 2022 00:00:00

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

const AdminLeder = () => {
	const [itemData, setItemData] = useState<Schedules[]>([]);
	const [response, setResponse] = useState();
	const [loading, setLoading] = useState(false);
	const { monthpickerProps, inputProps, selectedMonth, setSelected } = UNSAFE_useMonthpicker(
		{
			fromDate: new Date("Oct 01 2022"),
			toDate: new Date("Aug 23 2025"),
			defaultSelected: new Date(),
		}
	);

	useEffect(() => {
		setLoading(true);
		Promise.all([fetch("/vaktor/api/leader_schedules")])
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

	if (itemData === undefined) return <></>;
	if (selectedMonth === undefined) setSelected(new Date())
	return (
		<>
			<div className="min-h-96">
				<UNSAFE_MonthPicker {...monthpickerProps}>
					<div className="grid gap-4">
						<UNSAFE_MonthPicker.Input {...inputProps} label="Velg måned" />
					</div>
				</UNSAFE_MonthPicker>
			</div>
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
					{itemData
						.filter(
							(value: Schedules) =>
								new Date(value.start_timestamp * 1000).getMonth() ===
								selectedMonth.getMonth()
						)
						.map(
							(
								{ id, user, group, start_timestamp, end_timestamp, approve_level },
								i
							) => {
								//approve_level = 0;
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
												{(approve_level === 3 || end_timestamp > today) && (
													< Button disabled
														style={{
															height: "35px",
															'margin-bottom': "5px",
															'min-width': "210px",
														}}
													>
														{" "}
														Godkjenn{" "}
													</Button>
												)}

												{approve_level < 3 && end_timestamp < today && (
													<Button
														style={{
															height: "35px",
															'margin-bottom': "5px",
															'min-width': "210px",
														}}
														onClick={() => {
															console.log(id, approve_level);
															confirm_schedule(id, setResponse, setLoading);
														}}
													>
														{" "}
														Godkjenn{" "}
													</Button>
												)}

												{(approve_level === 1 || approve_level === 2) && (
													<Button
														style={{
															backgroundColor: "#f96c6c",
															height: "35px",
															'min-width': "210px",
														}}
														onClick={() =>
															disprove_schedule(id, setResponse, setLoading)
														}
													>
														{" "}
														Avgodkjenn{" "}
													</Button>
												)}

												{(approve_level === 0 || approve_level === 3) && (
													<Button disabled
														style={{
															backgroundColor: "#f96c6c",
															height: "35px",
															'min-width': "210px",
														}}
													>
														{" "}
														Avgodkjenn{" "}
													</Button>
												)}
											</div>
										</Table.DataCell>
										{mapApproveStatus(approve_level)}
									</Table.Row>
								);
							}
						)}
				</Table.Body>
			</Table>
		</>
	);
};

export default AdminLeder;
