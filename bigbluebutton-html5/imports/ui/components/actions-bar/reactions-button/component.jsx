import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import data from '@emoji-mart/data';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { init } from 'emoji-mart';
import { SET_RAISE_HAND, SET_REACTION_EMOJI } from '/imports/ui/core/graphql/mutations/userMutations';
import { SET_AWAY } from '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/user-actions/mutations';
import { useMutation } from '@apollo/client';
import Toggle from '/imports/ui/components/common/switch/component';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import {
  muteAway,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import Styled from './styles';

const ReactionsButton = (props) => {
  const {
    intl,
    actionsBarRef,
    userId,
    raiseHand,
    away,
    muted,
    isMobile,
    shortcuts,
    currentUserReaction,
    autoCloseReactionsBar,
  } = props;

  const REACTIONS = window.meetingClientSettings.public.userReaction.reactions;

  // initialize emoji-mart data, need for the new version
  init({ data });

  const [setRaiseHand] = useMutation(SET_RAISE_HAND);
  const [setAway] = useMutation(SET_AWAY);
  const [setReactionEmoji] = useMutation(SET_REACTION_EMOJI);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const voiceToggle = useToggleVoice();

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
    setAwayLabel: {
      id: 'app.actionsBar.reactions.setAway',
      description: 'setAway Label',
    },
    setActiveLabel: {
      id: 'app.actionsBar.reactions.setActive',
      description: 'setActive Label',
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

  const handleRaiseHandButtonClick = () => {
    setRaiseHand({
      variables: {
        userId,
        raiseHand: !raiseHand,
      },
    });
  };

  const handleToggleAFK = () => {
    muteAway(muted, away, voiceToggle);
    setAway({
      variables: {
        away: !away,
      },
    });
  };

  const ToggleAFKLabel = () => (away
    ? intl.formatMessage(intlMessages.setActiveLabel)
    : intl.formatMessage(intlMessages.setAwayLabel));

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

  const awayReaction = {
    id: 'clock7',
    native: '⏰',
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
    label: <Styled.ToggleButtonWrapper><Toggle icons={false} defaultChecked={away} onChange={() => { handleToggleAFK(); }} ariaLabel={ToggleAFKLabel()} showToggleLabel={false} />{ToggleAFKLabel()}</Styled.ToggleButtonWrapper>,
    key: 'none',
    isToggle: true,
    customStyles: {...actionCustomStyles, width: 'auto'},
  });

  actions.push({
    label: <Styled.RaiseHandButtonWrapper accessKey={shortcuts.raisehand} isMobile={isMobile} data-test={raiseHand ? 'lowerHandBtn' : 'raiseHandBtn'} active={raiseHand}><em-emoji key={handReaction.id} native={handReaction.native} emoji={{ id: handReaction.id }} {...emojiProps} />{RaiseHandButtonLabel()}</Styled.RaiseHandButtonWrapper>,
    key: 'hand',
    onClick: () => handleRaiseHandButtonClick(),
    customStyles: {...actionCustomStyles, width: 'auto'},
  });

  const svgIcon = !raiseHand && !away && currentUserReaction === 'none' ? 'reactions' : null;
  const currentUserReactionEmoji = REACTIONS.find(({ native }) => native === currentUserReaction);

  let customIcon = null;

  if (raiseHand) {
    customIcon = <em-emoji key={handReaction.id} native={handReaction.native} emoji={handReaction} {...emojiProps} />;
  } else {
    if (!svgIcon) {
      customIcon = <em-emoji key={currentUserReactionEmoji?.id} native={currentUserReactionEmoji?.native} emoji={{ id: currentUserReactionEmoji?.id }} {...emojiProps} />;
    }
  }

  if (away) {
    customIcon = <em-emoji key={awayReaction.id} native={awayReaction.native} emoji={awayReaction} {...emojiProps} />;
  }

  return (
    <BBBMenu
      trigger={(
        <Styled.ReactionsDropdown id="interactionsButton">
          <Styled.RaiseHandButton
            data-test="reactionsButton"
            svgIcon={svgIcon}
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
  sidebarContentPanel: PropTypes.string.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  muted: PropTypes.bool.isRequired,
};

ReactionsButton.propTypes = propTypes;

export default withShortcutHelper(ReactionsButton, ['raiseHand']);
