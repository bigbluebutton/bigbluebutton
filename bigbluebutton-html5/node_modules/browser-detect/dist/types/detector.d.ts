/// <reference types="node" />
import { BrowserDetectInfo } from './browser-detect.interface';
import Process = NodeJS.Process;
export declare class Detector {
    private navigator?;
    private process?;
    private userAgent;
    constructor(userAgent: string, navigator?: Navigator, process?: Process);
    detect(): BrowserDetectInfo;
    private checkBrowser;
    private checkMobile;
    private checkOs;
    private getOsPattern;
    private handleMissingError;
}
