import * as yup from "yup";

const YupValidator = async (dataShape: yup.AnyObject, dataValidation: object) => {
	try {
		const schema = yup.object().shape(dataShape);
		await schema.validate(dataValidation);

		return { isValid: true, error: undefined };
	} catch (error: any) {
		return { isValid: false, error: error.message };
	}
};

export { YupValidator };
