import {
	IEntityLogGroupedByIdEntryDTO,
	IEntityLogRecordDTO,
	IEntityLogRecordEntryDTO,
	IEntityLogRecordMappedDTO,
	IEntityLogsGroupedByIdAndTypeEntryDTO,
} from "../../interfaces/ILogger.ts";
import { EntityLogRecordModel } from "../../model/EntityLogRecord.ts";
import { EntityLogGroupedByIdModel } from "../../model/EntityLogsGroupedById.ts";
import { EntityLogsGroupedByIdAndTypeModel } from "../../model/EntityLogsGroupedByIdAndType.ts";
import { EntityLogRecordValidate } from "./EntityLogRecordValidate.ts";

class EntityLogRecordService {
	public static async saveEntityLog(logData: IEntityLogRecordEntryDTO): Promise<IEntityLogRecordDTO | void> {
		// Validar dados com o yup
		const { isValid, error } = await EntityLogRecordValidate.saveEntityLog(logData);
		if (!isValid) {
			console.error(error);
			return;
		}

		const entityLogMapped: IEntityLogRecordMappedDTO = {
			entity: logData.entity,
			entity_id: logData.entityId,
			type: logData.type,
			status_code: logData.statusCode,
			title: logData.title,
			description: logData.description,
			datetime: logData.datetime,
			objectData: logData.objectData,
		};

		// Finalizando Fluxo de Logs Individuais
		const entityLog = await EntityLogRecordModel.create(entityLogMapped);

		// Logs agrupados por ID
		const entityLogsGroupedById = await EntityLogGroupedByIdModel.findOne({ entity: logData.entity, entity_id: logData.entityId }).lean();
		if (entityLogsGroupedById) {
			const entityLogs = entityLogsGroupedById.logs;
			entityLogs.push(entityLog);

			await EntityLogGroupedByIdModel.updateOne({ entity: logData.entity, entity_id: logData.entityId }, { $set: { logs: entityLogs } });
		} else {
			const entityLogsGroupedById: IEntityLogGroupedByIdEntryDTO = {
				entity: logData.entity,
				entity_id: logData.entityId,
				logs: [entityLog],
			};

			await EntityLogGroupedByIdModel.create(entityLogsGroupedById);
		}

		// Logs agrupados por ID e Tipo
		const entityLogsGroupedByIdAndType = await EntityLogsGroupedByIdAndTypeModel.findOne({
			entity: logData.entity,
			entity_id: logData.entityId,
			type: logData.type,
		}).lean();

		if (entityLogsGroupedByIdAndType) {
			const entityLogs = entityLogsGroupedByIdAndType.logs;
			entityLogs.push(entityLog);

			await EntityLogsGroupedByIdAndTypeModel.updateOne(
				{ entity: logData.entity, entity_id: logData.entityId, type: logData.type },
				{ $set: { logs: entityLogs } },
			);
		} else {
			const entityLogsGroupedByIdAndType: IEntityLogsGroupedByIdAndTypeEntryDTO = {
				entity: logData.entity,
				entity_id: logData.entityId,
				type: logData.type,
				logs: [entityLog],
			};

			await EntityLogsGroupedByIdAndTypeModel.create(entityLogsGroupedByIdAndType);
		}

		return entityLog;
	}
}

export { EntityLogRecordService };
