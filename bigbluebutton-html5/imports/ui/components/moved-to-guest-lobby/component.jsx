import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import AudioManager from '/imports/ui/services/audio-manager';
import { styles } from '/imports/ui/components/meeting-ended/styles';

const intlMessages = defineMessages({
  movedToGuestLobbyTitle: {
    id: 'app.guest.movedToGuestLobbyMessage',
    description: 'User has been moved to the guest lobby',
  },
  redirectingToGuestLobby: {
    id: 'app.guest.redirectingToGuestLobby',
    description: 'User will be redirected to the guest lobby',
  },
});

let sessionToken = '';
const REDIRECT_TIMEOUT = 5000;
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

if (typeof params.sessionToken !== 'undefined') sessionToken = params.sessionToken;

class MovedToGuestLobbyScreen extends PureComponent {

    componentDidMount() {
         AudioManager.exitAudio();
        Meteor.disconnect();
    }

    render(){

        const {
            intl,
        } = this.props;

        /*
        * The redirection to the guest lobby is delayed by a timeout because of accessibility
        */ 

        setTimeout(() => {
        const GUEST_WAIT_ENDPOINT = "/html5client/guestWait?sessionToken=" + sessionToken;
        const url = new URL(`${window.location.origin}${GUEST_WAIT_ENDPOINT}`);
        window.location.href=url;
        }, REDIRECT_TIMEOUT);

      return(
        <div className={styles.parent}>
          <div className={styles.modal}>
            <div className={styles.content}>
              <h1 className={styles.title}>
              {intl.formatMessage(intlMessages.movedToGuestLobbyTitle)}
              </h1>
                <div>
                  <div className={styles.text}>
                    {intl.formatMessage(intlMessages.redirectingToGuestLobby)}              
                   </div>
                </div>
            </div>
          </div>
        </div>
      );
    }
}

export default injectIntl(MovedToGuestLobbyScreen);

