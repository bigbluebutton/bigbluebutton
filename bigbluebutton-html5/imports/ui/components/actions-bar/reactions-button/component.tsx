import React, { RefObject, useState } from 'react';
import { defineMessages, IntlShape } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import BBBMenu, { BBBMenuAction } from '/imports/ui/components/common/menu/component';
import { convertRemToPixels } from '/imports/utils/dom-utils';
import { SET_REACTION_EMOJI } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';
import { listItemBgHover } from '/imports/ui/stylesheets/styled-components/palette';
import { useBarPriorityEntries } from '/imports/ui/core/hooks/useBarPriorityEntries';
import Styled from './styles';

interface ReactionsButtonProps {
  intl: IntlShape;
  actionsBarRef: RefObject<HTMLElement>;
  actionsBarWrapperRef: RefObject<HTMLElement>;
  isMobile: boolean;
  currentUserReaction: string;
  autoCloseReactionsBar: boolean;
  isOverflowed?: boolean;
}

const ReactionsButton = (props: ReactionsButtonProps) => {
  const {
    intl,
    actionsBarRef,
    actionsBarWrapperRef,
    isMobile,
    currentUserReaction,
    autoCloseReactionsBar,
    isOverflowed = false,
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
  };

  useBarPriorityEntries('actionsBar', 'reactions', [{
    key: 'reactions',
    label: intl.formatMessage(intlMessages.reactionsLabel),
    icon: 'reactions',
    onClick: () => setShowEmojiPicker(true),
    dataTest: 'reactionsOption',
    active: currentUserReaction !== 'none',
  }]);

  const handleReactionSelect = (reaction: string) => {
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

  const actions: BBBMenuAction[] = [];

  REACTIONS.forEach(({ id, native }) => {
    if (DISABLE_EMOJIS.includes(id)) return;
    actions.push({
      label: (
        // @ts-expect-error -- styles.js is untyped, so its styled components accept no custom props.
        <Styled.ButtonWrapper active={currentUserReaction === native}>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
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

  const getPickerAnchor = () => {
    if (!isMobile) return actionsBarRef.current;
    // A collapsed trigger is hidden, so the picker would open off an invisible anchor. Small screens
    // drop the menu's top offset, so it goes above the whole bar rather than over its padding.
    if (isOverflowed) return actionsBarWrapperRef.current;
    return null;
  };

  const svgIcon = currentUserReaction === 'none' ? 'reactions' : null;
  const currentUserReactionEmoji = REACTIONS.find(({ native }) => native === currentUserReaction);

  let customIcon = null;

  if (!svgIcon) {
    customIcon = (
      <em-emoji
        key={currentUserReactionEmoji?.id}
        native={currentUserReactionEmoji?.native}
        emoji={{ id: currentUserReactionEmoji?.id }}
        // eslint-disable-next-line react/jsx-props-no-spreading
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
            icon={!customIcon ? 'reactions' : null}
            customIcon={customIcon}
            label={intl.formatMessage(intlMessages.reactionsLabel)}
            description="Reactions"
            onKeyPress={() => { }}
            onClick={() => setShowEmojiPicker(true)}
            color={showEmojiPicker || customIcon ? 'primary' : 'default'}
            hideLabel
            circle
            size={deviceInfo.isMobile ? 'md' : 'lg'}
            hoverColor={listItemBgHover}
          />
        </Styled.ReactionsDropdown>
      )}
      actions={actions}
      onCloseCallback={() => handleClose()}
      customAnchorEl={getPickerAnchor()}
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

export default ReactionsButton;
