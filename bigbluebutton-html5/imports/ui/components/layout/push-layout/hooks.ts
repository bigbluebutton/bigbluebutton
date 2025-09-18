import { MutationFunction, useMutation } from '@apollo/client';
import { useCallback } from 'react';
import { SET_LAYOUT_PROPS, SET_SYNC_WITH_PRESENTER_LAYOUT } from './mutations';
import { Input, Layout, Output } from '../layoutTypes';
import { calculatePresentationVideoRate } from './service';
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
    });
  };

  return setPushLayout;
};

const useMeetingLayoutUpdater = (
  cameraDockOutput: Output['cameraDock'],
  cameraDockInput: Input['cameraDock'],
  presentationInput: Input['presentation'],
  layoutSettings: { pushLayout: boolean, selectedLayout: boolean },
) => {
  const [setMeetingLayoutProps] = useMutation(SET_LAYOUT_PROPS);

  const { focusedId, position } = cameraDockOutput;
  const { isResizing } = cameraDockInput;
  const { isOpen: presentationIsOpen } = presentationInput;
  const { pushLayout, selectedLayout } = layoutSettings;

  const setMeetingLayout = () => {
    setMeetingLayoutProps({
      variables: {
        layout: selectedLayout,
        syncWithPresenterLayout: pushLayout,
        presentationIsOpen,
        isResizing,
        cameraPosition: position || 'contentTop',
        focusedCamera: focusedId || 'none',
        presentationVideoRate: calculatePresentationVideoRate(cameraDockOutput),
      },
    });
  };

  return setMeetingLayout;
};

const useSetLayoutTypeWithFallback = () => {
  const layoutContextDispatch = layoutDispatch();
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const layoutTypeFromContext = layoutSelect((i: Layout) => i.layoutType);
  const layoutFromSettings = useSettings(SETTINGS.LAYOUT) as {
    selectedLayout: typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE],
    pushLayout: boolean,
  };
  const { selectedLayout: layoutTypeFromSettings } = layoutFromSettings;

  return useCallback((
    desiredLayout: typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE],
    settingsMutation: MutationFunction,
  ): void => {
    if (!deviceType) {
      logger.info({
        logCode: 'layout_invalid_device_type',
        extraInfo: {
          deviceType,
        },
      }, `Trying to set layout type but device type is invalid: ${deviceType}. Skipping.`);
      return;
    }

    const layoutSupported = isLayoutSupported(deviceType, desiredLayout);
    const layoutToBeApplied = layoutSupported ? desiredLayout : LAYOUT_TYPE.SMART_LAYOUT;

    if (!layoutSupported) {
      logger.info({
        logCode: 'layout_not_supported_fallback',
        extraInfo: {
          deviceType,
          desiredLayout,
          fallback: LAYOUT_TYPE.SMART_LAYOUT,
        },
      },
      `Layout type ${desiredLayout} is not supported on ${deviceType}. Falling back to ${LAYOUT_TYPE.SMART_LAYOUT}.`);
    }

    if (layoutTypeFromSettings === layoutTypeFromContext && layoutTypeFromSettings === layoutToBeApplied) {
      logger.debug({
        logCode: 'layout_no_change_needed',
        extraInfo: {
          layout: layoutToBeApplied,
        },
      }, `Selected layout ${layoutToBeApplied} is already active. No change needed.`);
      return;
    }

    logger.debug({
      logCode: 'layout_applying',
      extraInfo: {
        layout: layoutToBeApplied,
      },
    }, `Applying layout: ${layoutToBeApplied}`);

    layoutContextDispatch({
      type: ACTIONS.SET_LAYOUT_TYPE,
      value: layoutToBeApplied,
    });

    updateSettings({
      layout: {
        ...layoutFromSettings,
        selectedLayout: layoutToBeApplied,
      },
    }, null, settingsMutation);
  }, [
    layoutContextDispatch,
    deviceType,
    layoutTypeFromContext,
    layoutTypeFromSettings,
    layoutFromSettings,
  ]);
};

export {
  useMeetingLayoutUpdater,
  usePushLayoutUpdater,
  useSetLayoutTypeWithFallback,
};
