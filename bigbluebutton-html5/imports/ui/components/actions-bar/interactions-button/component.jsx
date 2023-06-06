import React, { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Button from '/imports/ui/components/common/button/component';
import ButtonEmoji from '/imports/ui/components/common/button/button-emoji/ButtonEmoji';
import ReactionsPicker from '/imports/ui/components/emoji-picker/reactions-picker/component';
import UserReactionService from '/imports/ui/components/user-reaction/service';
import UserListService from '/imports/ui/components/user-list/service';

import Styled from '../styles';

const InteractionsButton = (props) => {
  const {
    userId,
    emoji,
    intl,
    sidebarContentPanel,
    layoutContextDispatch,
    isMobile,
    isRTL,
  } = props;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dropdownList, setDropdownList] = useState([]);

  const intlMessages = defineMessages({
    raiseHandLabel: {
      id: 'app.actionsBar.interactions.raiseHand',
      description: 'raise Hand Label',
    },
    notRaiseHandLabel: {
      id: 'app.actionsBar.interactions.lowHand',
      description: 'not Raise Hand Label',
    },
    writeQuestionLabel: {
      id: 'app.actionsBar.interactions.writeQuestion',
      description: 'writeQuestion Label',
    },
    addReactionLabel: {
      id: 'app.actionsBar.interactions.addReaction',
      description: 'addReaction Label',
    },
    interactionsLabel: {
      id: 'app.actionsBar.interactions.interactions',
      description: 'interactions Label',
    },
    interactionsAdvancedButton: {
      id: 'app.actionsBar.interactions.interactionsAdvancedButton',
      description: 'interactions Label',
    },
    presentLabel: {
      id: 'app.actionsBar.interactions.present',
      description: 'present Label',
    },
    awayLabel: {
      id: 'app.actionsBar.interactions.away',
      description: 'away Label',
    },
    statusLabel: {
      id: 'app.actionsBar.interactions.status',
      description: 'status Label',
    },
    backLabel: {
      id: 'app.actionsBar.interactions.back',
      description: 'back Label',
    },
  });

  const handleSetDropdownList = () => {
    const dropdownActions = [];

    dropdownActions.push({
      key: 'interactions-label',
      dataTest: 'interactionsLabel',
      label: intl.formatMessage(intlMessages.interactionsLabel),
      disabled: true,
      onClick: () => {
      },
    });

    dropdownActions.push({
      key: 'raise-hand',
      dataTest: 'raise-hand',
      icon: 'hand',
      label: emoji === 'raiseHand'
        ? intl.formatMessage(intlMessages.notRaiseHandLabel)
        : intl.formatMessage(intlMessages.raiseHandLabel),
      onClick: () => {
        UserListService.setEmojiStatus(
          userId,
          emoji === 'raiseHand' ? 'none' : 'raiseHand',
        );
      },
    });

    if (UserReactionService.isEnabled()) {
      dropdownActions.push({
        key: 'setstatus',
        dataTest: 'setstatus',
        icon: 'happy',
        label: intl.formatMessage(intlMessages.addReactionLabel),
        onClick: () => {
          setDropdownList([{
            key: 'back',
            dataTest: 'back',
            icon: 'left_arrow',
            label: intl.formatMessage(intlMessages.backLabel),
            onClick: () => {
              setShowEmojiPicker(false);
              setDropdownList(dropdownActions);
            },
          }]);
          setShowEmojiPicker(true);
        },
      });
    }

    dropdownActions.push({
      key: 'StatusLabel',
      dataTest: 'StatusLabel',
      label: intl.formatMessage(intlMessages.statusLabel),
      disabled: true,
      dividerTop: true,
      onClick: () => {
      },
    });

    return dropdownActions;
  };

  useEffect(() => {
    setDropdownList(handleSetDropdownList);
  }, [emoji]);

  const handleClose = () => {
    setShowEmojiPicker(false);
    setDropdownList(handleSetDropdownList);
  };

  const handleReactionSelect = (emojiObject) => {
    UserReactionService.setUserReaction(emojiObject.native);
  };

  const renderEmojiPicker = () => (
    <Styled.Wrapper>
      <ReactionsPicker
        {...props}
        onEmojiSelect={handleReactionSelect}
      />
    </Styled.Wrapper>
  );

  const handlePresent = () => {
    UserListService.setEmojiStatus(
      userId,
      'none',
    );
  };

  const handleAFK = () => {
    UserListService.setEmojiStatus(
      userId,
      'away',
    );
  };

  const buttonStatus = () => (
    <Styled.ButtonContainer>
      <Button
        label={intl.formatMessage(intlMessages.presentLabel)}
        onClick={() => handlePresent()}
        id="btn"
        icon="user"
        disabled={emoji !== 'away'}
        size="md"
        color={emoji !== 'away' ? 'primary' : 'default'}
      />
      <Button
        label={intl.formatMessage(intlMessages.awayLabel)}
        onClick={() => handleAFK()}
        id="btn"
        icon="clear_status"
        disabled={emoji === 'away'}
        size="md"
        color={emoji === 'away' ? 'primary' : 'default'}
      />
    </Styled.ButtonContainer>
  );

  const handleButtonLabel = () => {
    if (isMobile) {
      return intl.formatMessage(intlMessages.interactionsAdvancedButton);
    }

    return emoji === 'raiseHand'
      ? intl.formatMessage(intlMessages.notRaiseHandLabel)
      : intl.formatMessage(intlMessages.raiseHandLabel);
  };

  const handleInteractionsButtonClick = (event) => {
    if (isMobile) {
      return;
    }

    event.stopPropagation();
    UserListService.setEmojiStatus(
      userId,
      emoji === 'raiseHand' ? 'none' : 'raiseHand',
    );
  };

  return (
    <BBBMenu
      trigger={(
        <Styled.InteractionsDropdown>
          <Styled.RaiseHandButton
            data-test="InteractionsButton"
            icon='hand'
            label={handleButtonLabel()}
            description="Interactions"
            ghost={emoji !== 'raiseHand'}
            onKeyPress={() => {}}
            onClick={handleInteractionsButtonClick}
            color={emoji === 'raiseHand' ? 'primary' : 'default'}
            hideLabel
            circle
            size="lg"
          />
          {!isMobile
          && (
          <ButtonEmoji
            data-test="interactions-advanced-button"
            emoji="device_list_selector"
            label={intl.formatMessage(intlMessages.interactionsAdvancedButton)}
            hideLabel
            tabIndex={0}
          />
          )}
        </Styled.InteractionsDropdown>
      )}
      actions={dropdownList}
      renderOtherComponents={showEmojiPicker ? renderEmojiPicker() : buttonStatus()}
      onCloseCallback={() => handleClose()}
      opts={{
        id: 'default-dropdown-menu',
        keepMounted: true,
        transitionDuration: 0,
        elevation: 3,
        getContentAnchorEl: null,
        anchorOrigin: { vertical: 'top', horizontal: isRTL ? 'left' : 'right' },
        transformOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
      }}
    />
  );
};

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  emoji: PropTypes.string.isRequired,
  sidebarContentPanel: PropTypes.string.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

InteractionsButton.propTypes = propTypes;

export default InteractionsButton;
