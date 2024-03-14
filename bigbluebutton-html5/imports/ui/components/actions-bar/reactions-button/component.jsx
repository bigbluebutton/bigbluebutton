import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import data from '@emoji-mart/data';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { init } from 'emoji-mart';
import { SET_RAISE_HAND, SET_REACTION_EMOJI } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';

import Styled from './styles';

const REACTIONS = window.meetingClientSettings.public.userReaction.reactions;

const ReactionsButton = (props) => {
  const {
    intl,
    actionsBarRef,
    userId,
    raiseHand,
    isMobile,
    shortcuts,
    currentUserReaction,
    autoCloseReactionsBar,
  } = props;

  // initialize emoji-mart data, need for the new version
  init({ data });

  const [setRaiseHand] = useMutation(SET_RAISE_HAND);
  const [setReactionEmoji] = useMutation(SET_REACTION_EMOJI);

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
    setReactionEmoji({ variables: { reactionEmoji: newReaction } });
  };

  const handleRaiseHandButtonClick = () => {
    setRaiseHand({
      variables: {
        userId,
        raiseHand: !raiseHand,
      },
    });
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
    size: convertRemToPixels(1.5),
    padding: '4px',
  };

  const handReaction = {
    id: 'hand',
    native: '✋',
  };

  let actions = [];

  REACTIONS.forEach(({ id, native }) => {
    actions.push({
      label: <Styled.ButtonWrapper active={currentUserReaction === native}><em-emoji key={native} native={native} {...emojiProps} /></Styled.ButtonWrapper>,
      key: id,
      onClick: () => handleReactionSelect(native),
      customStyles: actionCustomStyles,
    });
  });

  actions.push({
    label: <Styled.RaiseHandButtonWrapper accessKey={shortcuts.raisehand} isMobile={isMobile} data-test={raiseHand ? 'lowerHandBtn' : 'raiseHandBtn'} active={raiseHand}><em-emoji key={handReaction.id} native={handReaction.native} emoji={{ id: handReaction.id }} {...emojiProps} />{RaiseHandButtonLabel()}</Styled.RaiseHandButtonWrapper>,
    key: 'hand',
    onClick: () => handleRaiseHandButtonClick(),
    customStyles: {...actionCustomStyles, width: 'auto'},
  });

  const icon = !raiseHand && currentUserReaction === 'none' ? 'hand' : null;
  const currentUserReactionEmoji = REACTIONS.find(({ native }) => native === currentUserReaction);

  let customIcon = null;

  if (raiseHand) {
    customIcon = <em-emoji key={handReaction.id} native={handReaction.native} emoji={handReaction} {...emojiProps} />;
  } else {
    if (!icon) {
      customIcon = <em-emoji key={currentUserReactionEmoji?.id} native={currentUserReactionEmoji?.native} emoji={{ id: currentUserReactionEmoji?.id }} {...emojiProps} />;
    }
  }

  return (
    <BBBMenu
      trigger={(
        <Styled.ReactionsDropdown id="interactionsButton">
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
  emoji: PropTypes.string,
  sidebarContentPanel: PropTypes.string.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
};

const defaultProps = {
  emoji: '',
};

ReactionsButton.propTypes = propTypes;
ReactionsButton.defaultProps = defaultProps;

export default withShortcutHelper(ReactionsButton, ['raiseHand']);
