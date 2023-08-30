import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import BBBMenu from '/imports/ui/components/common/menu/component';
import UserReactionService from '/imports/ui/components/user-reaction/service';
import UserListService from '/imports/ui/components/user-list/service';
import { Emoji } from 'emoji-mart';
import { convertRemToPixels } from '/imports/utils/dom-utils';

import Styled from './styles';

const ReactionsButton = (props) => {
  const {
    intl,
    actionsBarRef,
    userId,
    raiseHand,
    isMobile,
    currentUserReaction,
    autoCloseReactionsBar,
  } = props;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const intlMessages = defineMessages({
    reactionsLabel: {
      id: 'app.actionsBar.reactions.reactionsButtonLabel',
      description: 'reactions Label',
    },
    raiseHandLabel: {
      id: 'app.actionsBar.reactions.raiseHand',
      description: 'raise Hand Label',
    },
    notRaiseHandLabel: {
      id: 'app.actionsBar.reactions.lowHand',
      description: 'not Raise Hand Label',
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

  const RaiseHandButtonLabel = () => {
    if (isMobile) return null;

    return raiseHand
      ? intl.formatMessage(intlMessages.notRaiseHandLabel)
      : intl.formatMessage(intlMessages.raiseHandLabel);
  };

  const customStyles = {
    top: '-1rem',
    borderRadius: '1.7rem',
  };

  const actionCustomStyles = {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: isMobile ? '0' : '0.5rem',
    paddingBottom: isMobile ? '0' : '0.5rem',
  };

  const emojiProps = {
    native: true,
    size: convertRemToPixels(1.5),
    padding: '4px',
  };

  const reactions = [
    {
      id: 'smiley',
      native: '😃',
    },
    {
      id: 'neutral_face',
      native: '😐',
    },
    {
      id: 'slightly_frowning_face',
      native: '🙁',
    },
    {
      id: '+1',
      native: '👍',
    },
    {
      id: '-1',
      native: '👎',
    },
    {
      id: 'clap',
      native: '👏',
    },
  ];

  let actions = [];

  reactions.forEach(({ id, native }) => {
    actions.push({
      label: <Styled.ButtonWrapper active={currentUserReaction === native}><Emoji key={id} emoji={{ id }} {...emojiProps} /></Styled.ButtonWrapper>,
      key: id,
      onClick: () => handleReactionSelect(native),
      customStyles: actionCustomStyles,
    });
  });

  actions.push({
    label: <Styled.RaiseHandButtonWrapper isMobile={isMobile} data-test={raiseHand ? 'lowerHandBtn' : 'raiseHandBtn'} active={raiseHand}><Emoji key="hand" emoji={{ id: 'hand' }} {...emojiProps} />{RaiseHandButtonLabel()}</Styled.RaiseHandButtonWrapper>,
    key: 'hand',
    onClick: () => handleRaiseHandButtonClick(),
    customStyles: {...actionCustomStyles, width: 'auto'},
  });

  const icon = !raiseHand && currentUserReaction === 'none' ? 'hand' : null;
  const currentUserReactionEmoji = reactions.find(({ native }) => native === currentUserReaction);

  let customIcon = null;

  if (raiseHand) {
    customIcon = <Emoji key="hand" emoji={{ id: 'hand' }} {...emojiProps} />;
  } else {
    if (!icon) {
      customIcon = <Emoji key={currentUserReactionEmoji?.id} emoji={{ id: currentUserReactionEmoji?.id }} {...emojiProps} />;
    }
  }

  return (
    <BBBMenu
      trigger={(
        <Styled.ReactionsDropdown>
          <Styled.RaiseHandButton
            data-test="reactionsButton"
            icon={icon}
            customIcon={customIcon}
            label={intl.formatMessage(intlMessages.reactionsLabel)}
            description="Reactions"
            ghost={!showEmojiPicker && !customIcon}
            onKeyPress={() => {}}
            onClick={() => setShowEmojiPicker(true)}
            color={showEmojiPicker || customIcon ? 'primary' : 'default'}
            hideLabel
            circle
            size="lg"
          />
        </Styled.ReactionsDropdown>
      )}
      actions={actions}
      onCloseCallback={() => handleClose()}
      customAnchorEl={!isMobile ? actionsBarRef.current : null}
      customStyles={customStyles}
      open={showEmojiPicker}
      hasRoundedCorners
      overrideMobileStyles
      isHorizontal={!isMobile}
      isMobile={isMobile}
      roundButtons={true}
      keepOpen={!autoCloseReactionsBar}
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
