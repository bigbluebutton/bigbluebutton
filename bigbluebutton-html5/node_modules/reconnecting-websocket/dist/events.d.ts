export declare class Event {
    target: any;
    type: string;
    constructor(type: string, target: any);
}
export declare class ErrorEvent extends Event {
    message: string;
    error: Error;
    constructor(error: Error, target: any);
}
export declare class CloseEvent extends Event {
    code: number;
    reason: string;
    wasClean: boolean;
    constructor(code: number | undefined, reason: string | undefined, target: any);
}
export interface WebSocketEventMap {
    close: CloseEvent;
    error: ErrorEvent;
    message: MessageEvent;
    open: Event;
}
export interface WebSocketEventListenerMap {
    close: (event: CloseEvent) => void | {
        handleEvent: (event: CloseEvent) => void;
    };
    error: (event: ErrorEvent) => void | {
        handleEvent: (event: ErrorEvent) => void;
    };
    message: (event: MessageEvent) => void | {
        handleEvent: (event: MessageEvent) => void;
    };
    open: (event: Event) => void | {
        handleEvent: (event: Event) => void;
    };
}
