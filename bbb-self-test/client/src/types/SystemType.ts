export type SystemType = {
    os: {
        name: string,
        version: string,
    },
    browser: {
        name: string,
        version: string,
        isPrivate: boolean | undefined,
        capabilities: {
            WebRTC: boolean;
            ORTC: boolean;
            WebSockets: boolean;

            AudioContext: boolean; //WebAudio API

            SCTPDataChannels: boolean;
            RTPDataChannels: boolean;

            Promises: boolean;

            isMultiMonitorScreenCapturing: boolean;
            VideoStreamCapturing: boolean;
            CanvasStreamCapturing: boolean;
        },
    },
    isMobileDevice: boolean;
};