import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

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
  // People & Body
  '1F971', '1F90F', '1F9BE', '1F9BF', '1F9BB', '1F9D1-200D-1F9B0', '1F9D1-200D-1F9B1',
  '1F9D1-200D-1F9B3', '1F9D1-200D-1F9B2', '1F9CF', '1F9CF-200D-2642-FE0F',
  '1F9CF-200D-2640-FE0F', '1F9D1-200D-2695-FE0F', '1F9D1-200D-1F393', '1F9D1-200D-1F3EB',
  '1F9D1-200D-2696-FE0F', '1F9D1-200D-1F33E', '1F9D1-200D-1F373', '1F9D1-200D-1F527',
  '1F9D1-200D-1F3ED', '1F9D1-200D-1F4BC', '1F9D1-200D-1F52C', '1F9D1-200D-1F4BB',
  '1F9D1-200D-1F3A4', '1F9D1-200D-1F3A8', '1F9D1-200D-2708-FE0F', '1F9D1-200D-1F680',
  '1F9D1-200D-1F692', '1F9CD', '1F9CD-200D-2642-FE0F', '1F9CD-200D-2640-FE0F',
  '1F9CE', '1F9CE-200D-2642-FE0F', '1F9CE-200D-2640-FE0F', '1F9D1-200D-1F91D-200D-1F9D1',
  '1F90E', '1F90D', '1F469-200D-1F9B0', '1F468-200D-1F9B2', '1F469-200D-1F9B1',
  '1F469-200D-1F9B2', '1F970', '263A-FE0F', '1F975', '1F976', '1F973', '1F97A', '1F9B5',
  '1F9B6', '1F9B7', '1F9B4', '1F974', '1F468-200D-1F9B1', '1F468-200D-1F9B3',
  '1F469-200D-1F9B0', '1F469-200D-1F9B3', '1F9B8', '1F9B8-200D-2642-FE0F',
  '1F9B8-200D-2640-FE0F', '1F9B9', '1F9B9-200D-2642-FE0F', '1F9B9-200D-2640-FE0F',
  '1F9D1-200D-1F9AF', '1F468-200D-1F9AF', '1F469-200D-1F9AF', '1F9D1-200D-1F9BC',
  '1F468-200D-1F9BC', '1F469-200D-1F9BC', '1F9D1-200D-1F9BD', '1F468-200D-1F9BD',
  '1F469-200D-1F9BD', '1F468-200D-1F9B0', '1F595',
  // Animals & Nature
  '1F9A7', '1F9AE', '1F9A5', '1F9A6', '1F9A8', '1F9A9', '1F415-200D-1F9BA', '1F99D',
  '1F999', '1F99B', '1F998', '1F9A1', '1F9A2', '1F99A', '1F99C', '1F99F', '1F9A0',
  // Food & Drink
  '1F9C4', '1F9C5', '1F9C7', '1F9C6', '1F9C8', '1F9AA', '1F9C3', '1F9C9', '1F9CA', '1F96D',
  '1F96C', '1F96F', '1F9C2', '1F96E', '1F99E', '1F9C1',
  // Activity
  '1F93F', '1FA80', '1FA81', '1F9E8', '1F9E7', '1F94E', '1F94F', '1F94D', '1F9FF', '1F9E9',
  '1F9F8', '1F9F5', '1F9F6',
  // Travel & Places
  '1F6D5', '1F9BD', '1F9BC', '1F6FA', '1FA82', '1FA90', '1F9ED', '1F9F1', '1F6F9', '1F9F3',
  // Objects
  '1F9BA', '1F97B', '1FA71', '1FA72', '1FA73', '1FA70', '1FA95', '1FA94', '1FA93', '1F9AF',
  '1FA78', '1FA79', '1FA7A', '1FA91', '1FA92', '1F97D', '1F97C', '1F97E', '1F97F', '1F9EE',
  '1F9FE', '1F9F0', '1F9F2', '1F9EA', '1F9EB', '1F9EC', '1F9F4', '1F9F7', '1F9F9',
  '1F9FA', '1F9FB', '1F9FC', '1F9FD', '1F9EF',
  // Symbols
  '1F7E0', '1F7E1', '1F7E2', '1F7E3', '1F7E4', '1F7E5', '1F7E7', '1F7E8', '1F7E9',
  '1F7E6', '1F7EA', '1F7EB',
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
      enableFrequentEmojiSort
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
