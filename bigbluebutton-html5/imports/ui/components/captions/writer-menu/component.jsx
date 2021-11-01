import React, { PureComponent } from 'react';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl } from 'react-intl';
import { withModalMounter } from '/imports/ui/components/modal/service';
import PropTypes from 'prop-types';
import LocalesDropdown from '/imports/ui/components/locales-dropdown/component';
import Styled from './styles';
import { PANELS, ACTIONS } from '../../layout/enums';

const intlMessages = defineMessages({
  closeLabel: {
    id: 'app.captions.menu.closeLabel',
    description: 'Label for closing captions menu',
  },
  title: {
    id: 'app.captions.menu.title',
    description: 'Title for the closed captions menu',
  },
  subtitle: {
    id: 'app.captions.menu.subtitle',
    description: 'Subtitle for the closed captions writer menu',
  },
  start: {
    id: 'app.captions.menu.start',
    description: 'Write closed captions',
  },
  ariaStart: {
    id: 'app.captions.menu.ariaStart',
    description: 'aria label for start captions button',
  },
  ariaStartDesc: {
    id: 'app.captions.menu.ariaStartDesc',
    description: 'aria description for start captions button',
  },
  select: {
    id: 'app.captions.menu.select',
    description: 'Select closed captions available language',
  },
  ariaSelect: {
    id: 'app.captions.menu.ariaSelect',
    description: 'Aria label for captions language selector',
  },
});

const propTypes = {
  takeOwnership: PropTypes.func.isRequired,
  allLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  closeModal: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class WriterMenu extends PureComponent {
  constructor(props) {
    super(props);
    const { allLocales, intl } = this.props;

    const candidate = allLocales.filter(
      (l) => l.locale.substring(0, 2) === intl.locale.substring(0, 2),
    );

    this.state = {
      locale: candidate && candidate[0] ? candidate[0].locale : null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleStart = this.handleStart.bind(this);
  }

  componentWillUnmount() {
    const { closeModal } = this.props;

    closeModal();
  }

  handleChange(event) {
    this.setState({ locale: event.target.value });
  }

  handleStart() {
    const { closeModal, takeOwnership, layoutContextDispatch } = this.props;
    const { locale } = this.state;

    takeOwnership(locale);
    Session.set('captionsLocale', locale);

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.CAPTIONS,
    });

    closeModal();
  }

  render() {
    const {
      intl,
      allLocales,
      closeModal,
    } = this.props;

    const { locale } = this.state;

    return (
      <Styled.WriterMenuModal
        onRequestClose={closeModal}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.title)}
      >
        <Styled.Header>
          <Styled.Title>
            {intl.formatMessage(intlMessages.title)}
          </Styled.Title>
        </Styled.Header>
        <Styled.Content>
          <span>
            {intl.formatMessage(intlMessages.subtitle)}
          </span>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            aria-hidden
            htmlFor="captionsLangSelector"
            aria-label={intl.formatMessage(intlMessages.ariaSelect)}
          />

          <Styled.WriterMenuSelect>
            <LocalesDropdown
              allLocales={allLocales}
              handleChange={this.handleChange}
              value={locale}
              elementId="captionsLangSelector"
              selectMessage={intl.formatMessage(intlMessages.select)}
            />
          </Styled.WriterMenuSelect>
          <Styled.StartBtn
            label={intl.formatMessage(intlMessages.start)}
            aria-label={intl.formatMessage(intlMessages.ariaStart)}
            aria-describedby="descriptionStart"
            onClick={this.handleStart}
            disabled={locale == null}
          />
          <div id="descriptionStart" hidden>{intl.formatMessage(intlMessages.ariaStartDesc)}</div>
        </Styled.Content>
      </Styled.WriterMenuModal>
    );
  }
}

WriterMenu.propTypes = propTypes;

export default injectIntl(withModalMounter(WriterMenu));
