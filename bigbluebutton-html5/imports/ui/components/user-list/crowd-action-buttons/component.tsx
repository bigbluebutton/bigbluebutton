import React, { memo } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useMutation } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import { SET_MUTED } from './mutations';
import Styled from './styles';
import LockViewersContainer from '../../lock-viewers/container';
import { useModalRegistration } from '/imports/ui/core/singletons/modalController';
import { layoutSelectOutput } from '/imports/ui/components/layout/context';

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
});

const CrowdActionButtons: React.FC = () => {
  const intl = useIntl();
  const [setMuted] = useMutation(SET_MUTED);
  const lockViewersModal = useModalRegistration({ id: 'lockViewersModal', priority: 'low' });
  const sidebarContent = layoutSelectOutput((i: { sidebarContent:
    { width: number; minWidth: number; }; }) => i.sidebarContent);
  const isAtMinWidth = Boolean(
    sidebarContent?.width && sidebarContent?.minWidth
    && sidebarContent.width <= sidebarContent.minWidth + 1,
  );

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

  return (
    <>
      {lockViewersModal.isOpen && (
        <LockViewersContainer
          onRequestClose={() => lockViewersModal.close()}
          isOpen={lockViewersModal.isOpen}
          setIsOpen={lockViewersModal.close}
        />
      )}
      <Styled.ActionButtonsWrapper $isMinWidth={isAtMinWidth}>
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
      </Styled.ActionButtonsWrapper>
    </>
  );
};

export default memo(CrowdActionButtons);
