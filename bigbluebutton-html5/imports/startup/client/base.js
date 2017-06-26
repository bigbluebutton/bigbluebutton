import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import IntlStartup from './intl';

import Auth from '/imports/ui/services/auth';

import AppContainer from '/imports/ui/components/app/container';
import ErrorScreen from '/imports/ui/components/error-screen/component';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import Settings from '/imports/ui/services/settings';

const BROWSER_LANGUAGE = window.navigator.userLanguage || window.navigator.language;

class Base extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      error: props.error || null,
    };

    this.updateLoadingState = this.updateLoadingState.bind(this);
    this.updateErrorState = this.updateErrorState.bind(this);
  }

  updateLoadingState(loading = false) {
    this.setState({
      loading,
    });
  }

  updateErrorState(error = null) {
    this.setState({
      error,
    });
  }

  renderByState() {
    const { updateLoadingState, updateErrorState } = this;
    const stateControls = { updateLoadingState, updateErrorState };

    const { loading, error } = this.state;

    const { subscriptionsReady, errorCode } = this.props;

    if (error || errorCode) {
      return (<ErrorScreen code={errorCode}>{error}</ErrorScreen>);
    }

    if (loading || !subscriptionsReady) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }

    return (<AppContainer {...this.props} baseControls={stateControls} />);
  }

  render() {
    const { updateLoadingState, updateErrorState } = this;
    const { locale } = this.props;
    const stateControls = { updateLoadingState, updateErrorState };

    return (
      <IntlStartup locale={locale || BROWSER_LANGUAGE} baseControls={stateControls}>
        {this.renderByState()}
      </IntlStartup>
    );
  }
}

const SUBSCRIPTIONS_NAME = [
  'users2x', 'users', 'chat', 'cursor', 'cursor2x', 'deskshare', 'meetings', 'meetings2x',
  'polls', 'presentations', 'shapes', 'shapes2x', 'slides', 'captions', 'breakouts',
];

export default BaseContainer = createContainer(({ params }) => {
  if (params.errorCode) return params;

  if (!Auth.loggedIn) {
    return {
      errorCode: 401,
      error: 'You are unauthorized to access this meeting',
    };
  }

  const credentials = Auth.credentials;
  const subscriptionsHandlers = SUBSCRIPTIONS_NAME.map(name => Meteor.subscribe(name, credentials));

  return {
    locale: Settings.application.locale,
    subscriptionsReady: subscriptionsHandlers.every(handler => handler.ready()),
  };
}, Base);
