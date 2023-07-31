import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import CaptionsListItem from '/imports/ui/components/user-list/captions-list-item/component';
import { defineMessages, injectIntl } from 'react-intl';
import KEY_CODES from '/imports/utils/keyCodes';
import Styled from './styles';
import { findDOMNode } from 'react-dom';

const propTypes = {
  ownedLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  sidebarContentPanel: PropTypes.string.isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.userList.captionsTitle',
    description: 'Title for the captions list',
  },
});

class UserCaptions extends Component {
  constructor() {
    super();

    this.state = {
      selectedCaption: null,
    };

    this.activeCaptionRefs = [];

    this.changeState = this.changeState.bind(this);
    this.rove = this.rove.bind(this);
  }

  componentDidMount() {
    if (this._captionsList) {
      this._captionsList.addEventListener(
        'keydown',
        this.rove,
        true,
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedCaption } = this.state;
    if (selectedCaption && selectedCaption !== prevState.selectedCaption) {
      const { firstChild } = selectedCaption;
      if (firstChild) firstChild.focus();
    }
  }

  changeState(ref) {
    this.setState({ selectedCaption: ref });
  }

  rove(event) {
    const { roving } = this.props;
    const { selectedCaption } = this.state;
    const captionItemsRef = findDOMNode(this._captionItems);
    if ([KEY_CODES.SPACE, KEY_CODES.ENTER].includes(event?.which)) {
      selectedCaption?.firstChild?.click();
    } else {
      roving(event, this.changeState, captionItemsRef, selectedCaption);
    }
    event.stopPropagation();
  }

  renderCaptions() {
    const {
      ownedLocales,
      sidebarContentPanel,
      layoutContextDispatch,
    } = this.props;

    let index = -1;

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
        <Styled.ListTransition ref={(node) => { this.activeCaptionRefs[index += 1] = node; }}>
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
          ref={(ref) => { this._captionsList = ref; }}
        >
          <Styled.List>
            <TransitionGroup ref={(ref) => { this._captionItems = ref; }}>
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
