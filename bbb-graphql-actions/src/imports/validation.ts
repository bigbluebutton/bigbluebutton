import {ValidationError} from "../types/ValidationError";

export const throwErrorIfNotModerator = (sessionVariables: Record<string, unknown>) => {
    if(sessionVariables['x-hasura-moderatorinmeeting'] == "") {
        throw new ValidationError('Permission Denied (not moderator).', 403);
    }
};

export const throwErrorIfNotPresenter = (sessionVariables: Record<string, unknown>) => {
    if(sessionVariables['x-hasura-presenterinmeeting'] == "") {
        throw new ValidationError('Permission Denied (not presenter).', 403);
    }
};

export const isModerator = (sessionVariables: Record<string, unknown>) => {
    return (sessionVariables['x-hasura-moderatorinmeeting'] !== "");
};

export const isPresenter = (sessionVariables: Record<string, unknown>) => {
    return (sessionVariables['x-hasura-presenterinmeeting'] !== "");
};

export type InputParam = {
    name: string;
    type: 'string' | 'number' | 'int' | 'boolean' | 'json' | 'jsonArray' | 'stringArray' | 'numberArray' | 'intArray' | 'objectArray';
    required: boolean;
};

export const throwErrorIfInvalidInput = (input: Record<string, unknown>, expectedParams: InputParam[]) => {
    for (const param of expectedParams) {
        if (param.required && !(param.name in input)) {
            throw new ValidationError(`Missing required parameter: '${param.name}'`, 403);
        }

        if (param.name in input) {
            const value = input[param.name];

            if (!param.required && value == null) {
                //Param is null and it is not required
                continue;
            }

            switch (param.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    break;
                case 'number':
                    if (typeof value !== 'number') {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    break;
                case 'int':
                    if (typeof value !== 'number' || !Number.isInteger(value)) {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    break;
                case 'json':
                    if (typeof value !== 'object' || value === null) {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    try {
                        const jsonString = JSON.stringify(value);
                        JSON.parse(jsonString);
                    } catch (e) {
                        throw new ValidationError(`Parameter '${param.name}' contains an invalid Json`, 400);
                    }
                    break;
                case 'jsonArray':
                    if (typeof value !== 'object' || !Array.isArray(value)) {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    break;
                case 'stringArray':
                    if (typeof value !== 'object' || !Array.isArray(value)) {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    if(value.length > 0) {
                        if (typeof value[0] !== 'string') {
                            throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                        }
                    }
                    break;
                case 'numberArray':
                    if (typeof value !== 'object' || !Array.isArray(value)) {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    if(value.length > 0) {
                        if (typeof value[0] !== 'number') {
                            throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                        }
                    }
                    break;
                case 'intArray':
                    if (typeof value !== 'object' || !Array.isArray(value)) {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    if(value.length > 0) {
                        if (typeof value[0] !== 'number' || !Number.isInteger(value[0])) {
                            throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                        }
                    }
                    break;
                case 'objectArray':
                    if (typeof value !== 'object' || !Array.isArray(value)) {
                        throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                    }
                    if(value.length > 0) {
                        if (typeof value[0] !== 'object') {
                            throw new ValidationError(`Parameter '${param.name}' should be of type ${param.type}`, 400);
                        }
                    }
                    break;
                default:
                    throw new ValidationError(`Unknown type for parameter '${param.name}'`, 400);
            }
        }
    }
    return true;
}
