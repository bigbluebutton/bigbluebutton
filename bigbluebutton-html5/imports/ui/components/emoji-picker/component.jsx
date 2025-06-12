import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import Picker from '@emoji-mart/react';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  onEmojiSelect: PropTypes.func.isRequired,
};

const EmojiPicker = (props) => {
  const {
    intl,
    onEmojiSelect,
  } = props;

  const i18n = {
    search: intl.formatMessage({ id: 'app.emojiPicker.search' }),
    notfound: intl.formatMessage({ id: 'app.emojiPicker.notFound' }),
    clear: intl.formatMessage({ id: 'app.emojiPicker.clear' }),
    skintext: intl.formatMessage({ id: 'app.emojiPicker.skintext' }),
    categories: {
      people: intl.formatMessage({ id: 'app.emojiPicker.categories.people' }),
      nature: intl.formatMessage({ id: 'app.emojiPicker.categories.nature' }),
      foods: intl.formatMessage({ id: 'app.emojiPicker.categories.foods' }),
      places: intl.formatMessage({ id: 'app.emojiPicker.categories.places' }),
      activity: intl.formatMessage({ id: 'app.emojiPicker.categories.activity' }),
      objects: intl.formatMessage({ id: 'app.emojiPicker.categories.objects' }),
      symbols: intl.formatMessage({ id: 'app.emojiPicker.categories.symbols' }),
      flags: intl.formatMessage({ id: 'app.emojiPicker.categories.flags' }),
      recent: intl.formatMessage({ id: 'app.emojiPicker.categories.recent' }),
      search: intl.formatMessage({ id: 'app.emojiPicker.categories.search' }),
    },
    categorieslabel: intl.formatMessage({ id: 'app.emojiPicker.categories.label' }),
    skintones: {
      1: intl.formatMessage({ id: 'app.emojiPicker.skintones.1' }),
      2: intl.formatMessage({ id: 'app.emojiPicker.skintones.2' }),
      3: intl.formatMessage({ id: 'app.emojiPicker.skintones.3' }),
      4: intl.formatMessage({ id: 'app.emojiPicker.skintones.4' }),
      5: intl.formatMessage({ id: 'app.emojiPicker.skintones.5' }),
      6: intl.formatMessage({ id: 'app.emojiPicker.skintones.6' }),
    },
  };

  const DISABLE_EMOJIS = window.meetingClientSettings.public.chat.disableEmojis;

  const emojisToExclude = [
    ...DISABLE_EMOJIS,
  ];

  // HACK: the library sets the width after it renders
  //       this code fixes that, but is kinda ugly and only works if
  //       we never render more than one emoji-picker at the same time
  useEffect(() => {
    document.getElementsByTagName('em-emoji-picker')[0].style.width = 'auto';
  });

  return (
    <Picker
      onEmojiSelect={(emojiObject, event) => onEmojiSelect(emojiObject, event)}
      emojiSize={24}
      i18n={i18n}
      previewPosition="none"
      skinTonePosition="none"
      theme="light"
      dynamicWidth
      exceptEmojis={emojisToExclude}
      autoFocus
    />
  );
};

EmojiPicker.propTypes = propTypes;

export default injectIntl(EmojiPicker);
