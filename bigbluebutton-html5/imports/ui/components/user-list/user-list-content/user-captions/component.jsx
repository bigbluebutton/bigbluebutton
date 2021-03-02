import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import CaptionsListItem from '/imports/ui/components/user-list/captions-list-item/component';
import { defineMessages } from 'react-intl';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';

const listTransition = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  appear: styles.appear,
  appearActive: styles.appearActive,
  leave: styles.leave,
  leaveActive: styles.leaveActive,
};

const propTypes = {
  ownedLocales: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const intlMessages = defineMessages({
  title: {
    id: 'app.userList.captionsTitle',
    description: 'Title for the captions list',
  },
});

class UserCaptions extends Component {
  constructor(props) {
    super(props);

    this.updatedOwnledLocales = this.updatedOwnledLocales.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.updatedOwnledLocales(nextProps);
  }

  updatedOwnledLocales(nextProps) {
    const { ownedLocales } = this.props;
    return ownedLocales.length !== nextProps.ownedLocales.length;
  }

  renderCaptions() {
    const {
      ownedLocales,
    } = this.props;

    return ownedLocales.map(locale => (
      <CSSTransition
        classNames={listTransition}
        appear
        enter
        exit={false}
        timeout={0}
        component="div"
        className={styles.captionsList}
        key={locale.locale}
      >
        <CaptionsListItem locale={locale} tabIndex={-1} />
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
      <div className={styles.messages}>
        <div className={styles.container}>
          <h2 className={styles.smallTitle}>
            {intl.formatMessage(intlMessages.title)}
          </h2>
        </div>
        <div
          role="tabpanel"
          tabIndex={0}
          className={styles.scrollableList}
          ref={(ref) => { this._msgsList = ref; }}
        >
          <div className={styles.list}>
            <TransitionGroup ref={(ref) => { this._msgItems = ref; }}>
              {this.renderCaptions()}
            </TransitionGroup>
          </div>
        </div>
      </div>
    );
  }
}

UserCaptions.propTypes = propTypes;

export default UserCaptions;
