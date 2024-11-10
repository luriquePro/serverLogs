export type ENTITIES = "users";
export type LOG_TYPE = "fatal" | "error" | "warning" | "info" | "debug";

export interface IEntityLogRecordDTO {
	trace_id: string;
	entity: ENTITIES;
	entity_id: string;
	type: LOG_TYPE;
	status_code: number;
	title: string;
	description: string;
	datetime: Date;
	objectData?: object;
}

export interface IEntityLogRecordMappedDTO {
	entity: ENTITIES;
	entity_id: string;
	type: LOG_TYPE;
	status_code: number;
	title: string;
	description: string;
	datetime: Date;
	objectData?: object;
}

export interface IEntityLogRecordEntryDTO {
	entity: ENTITIES;
	entityId: string;
	type: LOG_TYPE;
	statusCode: number;
	title: string;
	description: string;
	datetime: Date;
	objectData?: object;
}

export interface IEntityLogGroupedByIdDTO {
	id: string;
	entity: ENTITIES;
	entity_id: string;
	logs: IEntityLogRecordDTO[];
}

export interface IEntityLogGroupedByIdEntryDTO {
	entity: ENTITIES;
	entity_id: string;
	logs: IEntityLogRecordDTO[];
}

export interface IEntityLogsGroupedByIdAndTypeDTO {
	id: string;
	entity: ENTITIES;
	entity_id: string;
	type: LOG_TYPE;
	logs: IEntityLogRecordDTO[];
}

export interface IEntityLogsGroupedByIdAndTypeEntryDTO {
	entity: ENTITIES;
	entity_id: string;
	type: LOG_TYPE;
	logs: IEntityLogRecordDTO[];
}
