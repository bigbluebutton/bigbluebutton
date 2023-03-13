export type DevicesType = {
    microphone?: {
        allowed?: boolean;
        devices?: string[];
    }
    webcams?: {
        allowed?: boolean;
        devices?: string[];
    },
    speakers?: string[];
    screenshare?: boolean;
};