import React from 'react';

export interface WebcamDevice {
  deviceId: string;
  label: string;
}

export interface VirtualBgService {
  brightness?: number;
  wholeImageBrightness?: boolean;
}

export interface BBBVideoStream {
  mediaStream: MediaStream;
  originalStream?: MediaStream;
  virtualBgService: VirtualBgService | null;
  virtualBgType: string | null;
  virtualBgName: string | null;
  virtualBgUniqueId: string | null;
  stopVirtualBackground: () => void;
  startVirtualBackground: (type: string, name?: string, customParams?: CustomBgParams) => Promise<void>;
  changeCameraBrightness: (brightness: number) => void;
  toggleCameraBrightnessArea: (wholeImage: boolean) => void;
  once: (event: 'inactive', callback: (event: { id: string }) => void) => void;
  removeListener: (event: 'inactive', callback: (event: { id: string }) => void) => void;
  stop: () => void;
}

export interface CustomBgParams {
  uniqueId?: string;
  file?: File | Blob;
}

export const VIEW_STATES = {
  finding: 'finding',
  found: 'found',
  error: 'error',
};

export const DEFAULT_BRIGHTNESS_STATE = {
  brightness: 100,
  wholeImageBrightness: false,
};

export interface UseVideoPreviewProps {
  initialDeviceId: string | null;
  initialProfileId: string;
  isCameraAsContent?: boolean;
  isCameraShared?: boolean;
  forceOpen?: boolean;
  startSharing?: (deviceId: string) => void;
  startSharingCameraAsContent?: (deviceId: string) => void;
  onStreamChange?: (stream: BBBVideoStream | null) => void;
}

export interface UseVideoPreviewReturn {
  webcamDeviceId: string | null;
  virtualBackgroundActive: boolean;
  availableWebcams: WebcamDevice[];
  selectedProfile: string;
  viewState: string;
  deviceError: string | null;
  previewError: string | null;
  isCameraLoading: boolean;
  brightness: number;
  wholeImageBrightness: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  currentVideoStream: React.MutableRefObject<BBBVideoStream | null>;
  getInitialCameraStream: (deviceId: string | null) => Promise<string | null>;
  initializeCameras: () => void;
  displayPreview: () => void;
  handleSelectWebcam: (event: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
  handleSelectProfile: (event: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
  handleVirtualBgSelected: (
    type: string, name?: string, customParams?: CustomBgParams, deviceId?: string | null
  ) => Promise<boolean>;
  setCameraBrightness: (newBrightness: number, deviceId?: string | null) => Promise<void>;
  handleBrightnessAreaChange: () => Promise<void>;
  stopVirtualBackground: (bbbVideoStream: BBBVideoStream | null) => void;
  updateVirtualBackgroundInfo: (deviceId: string | undefined) => void;
  updateCameraBrightnessInfo: () => void;
  terminateCameraStream: (stream: BBBVideoStream | null, deviceId: string | null) => void;
  cleanupStreamAndVideo: () => void;
  setCurrentVideoStream: (stream: BBBVideoStream | null) => void;
  handleStartSharing: (deviceId: string) => void;
  shouldSkipVideoPreview: () => boolean;
  VIEW_STATES: typeof VIEW_STATES;
}

export interface CameraProfileProps {
  id: string;
  name: string;
  default?: boolean;
  bitrate: number;
  hidden?: boolean;
  constraints?: {
    width: number;
    height: number;
    frameRate?: number;
  };
}
export interface CustomBackground {
  uniqueId: string;
  name: string;
  type: string;
  data?: File | Blob;
}
