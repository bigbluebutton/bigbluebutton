import { IntlShape } from 'react-intl';
import { MediaAreaItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/media-area-item/enums';
import { MediaAreaIconType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/media-area-item/types';

export interface MediaButtonPluginItem {
  type: MediaAreaItemType;
  id: string;
  icon?: MediaAreaIconType;
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
  isMeteorConnected: boolean;
  hasPresentation: boolean;
}

export interface MediaAreaProps {
  amIPresenter?: boolean;
  intl: IntlShape;
  amIModerator?: boolean;
  handleTakePresenter: () => void;
  allowExternalVideo: boolean;
  stopExternalVideoShare: () => void;
  isCameraAsContentEnabled: boolean;
  hasCameraAsContent: boolean;
  isMeteorConnected: boolean;
  hasPresentation: boolean;
  isPresentationEnabled: boolean;
  isSharingVideo: boolean;
  mediaAreaItems: MediaButtonPluginItem[];
  isPresentationManagementDisabled?: boolean;
  isMobile: boolean;
  isRTL: boolean;
}
