import { MutationFunction, useMutation } from '@apollo/client';
import { useCallback } from 'react';
import { SET_LAYOUT_PROPS, SET_SYNC_WITH_PRESENTER_LAYOUT } from './mutations';
import { Input, Layout, Output } from '../layoutTypes';
import { calculatePresentationVideoRate } from './service';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { layoutDispatch, layoutSelect, layoutSelectOutput } from '../context';
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
  const mediaAreaSize = layoutSelectOutput((i: Output) => i.mediaArea);

  const { focusedId, position } = cameraDockOutput;
  const { isResizing } = cameraDockInput;
  const { isOpen: presentationIsOpen } = presentationInput;
  const { selectedLayout } = layoutSettings;

  const setMeetingLayout = (pushLayout: boolean) => {
    setMeetingLayoutProps({
      variables: {
        layout: selectedLayout,
        syncWithPresenterLayout: pushLayout,
        presentationIsOpen,
        isResizing,
        cameraPosition: position || 'contentTop',
        focusedCamera: focusedId || 'none',
        presentationVideoRate: calculatePresentationVideoRate(cameraDockOutput, mediaAreaSize),
      },
    });
  };

  return setMeetingLayout;
};

const useLayoutUpdater = (fullUpdate: boolean = false) => {
  const layoutContextDispatch = layoutDispatch();
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const layoutTypeFromContext = layoutSelect((i: Layout) => i.layoutType);
  const layoutFromSettings = useSettings(SETTINGS.LAYOUT) as {
    selectedLayout: typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE],
    pushLayout: boolean,
  };
  const {
    selectedLayout: layoutTypeFromSettings,
    pushLayout: pushLayoutFromSettings,
  } = layoutFromSettings;

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

  const applyLayoutAndSetPush = useCallback((
    targetValues: {
      targetLayout: typeof LAYOUT_TYPE[keyof typeof LAYOUT_TYPE],
      targetPushLayout: boolean | null,
    } = { targetLayout: layoutTypeFromSettings, targetPushLayout: pushLayoutFromSettings },
    settingsMutation: MutationFunction,
    message: string | null = null,
  ): void => {
    const { targetLayout, targetPushLayout } = targetValues;

    const appliedLayout = applyLayoutOnly(targetLayout, settingsMutation, message);

    if (pushLayoutFromSettings === targetPushLayout) {
      logger.debug({
        logCode: 'push_layout_no_change_needed',
        extraInfo: { pushLayout: targetPushLayout },
      }, `Target value for push layout: ${targetPushLayout} is already set. No change needed.`);
      return;
    }

    if (targetPushLayout !== null && targetPushLayout !== undefined) {
      logger.debug({
        logCode: 'push_layout_applying',
        extraInfo: { pushLayout: targetPushLayout },
      }, `Applying push layout value: ${targetPushLayout}`);

      updateSettings({
        layout: {
          ...layoutFromSettings,
          selectedLayout: appliedLayout,
          pushLayout: targetPushLayout,
        },
      }, message, settingsMutation);
    }
  }, [applyLayoutOnly, layoutFromSettings, layoutTypeFromSettings, pushLayoutFromSettings]);

  return fullUpdate ? applyLayoutAndSetPush : applyLayoutOnly;
};

export {
  useMeetingLayoutUpdater,
  usePushLayoutUpdater,
  useLayoutUpdater,
};
