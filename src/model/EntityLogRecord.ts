import { Document, Schema, model } from "mongoose";
import { CheckAndGenerateUniqueId } from "../common/CheckAndGenerateUniqueId.ts";
import { HTTTP_STATUS_CODE_ENUM } from "../enum/Application.ts";
import { ENTITIES_ENUM, LOG_TYPE_ENUM } from "../enum/Log.ts";
import { IEntityLogRecordDTO } from "../interfaces/ILogger.ts";

export interface IEntityLogRecordMongo extends Partial<Omit<Document, "id">>, IEntityLogRecordDTO {}

const EntityLogRecordSchema = new Schema<IEntityLogRecordMongo>(
	{
		trace_id: { type: String, required: true, trim: true, index: true, unique: true },
		entity: { type: String, required: true, trim: true, index: true, enum: ENTITIES_ENUM },
		entity_id: { type: String, required: true, trim: true, index: true },
		type: { type: String, required: true, trim: true, index: true, enum: LOG_TYPE_ENUM },
		statusCode: { type: Number, required: true, index: true, enum: HTTTP_STATUS_CODE_ENUM },
		title: { type: String, required: true, trim: true, index: true },
		description: { type: String, required: true, trim: true, index: true },
		datetime: { type: Date, required: true, index: true },
		objectData: { type: Schema.Types.Mixed },
	},
	{ timestamps: true },
);

EntityLogRecordSchema.pre("validate", async function (next) {
	this.id = await CheckAndGenerateUniqueId(EntityLogRecordModel);
	next();
});

export const EntityLogRecordModel = model<IEntityLogRecordMongo>("entity_log_records", EntityLogRecordSchema);
