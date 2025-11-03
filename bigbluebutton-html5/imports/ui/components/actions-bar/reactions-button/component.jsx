import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import { SET_REACTION_EMOJI } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';
import Styled from './styles';

const ReactionsButton = (props) => {
  const {
    intl,
    actionsBarRef,
    isMobile,
    currentUserReaction,
    autoCloseReactionsBar,
  } = props;

  const REACTIONS = window.meetingClientSettings.public.userReaction.reactions;
  const DISABLE_EMOJIS = window.meetingClientSettings.public.chat.disableEmojis;

  const [setReactionEmoji] = useMutation(SET_REACTION_EMOJI);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const intlMessages = defineMessages({
    reactionsLabel: {
      id: 'app.actionsBar.reactions.reactionsButtonLabel',
      description: 'reactions Label',
      defaultMessage: 'Share a reaction',
    },
    removeReactionsLabel: {
      id: 'app.actionsBar.reactions.removeReactionLabel',
      description: 'remove reaction Label',
    },
  });

  const handleClose = () => {
    setShowEmojiPicker(false);
    setTimeout(() => {
      document.activeElement.blur();
    }, 0);
  };

  const handleReactionSelect = (reaction) => {
    setReactionEmoji({ variables: { reactionEmoji: reaction } });
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

  const actions = [];

  REACTIONS.forEach(({ id, native }) => {
    if (DISABLE_EMOJIS.includes(id)) return;
    actions.push({
      label: (
        <Styled.ButtonWrapper active={currentUserReaction === native}>
          <em-emoji key={native} native={native} {...emojiProps} />
        </Styled.ButtonWrapper>
      ),
      key: id,
      onClick: () => handleReactionSelect(native),
      customStyles: actionCustomStyles,
      dataTest: 'reaction',
    });
  });

  actions.push({
    label: (
      <Styled.ButtonWrapper>
        <Styled.ReactionsButton
          data-test="removeReactionButton"
          icon="close"
          label={intl.formatMessage(intlMessages.removeReactionsLabel)}
          description={intl.formatMessage(intlMessages.removeReactionsLabel)}
          onKeyPress={() => { }}
          onClick={() => { }}
          hideLabel
          circle
          disabled={currentUserReaction === 'none'}
          color="primary"
          ghost
        />
      </Styled.ButtonWrapper>
    ),
    key: 'none',
    onClick: () => (currentUserReaction !== 'none' ? handleReactionSelect('none') : null),
    customStyles: actionCustomStyles,
    dataTest: 'remove-reaction',
  });

  const svgIcon = currentUserReaction === 'none' ? 'reactions' : null;
  const currentUserReactionEmoji = REACTIONS.find(({ native }) => native === currentUserReaction);

  let customIcon = null;

  if (!svgIcon) {
    customIcon = (
      <em-emoji
        key={currentUserReactionEmoji?.id}
        native={currentUserReactionEmoji?.native}
        emoji={{ id: currentUserReactionEmoji?.id }}
        {...emojiProps}
      />
    );
  }

  return (
    <BBBMenu
      trigger={(
        <Styled.ReactionsDropdown id="interactionsButton">
          <Styled.ReactionsButton
            data-test="reactionsButton"
            svgIcon={svgIcon}
            customIcon={customIcon}
            label={intl.formatMessage(intlMessages.reactionsLabel)}
            description="Reactions"
            onKeyPress={() => { }}
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
      isEmoji
      roundButtons
      minContent={isMobile}
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
  sidebarContentPanel: PropTypes.string.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
};

ReactionsButton.propTypes = propTypes;

export default ReactionsButton;
