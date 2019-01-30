import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles.scss';

const intlMessages = defineMessages({
  noLocaleSelected: {
    id: 'app.submenu.closedCaptions.noLocaleSelected',
    description: 'label for selected language for closed captions',
  },
});

class ClosedCaptions extends React.PureComponent {
  constructor(props) {
    super(props);

    this.shouldScrollBottom = false;
  }

  componentWillUpdate() {
    const node = this.refCCScrollArea;

    // number 4 is for the border
    // offset height includes the border, but scrollheight doesn't
    this.shouldScrollBottom = (node.scrollTop + node.offsetHeight) - 4 === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      this.refCCScrollArea.scrollTop = this.refCCScrollArea.scrollHeight;
    }
  }

  renderCaptions(caption) {
    const { fontFamily, fontSize, fontColor } = this.props;
    const text = caption.captions;
    const captionStyles = {
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      fontFamily,
      fontSize,
      color: fontColor,
    };

    return (
      <span
        style={captionStyles}
        dangerouslySetInnerHTML={{ __html: text }}
        key={caption.index}
      />
    );
  }

  render() {
    const {
      locale,
      captions,
      backgroundColor,
      intl,
    } = this.props;

    return (
      <div disabled className={styles.ccbox}>
        <div className={styles.title}>
          <p>
            { locale || intl.formatMessage(intlMessages.noLocaleSelected) }
          </p>
        </div>
        <div
          ref={(ref) => { this.refCCScrollArea = ref; }}
          className={styles.frame}
          style={{ background: backgroundColor }}
        >
          {captions[locale] ? captions[locale].captions.map(caption => (
            this.renderCaptions(caption)
          )) : null }
        </div>
      </div>
    );
  }
}

export default injectIntl(injectWbResizeEvent(ClosedCaptions));

ClosedCaptions.propTypes = {
  backgroundColor: PropTypes.string.isRequired,
  captions: PropTypes.arrayOf(
    PropTypes.shape({
      ownerId: PropTypes.string.isRequired,
      captions: PropTypes.arrayOf(
        PropTypes.shape({
          captions: PropTypes.string.isRequired,
        }).isRequired,
      ).isRequired,
    }).isRequired,
  ).isRequired,
  locale: PropTypes.string,
  fontColor: PropTypes.string.isRequired,
  fontSize: PropTypes.string.isRequired,
  fontFamily: PropTypes.string.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

ClosedCaptions.defaultProps = {
  locale: undefined,
};
