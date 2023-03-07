export type DevicesType = {
    microphone?: {
        allowed: boolean;
        exists: boolean;
        nb: number;
    }
    webcams?: {
        allowed: boolean;
        exists: boolean;
        nb: number;
    },
    speakers?: {
        exists: boolean;
        nb: number;
    }
    screenshare?: boolean;
};