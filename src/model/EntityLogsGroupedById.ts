import { Document, Schema, model } from "mongoose";
import { CheckAndGenerateUniqueId } from "../common/CheckAndGenerateUniqueId.ts";
import { HTTP_STATUS_CODE_ENUM } from "../enum/Application.ts";
import { ENTITIES_ENUM, LOG_TYPE_ENUM } from "../enum/Log.ts";
import { IEntityLogGroupedByIdDTO } from "../interfaces/ILogger.ts";

export interface IEntityLogGroupedByIdMongo extends Partial<Omit<Document, "id">>, IEntityLogGroupedByIdDTO {}

const EntityLogsGroupedByIdSchema = new Schema<IEntityLogGroupedByIdMongo>(
	{
		id: { type: String, required: true, trim: true, index: true, unique: true },
		entity: { type: String, required: true, trim: true, index: true, enum: ENTITIES_ENUM },
		entity_id: { type: String, required: true, trim: true, index: true },
		logs: [
			{
				trace_id: { type: String, required: true, trim: true, index: true, unique: true },
				type: { type: String, required: true, trim: true, index: true, enum: LOG_TYPE_ENUM },
				status_code: { type: Number, required: true, index: true, enum: HTTP_STATUS_CODE_ENUM },
				title: { type: String, required: true, trim: true, index: true },
				description: { type: String, required: true, trim: true, index: true },
				datetime: { type: Date, required: true, index: true },
				objectData: { type: Schema.Types.Mixed },
			},
		],
	},
	{ timestamps: true },
);

EntityLogsGroupedByIdSchema.index({ entity: 1, entity_id: 1 }, { unique: true });

EntityLogsGroupedByIdSchema.pre("validate", async function (next) {
	this.id = await CheckAndGenerateUniqueId(EntityLogGroupedByIdModel);
	next();
});

export const EntityLogGroupedByIdModel = model<IEntityLogGroupedByIdMongo>("entity_logs_grouped_by_id", EntityLogsGroupedByIdSchema);
