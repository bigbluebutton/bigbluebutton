import React, { memo } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useMutation } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import { SET_MUTED } from './mutations';
import { CLEAR_ALL_REACTION } from '/imports/ui/core/graphql/mutations/userMutations';
import Styled from './styles';
import LockViewersContainer from '../../lock-viewers/container';
import { useModalRegistration } from '/imports/ui/core/singletons/modalController';
import { layoutSelectOutput } from '/imports/ui/components/layout/context';
import deviceInfo from '/imports/utils/deviceInfo';
import { useIsReactionsEnabled } from '/imports/ui/services/features';
import { notify } from '/imports/ui/services/notification';

const intlMessages = defineMessages({
  muteAllExceptPresenterLabel: {
    id: 'app.userList.userOptions.muteAllExceptPresenterLabel',
    description: 'Mute all label except presenter label',
  },
  muteAllExceptPresenterDesc: {
    id: 'app.userList.userOptions.muteAllExceptPresenterDesc',
    description: 'Mute all except presenter description',
  },
  lockSettingsButtonLabel: {
    id: 'app.lock-viewers.title',
    description: 'Lock settings button label',
  },
  lockSettingsButtonDescription: {
    id: 'app.lock-viewers.description',
    description: 'Description for the lock settings button',
  },
  clearAllReactionsLabel: {
    id: 'app.userList.userOptions.clearAllReactionsLabel',
    description: 'Clear all reactions label',
  },
  clearAllReactionsDescription: {
    id: 'app.userList.userOptions.clearAllReactionsDesc',
    description: 'Description for the clear all reactions button',
  },
  clearedReactions: {
    id: 'app.userList.userOptions.clearedReactions',
    description: 'Toast notification shown after reactions have been cleared',
  },
  failedToClearReactions: {
    id: 'app.userList.userOptions.clearReactionsFailed',
    description: 'Toast notification shown when clearing reactions fails',
  },
});

const CrowdActionButtons: React.FC = () => {
  const intl = useIntl();
  const [setMuted] = useMutation(SET_MUTED);
  const [clearAllReaction, { loading: isClearingReactions }] = useMutation(CLEAR_ALL_REACTION);
  const isReactionsEnabled = useIsReactionsEnabled();
  const lockViewersModal = useModalRegistration({ id: 'lockViewersModal', priority: 'low' });
  const sidebarContent = layoutSelectOutput((i: { sidebarContent:
    { width: number; minWidth: number; }; }) => i.sidebarContent);
  const isAtMinWidth = Boolean(
    sidebarContent?.width && sidebarContent?.minWidth
    && sidebarContent.width <= sidebarContent.minWidth + 1,
  );
  const { isMobile } = deviceInfo;
  // On mobile, keep the footer buttons side by side instead of stacked.
  const isMinWidthLayout = isAtMinWidth && !isMobile;

  const muteAll = () => {
    setMuted({
      variables: {
        muted: true,
        exceptPresenter: true,
      },
    });

    return logger.info(
      {
        logCode: 'crowd_actions_mute_all_except_presenter',
        extraInfo: { logType: 'moderator_action' },
      },
      'moderator muted all users except presenter',
    );
  };

  const openLockSettingsModal = () => {
    lockViewersModal.open();
  };

  const clearReactions = async () => {
    try {
      await clearAllReaction();
      notify(intl.formatMessage(intlMessages.clearedReactions), 'info', 'clear_status');
    } catch (error) {
      logger.error({
        logCode: 'crowd_actions_clear_all_reactions_error',
        extraInfo: { error },
      }, 'moderator failed to clear all user reactions');
      notify(intl.formatMessage(intlMessages.failedToClearReactions), 'error', 'clear_status');
    }
  };

  return (
    <>
      {lockViewersModal.isOpen && (
        <LockViewersContainer
          onRequestClose={() => lockViewersModal.close()}
          isOpen={lockViewersModal.isOpen}
          setIsOpen={lockViewersModal.close}
        />
      )}
      <Styled.ActionButtonsWrapper $isMinWidth={isMinWidthLayout}>
        <Styled.ActionButtonWrapper>
          <Styled.ActionButtonLabel>
            {intl.formatMessage(intlMessages.muteAllExceptPresenterLabel)}
          </Styled.ActionButtonLabel>
          {/* @ts-ignore - button is js component */}
          <Styled.ActionButton
            hideLabel
            label={intl.formatMessage(intlMessages.muteAllExceptPresenterDesc)}
            tooltipLabel={intl.formatMessage(intlMessages.muteAllExceptPresenterDesc)}
            icon="mute"
            size="lg"
            data-test="muteAllUsers"
            onClick={muteAll}
          />
        </Styled.ActionButtonWrapper>
        <Styled.ActionButtonWrapper>
          <Styled.ActionButtonLabel>
            {intl.formatMessage(intlMessages.lockSettingsButtonLabel)}
          </Styled.ActionButtonLabel>
          {/* @ts-ignore - button is js component */}
          <Styled.ActionButton
            hideLabel
            label={intl.formatMessage(intlMessages.lockSettingsButtonDescription)}
            tooltipLabel={intl.formatMessage(intlMessages.lockSettingsButtonDescription)}
            icon="lock"
            size="lg"
            data-test="lockViewersButton"
            onClick={openLockSettingsModal}
          />
        </Styled.ActionButtonWrapper>
        {isReactionsEnabled && (
          <Styled.ActionButtonWrapper>
            <Styled.ActionButtonLabel>
              {intl.formatMessage(intlMessages.clearAllReactionsLabel)}
            </Styled.ActionButtonLabel>
            {/* @ts-ignore - button is js component */}
            <Styled.ActionButton
              hideLabel
              label={intl.formatMessage(intlMessages.clearAllReactionsDescription)}
              tooltipLabel={intl.formatMessage(intlMessages.clearAllReactionsDescription)}
              icon="clear_status"
              size="lg"
              data-test="clearAllReactions"
              onClick={clearReactions}
              disabled={isClearingReactions}
            />
          </Styled.ActionButtonWrapper>
        )}
      </Styled.ActionButtonsWrapper>
    </>
  );
};

export default memo(CrowdActionButtons);
