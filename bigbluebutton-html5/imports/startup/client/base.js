import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';

import IntlStartup from './intl';

import Auth from '/imports/ui/services/auth';

import AppContainer from '/imports/ui/components/app/container';
import LoadingScreen from '/imports/ui/components/loading-screen/component';

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

    const { subscriptionsReady } = this.props;

    if (error) {
      return (<h1>{error}</h1>);
    }

    if (loading || !subscriptionsReady) {
      return (<LoadingScreen>{loading}</LoadingScreen>);
    }

    return (<AppContainer {...this.props} baseControls={stateControls}/>);
  }

  render() {
    const { updateLoadingState, updateErrorState } = this;
    const stateControls = { updateLoadingState, updateErrorState };

    return (
      <IntlStartup locale={BROWSER_LANGUAGE} baseControls={stateControls}>
        {this.renderByState()}
      </IntlStartup>
    );
  }
};

const SUBSCRIPTIONS_NAME = [
  'current-user', 'users', 'chat', 'cursor', 'deskshare', 'meetings',
  'polls', 'presentations', 'shapes', 'slides', 'captions', 'breakouts',
];

export default BaseContainer = createContainer(() => {
  if (!Auth.loggedIn) {
    return {
      error: 'ERROR 401: You are unauthorized to access this meeting',
    };
  }

  const credentials = Auth.getCredentials();
  const subscriptionsHandlers = SUBSCRIPTIONS_NAME.map(name => Meteor.subscribe(name, credentials));
  
  return {
    subscriptionsReady: subscriptionsHandlers.every(handler => handler.ready()),
  };
}, Base);
