import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import CaptionsListItem from '/imports/ui/components/user-list/captions-list-item/component';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const propTypes = {
  ownedLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  sidebarContentPanel: PropTypes.string.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.userList.captionsTitle',
    description: 'Title for the captions list',
  },
});

class UserCaptions extends Component {
  renderCaptions() {
    const {
      ownedLocales,
      sidebarContentPanel,
      layoutContextDispatch,
    } = this.props;

    return ownedLocales.map((ownedLocale) => (
      <CSSTransition
        classNames="transition"
        appear
        enter
        exit={false}
        timeout={0}
        component="div"
        key={ownedLocale.locale}
      >
        <Styled.ListTransition>
          <CaptionsListItem
            {...{
              locale: ownedLocale.locale,
              name: ownedLocale.name,
              layoutContextDispatch,
              sidebarContentPanel,
            }}
            tabIndex={-1}
          />
        </Styled.ListTransition>
      </CSSTransition>
    ));
  }

  render() {
    const {
      intl,
      ownedLocales,
    } = this.props;

    if (ownedLocales.length < 1) return null;

    return (
      <Styled.Messages>
        <Styled.Container>
          <Styled.SmallTitle>
            {intl.formatMessage(intlMessages.title)}
          </Styled.SmallTitle>
        </Styled.Container>
        <Styled.ScrollableList
          role="tabpanel"
          tabIndex={0}
          ref={(ref) => { this._msgsList = ref; }}
        >
          <Styled.List>
            <TransitionGroup ref={(ref) => { this._msgItems = ref; }}>
              {this.renderCaptions()}
            </TransitionGroup>
          </Styled.List>
        </Styled.ScrollableList>
      </Styled.Messages>
    );
  }
}

UserCaptions.propTypes = propTypes;

export default injectIntl(UserCaptions);
