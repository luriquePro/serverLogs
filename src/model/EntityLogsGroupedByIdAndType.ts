import { Document, Schema, model } from "mongoose";
import { CheckAndGenerateUniqueId } from "../common/CheckAndGenerateUniqueId.ts";
import { HTTP_STATUS_CODE_ENUM } from "../enum/Application.ts";
import { ENTITIES_ENUM, LOG_TYPE_ENUM } from "../enum/Log.ts";
import { IEntityLogsGroupedByIdAndTypeDTO } from "../interfaces/ILogger.ts";

export interface IEntityLogGroupedByIdMongo extends Partial<Omit<Document, "id">>, IEntityLogsGroupedByIdAndTypeDTO {}

const EntityLogsGroupedByIdAndTypeSchema = new Schema<IEntityLogGroupedByIdMongo>(
	{
		id: { type: String, required: true, trim: true, index: true, unique: true },
		entity: { type: String, required: true, trim: true, index: true, enum: ENTITIES_ENUM },
		entity_id: { type: String, required: true, trim: true, index: true },
		type: { type: String, required: true, trim: true, index: true, enum: LOG_TYPE_ENUM },
		logs: [
			{
				trace_id: { type: String, required: true, trim: true, index: true, unique: true },
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

EntityLogsGroupedByIdAndTypeSchema.index({ entity: 1, entity_id: 1, type: 1 }, { unique: true });

EntityLogsGroupedByIdAndTypeSchema.pre("validate", async function (next) {
	this.id = await CheckAndGenerateUniqueId(EntityLogsGroupedByIdAndTypeModel);
	next();
});

export const EntityLogsGroupedByIdAndTypeModel = model<IEntityLogGroupedByIdMongo>(
	"entity_logs_grouped_by_id_and_type",
	EntityLogsGroupedByIdAndTypeSchema,
);
