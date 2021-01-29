export declare type BrowserDefinition = (string | RegExp)[];
export interface OsDefinitionInterface {
    name: string;
    pattern: string;
    value?: RegExpExecArray | null;
}
export declare type OsDefinition = OsDefinitionInterface | string;
export declare type OsVersion = {
    [key: string]: string;
};
export interface BrowserDetectInfo {
    name?: string;
    version?: string;
    versionNumber?: number;
    mobile?: boolean;
    os?: string;
}
