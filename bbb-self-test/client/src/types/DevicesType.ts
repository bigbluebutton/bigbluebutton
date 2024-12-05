export type DevicesType = {
    microphone?: {
        allowed?: boolean;
        devices?: string[];
    }
    webcams?: {
        allowed?: boolean;
        devices?: string[];
    },
    speakers?: {
        allowed?: boolean;
        devices?: string[];
    }
    screenshare?: boolean;
};