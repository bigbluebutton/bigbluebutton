import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Button from '/imports/ui/components/common/button/component';
import ReactionsBar from '/imports/ui/components/emoji-picker/reactions-bar/component';
import UserReactionService from '/imports/ui/components/user-reaction/service';
import UserListService from '/imports/ui/components/user-list/service';

import Styled from '../styles';

const InteractionsButton = (props) => {
  const {
    userId, emoji, intl, actionsBarRef,
  } = props;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const intlMessages = defineMessages({
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

  const handleClose = () => {
    setShowEmojiPicker(false);
  };

  const handleReactionSelect = (reaction) => {
    UserReactionService.setUserReaction(reaction);
  };

  const renderReactionsBar = () => (
    <Styled.Wrapper>
      <ReactionsBar {...props} onReactionSelect={handleReactionSelect} />
    </Styled.Wrapper>
  );

  const handlePresent = () => {
    UserListService.setEmojiStatus(userId, 'none');
  };

  const handleAFK = () => {
    UserListService.setEmojiStatus(userId, 'away');
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
  
  const customStyles = { top: '-1rem', borderRadius: '1.7rem' };

  return (
    <BBBMenu
      trigger={(
        <Styled.InteractionsDropdown>
          <Styled.RaiseHandButton
            data-test="InteractionsButton"
            icon="hand"
            label={intl.formatMessage(intlMessages.interactionsLabel)}
            description="Interactions"
            ghost={!showEmojiPicker}
            onKeyPress={() => {}}
            onClick={() => setShowEmojiPicker(true)}
            color={showEmojiPicker ? 'primary' : 'default'}
            hideLabel
            circle
            size="lg"
          />
        </Styled.InteractionsDropdown>
      )}
      renderOtherComponents={showEmojiPicker ? renderReactionsBar() : buttonStatus()}
      onCloseCallback={() => handleClose()}
      customAnchorEl={actionsBarRef.current}
      customStyles={customStyles}
      hasRoundedCorners={true}
      opts={{
        id: 'reactions-dropdown-menu',
        keepMounted: true,
        transitionDuration: 0,
        elevation: 3,
        getContentAnchorEl: null,
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        transformOrigin: { vertical: 'bottom', horizontal: 'center' },
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
};

InteractionsButton.propTypes = propTypes;

export default InteractionsButton;
