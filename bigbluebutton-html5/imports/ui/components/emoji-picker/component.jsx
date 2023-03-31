import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

const DISABLE_EMOJIS = Meteor.settings.public.chat.disableEmojis;
const FREQUENT_SORT_ON_CLICK = Meteor.settings.public.chat.emojiPicker.frequentEmojiSortOnClick;

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  onEmojiSelect: PropTypes.func.isRequired,
  style: PropTypes.shape({}),
  showPreview: PropTypes.bool,
  showSkinTones: PropTypes.bool,
};

const defaultProps = {
  style: null,
  showPreview: true,
  showSkinTones: true,
};

const emojisToExclude = [
  ...DISABLE_EMOJIS,
];

const EmojiPicker = (props) => {
  const {
    intl,
    onEmojiSelect,
    showPreview,
    showSkinTones,
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

  return (
    <Picker
      emoji=""
      onSelect={(emojiObject, event) => onEmojiSelect(emojiObject, event)}
      enableFrequentEmojiSort={FREQUENT_SORT_ON_CLICK}
      native
      title=""
      emojiSize={24}
      emojiTooltip
      i18n={i18n}
      showPreview={showPreview}
      showSkinTones={showSkinTones}
      useButton
      emojisToShowFilter={(emoji) => !emojisToExclude.includes(emoji.unified)}
    />
  );
};

EmojiPicker.propTypes = propTypes;
EmojiPicker.defaultProps = defaultProps;

export default injectIntl(EmojiPicker);
