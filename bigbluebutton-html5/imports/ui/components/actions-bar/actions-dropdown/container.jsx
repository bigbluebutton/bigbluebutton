import React, { useContext } from 'react';
import ActionsDropdown from './component';
import { layoutSelectInput, layoutDispatch, layoutSelect } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT, ACTIONS, PANELS } from '../../layout/enums';
import { isCameraAsContentEnabled, isTimerFeatureEnabled } from '/imports/ui/services/features';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { useSubscription, useMutation } from '@apollo/client';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import {
  PROCESSED_PRESENTATIONS_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import { SET_PRESENTER } from '/imports/ui/core/graphql/mutations/userMutations';
import { TIMER_ACTIVATE, TIMER_DEACTIVATE } from '../../timer/mutations';
import Auth from '/imports/ui/services/auth';
import { PRESENTATION_SET_CURRENT } from '../../presentation/mutations';

const TIMER_CONFIG = window.meetingClientSettings.public.timer;
const MILLI_IN_MINUTE = 60000;

const ActionsDropdownContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i) => i.isRTL);
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let actionButtonDropdownItems = [];
  if (pluginsExtensibleAreasAggregatedState.actionButtonDropdownItems) {
    actionButtonDropdownItems = [...pluginsExtensibleAreasAggregatedState.actionButtonDropdownItems];
  }

  const openActions = useShortcut('openActions');

  const { data: presentationData } = useSubscription(PROCESSED_PRESENTATIONS_SUBSCRIPTION);
  const presentations = presentationData?.pres_presentation || [];

  const [setPresenter] = useMutation(SET_PRESENTER);
  const [timerActivate] = useMutation(TIMER_ACTIVATE);
  const [timerDeactivate] = useMutation(TIMER_DEACTIVATE);
  const [presentationSetCurrent] = useMutation(PRESENTATION_SET_CURRENT);

  const handleTakePresenter = () => {
    setPresenter({ variables: { userId: Auth.userID } });
  };

  const setPresentation = (presentationId) => {
    presentationSetCurrent({ variables: { presentationId } });
  };

  const activateTimer = () => {
    const stopwatch = true;
    const running = false;
    const time = TIMER_CONFIG.time * MILLI_IN_MINUTE;

    timerActivate({ variables: { stopwatch, running, time } });

    setTimeout(() => {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: PANELS.TIMER,
      });
    }, 500);
  };

  return (
    <ActionsDropdown
      {...{
        layoutContextDispatch,
        sidebarContent,
        sidebarNavigation,
        isMobile,
        isRTL,
        actionButtonDropdownItems,
        presentations,
        isTimerFeatureEnabled: isTimerFeatureEnabled(),
        isDropdownOpen: Session.get('dropdownOpen'),
        setPresentation,
        isCameraAsContentEnabled: isCameraAsContentEnabled(),
        handleTakePresenter,
        activateTimer,
        deactivateTimer: timerDeactivate,
        shortcuts: openActions,
        ...props,
      }}
    />
  );
};

export default ActionsDropdownContainer;
