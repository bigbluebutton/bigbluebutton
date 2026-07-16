import { IntlShape } from 'react-intl';
import { MediaAreaItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/media-area-item/enums';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';

export interface MediaButtonPluginItem {
  type: MediaAreaItemType;
  id: string;
  icon?: PluginIconType;
  tooltip?: string;
  label?: string;
  onClick?: () => void;
  allowed: boolean;
  dataTest: string;
}

export interface MediaAreaContainerProps {
  amIPresenter?: boolean;
  amIModerator?: boolean;
  allowExternalVideo: boolean;
  intl: IntlShape;
  isSharingVideo: boolean;
  stopExternalVideoShare: () => void;
  isConnected: boolean;
  hasPresentation: boolean;
}

export interface MediaAreaProps {
  amIPresenter?: boolean;
  intl: IntlShape;
  amIModerator?: boolean;
  handleTakePresenter: () => void;
  handleRequestPresenter: () => void;
  allowExternalVideo: boolean;
  stopExternalVideoShare: () => void;
  isCameraAsContentEnabled: boolean;
  hasCameraAsContent: boolean;
  isConnected: boolean;
  hasPresentation: boolean;
  isPresentationEnabled: boolean;
  isSharingVideo: boolean;
  mediaAreaItems: MediaButtonPluginItem[];
  isPresentationManagementDisabled?: boolean;
  isMobile: boolean;
  isRTL: boolean;
  isRequestingPresenter: boolean;
  presenterPolicy: string;
  isLockedUser: boolean;
}
