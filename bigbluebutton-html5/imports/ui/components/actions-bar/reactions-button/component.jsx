import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import BBBMenu from '/imports/ui/components/common/menu/component';
import ReactionsBar from '/imports/ui/components/emoji-picker/reactions-bar/component';
import UserReactionService from '/imports/ui/components/user-reaction/service';
import UserListService from '/imports/ui/components/user-list/service';

import Styled from '../styles';

const ReactionsButton = (props) => {
  const {
    intl,
    actionsBarRef,
    userId,
    raiseHand,
    isMobile,
    currentUserReaction,
  } = props;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const intlMessages = defineMessages({
    reactionsLabel: {
      id: 'app.actionsBar.reactions.reactionsButtonLabel',
      description: 'reactions Label',
    },
  });

  const handleClose = () => {
    setShowEmojiPicker(false);
    setTimeout(() => {
      document.activeElement.blur();
    }, 0);
  };

  const handleReactionSelect = (reaction) => {
    const newReaction = currentUserReaction === reaction ? 'none' : reaction;
    UserReactionService.setUserReaction(newReaction);
  };

  const handleRaiseHandButtonClick = () => {
    UserListService.setUserRaiseHand(userId, !raiseHand);
  };

  const renderReactionsBar = () => (
    <Styled.Wrapper>
      <ReactionsBar {...props} onReactionSelect={handleReactionSelect} onRaiseHand={handleRaiseHandButtonClick} />
    </Styled.Wrapper>
  );

  const customStyles = { top: '-1rem', borderRadius: '1.7rem' };

  return (
    <BBBMenu
      trigger={(
        <Styled.ReactionsDropdown>
          <Styled.RaiseHandButton
            data-test="ReactionsButton"
            icon="hand"
            label={intl.formatMessage(intlMessages.reactionsLabel)}
            description="Reactions"
            ghost={!showEmojiPicker}
            onKeyPress={() => {}}
            onClick={() => setShowEmojiPicker(true)}
            color={showEmojiPicker ? 'primary' : 'default'}
            hideLabel
            circle
            size="lg"
          />
        </Styled.ReactionsDropdown>
      )}
      renderOtherComponents={showEmojiPicker ? renderReactionsBar() : null}
      onCloseCallback={() => handleClose()}
      customAnchorEl={!isMobile ? actionsBarRef.current : null}
      customStyles={customStyles}
      open={showEmojiPicker}
      hasRoundedCorners
      overrideMobileStyles
      opts={{
        id: 'reactions-dropdown-menu',
        keepMounted: true,
        transitionDuration: 0,
        elevation: 3,
        getcontentanchorel: null,
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

ReactionsButton.propTypes = propTypes;

export default ReactionsButton;
