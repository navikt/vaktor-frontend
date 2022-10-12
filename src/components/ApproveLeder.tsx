import {
	Button,
	Table,
	UNSAFE_MonthPicker,
	UNSAFE_useMonthpicker,
} from "@navikt/ds-react";
import { useEffect, useState } from "react";

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
	const [itemData, setItemData] = useState();
	const { monthpickerProps, inputProps, selectedMonth } = UNSAFE_useMonthpicker(
		{
			fromDate: new Date("Oct 01 2022"),
			toDate: new Date("Aug 23 2025"),
			defaultSelected: new Date(),
		}
	);

	useEffect(() => {
		Promise.all([fetch("/vaktor/api/schedules")])
			.then(async ([scheduleRes]) => {
				const schedulejson = await scheduleRes.json();
				return [schedulejson];
			})
			.then(([itemData]) => {
				setItemData(itemData);
			});
	}, []);

	if (itemData === undefined) return <></>;
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
						.filter((value: any) => value.group.name == "Mellomvare/ATOM")
						.filter(
							(value: any) =>
								new Date(value.start_timestamp * 1000).getMonth() ===
								selectedMonth.getMonth()
						)
						.map(
							(
								{ user, group, start_timestamp, end_timestamp, approve_level },
								i
							) => {
								approve_level = 1;
								return (
									<Table.Row key={i}>
										<Table.HeaderCell scope="row">{user.name}</Table.HeaderCell>
										<Table.DataCell>
											{new Date(start_timestamp * 1000).toLocaleDateString(
												"en-NO"
											)}
										</Table.DataCell>
										<Table.DataCell>
											{new Date(end_timestamp * 1000).toLocaleDateString(
												"en-NO"
											)}
										</Table.DataCell>
										<Table.DataCell>{group.name}</Table.DataCell>
										<Table.DataCell style={{ maxWidth: "150px" }}>
											<div>
												<Button
													style={{ height: "35px" }}
													onClick={() => console.log(user)}
												>
													{" "}
													Godkjenn{" "}
												</Button>
												{(approve_level === 1 || approve_level === 2) && (
													<Button
														style={{
															backgroundColor: "#f96c6c",
															marginLeft: "5px",
															height: "35px",
														}}
														onClick={() => console.log(user)}
													>
														{" "}
														Avvis{" "}
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
