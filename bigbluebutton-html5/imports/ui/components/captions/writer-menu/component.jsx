import React, { PureComponent } from 'react';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import PropTypes from 'prop-types';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import { styles } from './styles';

const DEFAULT_VALUE = 'select';
const DEFAULT_KEY = -1;

const intlMessages = defineMessages({
  closeLabel: {
    id: 'app.captions.menu.closeLabel',
    description: 'Label for closing captions menu',
  },
  title: {
    id: 'app.captions.menu.title',
    description: 'Title for the closed captions menu',
  },
  start: {
    id: 'app.captions.menu.start',
    description: 'Write closed captions',
  },
  select: {
    id: 'app.captions.menu.select',
    description: 'Select closed captions available language',
  },
});

const propTypes = {
  takeOwnership: PropTypes.func.isRequired,
  availableLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class WriterMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { locale: null };

    this.handleChange = this.handleChange.bind(this);
    this.handleStart = this.handleStart.bind(this);
  }

  handleChange(event) {
    this.setState({ locale: event.target.value });
  }

  handleStart() {
    const { closeModal, takeOwnership } = this.props;
    const { locale } = this.state;

    takeOwnership(locale);
    Session.set('captionsLocale', locale);
    Session.set('openPanel', 'captions');

    closeModal();
  }

  render() {
    const {
      intl,
      availableLocales,
      closeModal,
    } = this.props;

    const { locale } = this.state;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.title)}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>
            {intl.formatMessage(intlMessages.title)}
          </h3>
        </header>
        <div className={styles.content}>
          <select
            className={styles.select}
            onChange={this.handleChange}
            defaultValue={DEFAULT_VALUE}
          >
            <option disabled key={DEFAULT_KEY} value={DEFAULT_VALUE}>
              {intl.formatMessage(intlMessages.select)}
            </option>
            {availableLocales.map(localeItem => (
              <option key={localeItem.locale} value={localeItem.locale}>
                {localeItem.name}
              </option>
            ))}
          </select>
          <Button
            className={styles.startBtn}
            label={intl.formatMessage(intlMessages.start)}
            onClick={this.handleStart}
            disabled={locale == null}
          />
        </div>
      </Modal>
    );
  }
}

WriterMenu.propTypes = propTypes;

export default injectIntl(withModalMounter(WriterMenu));
