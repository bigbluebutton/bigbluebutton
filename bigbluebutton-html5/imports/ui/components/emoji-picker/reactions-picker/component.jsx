import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Picker } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';
import { styles } from './styles.scss';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  onEmojiSelect: PropTypes.func.isRequired,
};

const defaultProps = {
};

const emojisToExclude = [
  // reactions
  '1F605', '1F61C', '1F604', '1F609', '1F602', '1F92A',
  '1F634', '1F62C', '1F633', '1F60D', '02665', '1F499',
  '1F615', '1F61F', '1F928', '1F644', '1F612', '1F621',
  '1F614', '1F625', '1F62D', '1F62F', '1F631', '1F630',
  '1F44F', '1F44C', '1F44D', '1F44E', '1F4AA', '1F44A',
  '1F64C', '1F64F', '1F440', '1F4A9', '1F921', '1F480',
];

const inlineStyle = {
  margin: '.5rem 0',

};

const ReactionsPicker = (props) => {
  const {
    intl,
    onEmojiSelect,
    style,
    showPreview,
    showSkinTones,
  } = props;

  const i18n = {
    search: intl.formatMessage({ id: 'app.emojiPicker.search' }),
    notfound: intl.formatMessage({ id: 'app.emojiPicker.notFound' }),
    clear: intl.formatMessage({ id: 'app.emojiPicker.clear' }),
    skintext: intl.formatMessage({ id: 'app.emojiPicker.skintext' }),
    categories: {
      reactions: intl.formatMessage({ id: 'app.emojiPicker.categories.reactions' }),
    },
    categorieslabel: intl.formatMessage({ id: 'app.emojiPicker.categories.label' }),
  };

  return (
    <div className={styles.dropdownContent}>
      <Picker
        onSelect={(emojiObject, event) => onEmojiSelect(emojiObject, event)}
        native
        emoji=""
        title=""
        emojiSize={30}
        emojiTooltip
        style={Object.assign(inlineStyle, style)}
        i18n={i18n}
        showPreview={showPreview}
        showSkinTones={showSkinTones}
        emojisToShowFilter={(emoji) => emojisToExclude.includes(emoji.unified)}
      />
    </div>

  );
};

ReactionsPicker.propTypes = propTypes;
ReactionsPicker.defaultProps = defaultProps;

export default injectIntl(ReactionsPicker);
