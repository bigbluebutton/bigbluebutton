import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AppContainer from '/imports/ui/components/app/container';
import ErrorScreen from '/imports/ui/components/error-screen/component';
import MeetingEnded from '/imports/ui/components/meeting-ended/component';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import Settings from '/imports/ui/services/settings';
import AudioManager from '/imports/ui/services/audio-manager';
import IntlStartup from './intl';

const propTypes = {
  error: PropTypes.object,
  errorCode: PropTypes.number,
  subscriptionsReady: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  endedCode: PropTypes.string,
};

const defaultProps = {
  error: undefined,
  errorCode: undefined,
  locale: undefined,
  endedCode: undefined,
};

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
    const { endedCode } = this.props.params;

    if (endedCode) {
      AudioManager.exitAudio();
      return (<MeetingEnded code={endedCode} />);
    }

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
      <IntlStartup locale={locale} baseControls={stateControls}>
        {this.renderByState()}
      </IntlStartup>
    );
  }
}

Base.propTypes = propTypes;
Base.defaultProps = defaultProps;

const SUBSCRIPTIONS_NAME = [
  'users', 'chat', 'cursor', 'meetings', 'polls', 'presentations', 'annotations',
  'slides', 'captions', 'breakouts', 'voiceUsers', 'whiteboard-multi-user', 'screenshare',
];

const BaseContainer = withRouter(withTracker(({ params, router }) => {
  if (params.errorCode) return params;

  if (!Auth.loggedIn) {
    return router.push('/logout');
  }

  const { credentials } = Auth;


  const subscriptionErrorHandler = {
    onError: (error) => {
      console.error(error);
      return router.push('/logout');
    },
  };

  const subscriptionsHandlers = SUBSCRIPTIONS_NAME.map(name =>
    Meteor.subscribe(name, credentials, subscriptionErrorHandler));


  return {
    locale: Settings.application.locale,
    subscriptionsReady: subscriptionsHandlers.every(handler => handler.ready()),
  };
})(Base));

export default BaseContainer;
