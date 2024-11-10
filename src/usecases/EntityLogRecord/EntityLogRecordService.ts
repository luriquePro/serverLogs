import { IEntityLogRecordEntryDTO, IEntityLogRecordMappedDTO } from "../../interfaces/ILogger.ts";
import { EntityLogRecordModel } from "../../model/EntityLogRecord.ts";
import { EntityLogRecordValidate } from "./EntityLogRecordValidate.ts";

class EntityLogRecordService {
	public static async saveEntityLog(logData: IEntityLogRecordEntryDTO) {
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

		await EntityLogRecordModel.create(entityLogMapped);
	}
}

export { EntityLogRecordService };
