import { MutationFunction, useMutation } from '@apollo/client';
import { useCallback } from 'react';
import { SET_LAYOUT_PROPS, SET_SYNC_WITH_PRESENTER_LAYOUT } from './mutations';
import {
  Input, Layout, MeetingCameraDock, Output,
} from '../layoutTypes';
import { getPropagatedCameraDock } from './service';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { layoutDispatch, layoutSelect } from '../context';
import logger from '/imports/startup/client/logger';
import { isLayoutSupported } from '../utils';
import { LAYOUT_TYPE } from '../defaultValues';
import { ACTIONS } from '../enums';
import { updateSettings } from '../../settings/service';

const usePushLayoutUpdater = (pushLayout: boolean) => {
  const [setSyncWithPresenterLayout] = useMutation(SET_SYNC_WITH_PRESENTER_LAYOUT);

  const setPushLayout = () => {
    setSyncWithPresenterLayout({
      variables: {
        syncWithPresenterLayout: pushLayout,
      },
    }).catch((error) => {
      logger.error({
        logCode: 'set_sync_with_presenter_layout_failed',
        extraInfo: { error: error?.message },
      }, 'Failed to set sync with presenter layout.');
    });
  };

  return setPushLayout;
};

const useMeetingLayoutUpdater = ({
  cameraDockOutput,
  cameraDockInput,
  presentationInput,
  layoutSettings,
  isCameraDockPropagationSuppressed,
  meetingCameraDock,
}: {
  cameraDockOutput: Output['cameraDock'];
  cameraDockInput: Input['cameraDock'];
  presentationInput: Input['presentation'];
  layoutSettings: { selectedLayout: string };
  isCameraDockPropagationSuppressed: boolean;
  meetingCameraDock: MeetingCameraDock;
}) => {
  const [setMeetingLayoutProps] = useMutation(SET_LAYOUT_PROPS);

  const { focusedId } = cameraDockOutput;
  const { isOpen: presentationIsOpen } = presentationInput;
  const { selectedLayout } = layoutSettings;

  const setMeetingLayout = (pushLayout: boolean) => {
    const cameraDock = getPropagatedCameraDock({
      isSuppressed: isCameraDockPropagationSuppressed,
      cameraDockOutput,
      cameraDockInput,
      meetingCameraDock,
    });

    setMeetingLayoutProps({
      variables: {
        layout: selectedLayout,
        syncWithPresenterLayout: pushLayout,
        presentationIsOpen,
        focusedCamera: focusedId || 'none',
        ...cameraDock,
      },
    }).catch((error) => {
      logger.error({
        logCode: 'set_meeting_layout_props_failed',
        extraInfo: { error: error?.message },
      }, 'Failed to set meeting layout properties.');
    });
  };

  return setMeetingLayout;
};

const useLayoutUpdater = () => {
  const layoutContextDispatch = layoutDispatch();
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const layoutTypeFromContext = layoutSelect((i: Layout) => i.layoutType);
  const layoutFromSettings = useSettings(SETTINGS.LAYOUT) as {
    selectedLayout: typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE],
  };
  const { selectedLayout: layoutTypeFromSettings } = layoutFromSettings;

  const applyLayoutOnly = useCallback((
    targetLayout: typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE],
    settingsMutation: MutationFunction,
    message: string | null = null,
  ): typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE] => {
    if (!deviceType) {
      logger.info({
        logCode: 'layout_invalid_device_type',
        extraInfo: { deviceType },
      }, `Trying to set layout type but device type is invalid: ${deviceType}. Skipping.`);
      return layoutTypeFromSettings;
    }

    const layoutSupported = isLayoutSupported(deviceType, targetLayout);
    const layoutToBeApplied = layoutSupported ? targetLayout : LAYOUT_TYPE.UNIFIED_LAYOUT;

    if (!layoutSupported) {
      logger.info({
        logCode: 'layout_type_not_supported_fallback',
        extraInfo: { deviceType, targetLayout, fallback: LAYOUT_TYPE.UNIFIED_LAYOUT },
      }, `Layout type ${targetLayout} is not supported on ${deviceType}.`
      + `Falling back to ${LAYOUT_TYPE.UNIFIED_LAYOUT}.`);
    }

    if (layoutTypeFromSettings === layoutTypeFromContext && layoutTypeFromSettings === layoutToBeApplied) {
      logger.debug({
        logCode: 'layout_type_no_change_needed',
        extraInfo: { layout: layoutToBeApplied },
      }, `Target layout ${layoutToBeApplied} is already active. No change needed.`);
      return layoutTypeFromSettings;
    }

    logger.debug({
      logCode: 'layout_type_applying',
      extraInfo: { layout: layoutToBeApplied },
    }, `Applying layout: ${layoutToBeApplied}`);

    layoutContextDispatch({ type: ACTIONS.SET_LAYOUT_TYPE, value: layoutToBeApplied });

    updateSettings({
      layout: {
        ...layoutFromSettings,
        selectedLayout: layoutToBeApplied,
      },
    }, message, settingsMutation);

    return layoutToBeApplied;
  }, [
    layoutContextDispatch,
    deviceType,
    layoutTypeFromContext,
    layoutTypeFromSettings,
    layoutFromSettings,
  ]);

  return applyLayoutOnly;
};

export {
  useMeetingLayoutUpdater,
  usePushLayoutUpdater,
  useLayoutUpdater,
};
