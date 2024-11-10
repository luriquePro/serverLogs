import * as yup from "yup";
import { YupValidator } from "../../common/YupValidator.ts";

import { ENTITIES_ENUM, LOG_TYPE_ENUM } from "../../enum/Log.ts";
import { IEntityLogRecordEntryDTO } from "../../interfaces/ILogger.ts";

class EntityLogRecordValidate {
	public static async saveEntityLog(dataValidation: IEntityLogRecordEntryDTO) {
		const shapeValidation = {
			entity: yup.string().required("Entity is a required field").oneOf(Object.values(ENTITIES_ENUM), "Invalid entity"),
			entityId: yup.string().required("Entity id is a required field"),
			type: yup.string().required("Type is a required field").oneOf(Object.values(LOG_TYPE_ENUM), "Invalid type"),
			statusCode: yup.number().required("Status code is a required field"),
			title: yup.string().required("Title is a required field"),
			description: yup.string().required("Description is a required field"),
			datetime: yup.date().required("Datetime is a required field"),
			objectData: yup.mixed(),
		};

		const validateData = await YupValidator(shapeValidation, dataValidation);
		return validateData;
	}
}

export { EntityLogRecordValidate };
