export interface GeneratedParameter {
    name: string;
    type: string | GeneratedParameter[];
    optional: boolean;
}
export declare class CreationType {
    static readonly FactoryMethod: string;
    static readonly Constructor: string;
}
export interface CreateInfo {
    libraryLocation: string;
    /**
     * so far only '@babylonjs/core', '@babylonjs/gui', or 'BABYLONEXT' (for Terrain)
     */
    namespace: string;
    factoryMethod?: string;
    creationType: string;
    parameters: GeneratedParameter[];
}
