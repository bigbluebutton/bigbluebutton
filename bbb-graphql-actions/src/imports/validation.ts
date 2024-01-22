import {ValidationError} from "../types/ValidationError";

export const throwErrorIfNotModerator = (sessionVariables: Record<string, unknown>) => {
    if(sessionVariables['x-hasura-moderatorinmeeting'] == "") {
        throw new ValidationError('Permission Denied.', 403);
    }
};

export const throwErrorIfNotPresenter = (sessionVariables: Record<string, unknown>) => {
    if(sessionVariables['x-hasura-presenterinmeeting'] == "") {
        throw new ValidationError('Permission Denied.', 403);
    }
};

export const isModerator = (sessionVariables: Record<string, unknown>) => {
    return (sessionVariables['x-hasura-moderatorinmeeting'] !== "");
};