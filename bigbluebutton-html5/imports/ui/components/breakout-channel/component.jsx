import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import _ from 'lodash';
import Button from '/imports/ui/components/button/component';
import { Session } from 'meteor/session';
import logger from '/imports/startup/client/logger';
import { styles } from './styles';

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
  breakoutAriaTitle: {
    id: 'app.createBreakoutRoom.ariaTitle',
    description: 'breakout aria title',
  },
  breakoutDuration: {
    id: 'app.createBreakoutRoom.duration',
    description: 'breakout duration time',
  },
  breakoutRoom: {
    id: 'app.createBreakoutRoom.room',
    description: 'breakout room',
  },
  breakoutJoin: {
    id: 'app.createBreakoutRoom.join',
    description: 'label for join breakout room',
  },
  breakoutJoinAudio: {
    id: 'app.createBreakoutRoom.joinAudio',
    description: 'label for option to transfer audio',
  },
  breakoutReturnAudio: {
    id: 'app.createBreakoutRoom.returnAudio',
    description: 'label for option to return audio',
  },
  generatingURL: {
    id: 'app.createBreakoutRoom.generatingURL',
    description: 'label for generating breakout room url',
  },
  generatedURL: {
    id: 'app.createBreakoutRoom.generatedURL',
    description: 'label for generate breakout room url',
  },
  endAllBreakouts: {
    id: 'app.createBreakoutRoom.endAllBreakouts',
    description: 'Button label to end all breakout rooms',
  },
  alreadyConnected: {
    id: 'app.createBreakoutRoom.alreadyConnected',
    description: 'label for the user that is already connected to breakout room',
  },
});

class BreakoutChannel extends PureComponent {
  static sortById(a, b) {
    if (a.userId > b.userId) {
      return 1;
    }

    if (a.userId < b.userId) {
      return -1;
    }

    return 0;
  }

  static sortUsersByName(a, b) {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    if (aName < bName) {
      return -1;
    } if (aName > bName) {
      return 1;
    }

    return 0;
  }

  constructor(props) {
    super(props);
    this.getBreakoutURL = this.getBreakoutURL.bind(this);
    this.renderBreakoutRooms = this.renderBreakoutRooms.bind(this);
    this.transferUserToBreakoutRoom = this.transferUserToBreakoutRoom.bind(this);
    this.renderUserActions = this.renderUserActions.bind(this);
    this.returnBackToMeeeting = this.returnBackToMeeeting.bind(this);
    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.state = {
      requestedBreakoutId: '',
      waiting: false,
      joinedAudioOnly: false,
      breakoutId: '',
    };
  }

  componentDidMount() {
    const { compact } = this.props;
    if (!compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        this.rove,
      );
    }
  }

  componentWillUnmount() {
    this.refScrollContainer.removeEventListener('keydown', this.rove);
  }


  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  componentDidUpdate() {
    const {
      breakoutRoomUser,
      breakoutRooms,
      closeBreakoutPanel,
    } = this.props;

    const {
      waiting,
      requestedBreakoutId,
    } = this.state;

    if (breakoutRooms.length <= 0) closeBreakoutPanel();

    if (waiting) {
      const breakoutUser = breakoutRoomUser(requestedBreakoutId);

      if (!breakoutUser) return;
      if (breakoutUser.redirectToHtml5JoinURL !== '') {
        window.open(breakoutUser.redirectToHtml5JoinURL, '_blank');
        _.delay(() => this.setState({ waiting: false }), 1000);
      }
    }
  }

  getBreakoutChannelJoinURL(breakoutId) {
    const hasUser = breakoutRoomUser(breakoutId);
    if (hasUser) 
      return redirectToHtml5JoinURL;
    else
      return null;
  }

  getBreakoutURL(breakoutId) {
    Session.set('lastBreakoutOpened', breakoutId);
    const { requestJoinURL, breakoutRoomUser } = this.props;
    const { waiting } = this.state;
    const hasUser = breakoutRoomUser(breakoutId);
    if (!hasUser && !waiting) {
      this.setState(
        {
          waiting: true,
          requestedBreakoutId: breakoutId,
        },
        () => requestJoinURL(breakoutId),
      );
    }

    if (hasUser) {
      window.open(hasUser.redirectToHtml5JoinURL, '_blank');
      this.setState({ waiting: false });
    }
    return null;
  }

  transferUserToBreakoutRoom(breakoutId) {
    const { transferToBreakout } = this.props;
    transferToBreakout(breakoutId);
    this.setState({ joinedAudioOnly: true, breakoutId });
  }

  returnBackToMeeeting(breakoutId) {
    const { transferUserToMeeting, meetingId } = this.props;
    transferUserToMeeting(breakoutId, meetingId);
    this.setState({ joinedAudioOnly: false, breakoutId });
  }

  renderUserActions(breakoutId, joinedUsers, number) {
    const {
      isMicrophoneUser,
      amIModerator,
      intl,
      isUserInBreakoutRoom,
      exitAudio,
    } = this.props;

    const {
      joinedAudioOnly,
      breakoutId: stateBreakoutId,
      requestedBreakoutId,
      waiting,
    } = this.state;

    const moderatorJoinedAudio = isMicrophoneUser && amIModerator;
    const disable = waiting && requestedBreakoutId !== breakoutId;
    const audioAction = joinedAudioOnly
      ? () => {
        this.returnBackToMeeeting(breakoutId);
        return logger.debug({
          logCode: 'breakoutroom_return_main_audio',
          extraInfo: { logType: 'user_action' },
        }, 'Returning to main audio (breakout room audio closed)');
      }
      : () => {
        this.transferUserToBreakoutRoom(breakoutId);
        return logger.debug({
          logCode: 'breakoutroom_join_audio_from_main_room',
          extraInfo: { logType: 'user_action' },
        }, 'joining breakout room audio (main room audio closed)');
      };
    return (
      <div className={styles.breakoutActions}>
        {isUserInBreakoutRoom(joinedUsers)
          ? (
            <span className={styles.alreadyConnected}>
              {intl.formatMessage(intlMessages.alreadyConnected)}
            </span>
          )
          : (
            <Button
              label={intl.formatMessage(intlMessages.breakoutJoin)}
              aria-label={`${intl.formatMessage(intlMessages.breakoutJoin)} ${number}`}
              onClick={() => {
                this.getBreakoutURL(breakoutId);
                exitAudio();
                logger.debug({
                  logCode: 'breakoutroom_join',
                  extraInfo: { logType: 'user_action' },
                }, 'joining breakout room closed audio in the main room');
              }
              }
              disabled={disable}
              className={styles.joinButton}
            />
          )
        }
        {
          moderatorJoinedAudio
            ? [
              ('|'),
              (
                <Button
                  label={
                    moderatorJoinedAudio
                      && stateBreakoutId === breakoutId
                      && joinedAudioOnly
                      ? intl.formatMessage(intlMessages.breakoutReturnAudio)
                      : intl.formatMessage(intlMessages.breakoutJoinAudio)
                  }
                  className={styles.button}
                  key={`join-audio-${breakoutId}`}
                  onClick={audioAction}
                />
              ),
            ]
            : null
        }
      </div>
    );
  }

    // const {
    //   breakoutRooms,
    //   intl,
    // } = this.props;

    // const {
    //   waiting,
    //   requestedBreakoutId,
    // } = this.state;

    // const roomItems = breakoutRooms.map(breakout => (
    //   <div
    //     className={styles.breakoutItems}
    //     key={`breakoutRoomItems-${breakout.breakoutId}`}
    //   >
    //     <div className={styles.content} key={`breakoutRoomList-${breakout.breakoutId}`}>
    //       <span aria-hidden>
    //         {intl.formatMessage(intlMessages.breakoutRoom, breakout.sequence.toString())}
    //         <span className={styles.usersAssignedNumberLabel}>
    //           (
    //           {breakout.joinedUsers.length}
    //           )
    //         </span>
    //       </span>
    //       {waiting && requestedBreakoutId === breakout.breakoutId ? (
    //         <span>
    //           {intl.formatMessage(intlMessages.generatingURL)}
    //           <span className={styles.connectingAnimation} />
    //         </span>
    //       ) : this.renderUserActions(
    //         breakout.breakoutId,
    //         breakout.joinedUsers,
    //         breakout.sequence.toString(),
    //       )}
    //     </div>
    //     <div className={styles.joinedUserNames}>
    //       {breakout.joinedUsers
    //         .sort(BreakoutRoom.sortById)
    //         .filter((value, idx, arr) => !(value.userId === (arr[idx + 1] || {}).userId))
    //         .sort(BreakoutRoom.sortUsersByName)
    //         .map(u => u.name)
    //         .join(', ')}
    //     </div>
    //   </div>


    // return (
    //   <div className={styles.breakoutColumn}>
    //     <div className={styles.breakoutScrollableList}>
    //       {roomItems}
    //     </div>
    //   </div>
    // );
  // }



   

  renderBreakoutRooms() {
    const {
      breakoutRooms,
      intl,
    } = this.props;

    const {
      waiting,
      requestedBreakoutId,
    } = this.state;

    return(

      breakoutRooms.map(breakout =>
        <div
          className={styles.channelName}
          role="button"
        >
       
   {/* TODO: Do internationlization */}
         <Button
              label={breakout.name}
                onClick={() => {
                this.getBreakoutURL(breakout.breakoutId);
                exitAudio();
                // logger.debug({
                //   logCode: 'breakoutroom_join',
                //   extraInfo: { logType: 'user_action' },
                // }, 'joining breakout room closed audio in the main room');
              }
              }
              className={styles.channelNameMain}
            />
      </div>
      )
     );
   }


    // const roomItems = breakoutRooms.map(breakout => (
    //   <div
    //     className={styles.breakoutItems}
    //     key={`breakoutRoomItems-${breakout.breakoutId}`}
    //   >
    //     <div className={styles.content} key={`breakoutRoomList-${breakout.breakoutId}`}>
    //       <span aria-hidden>
    //         {intl.formatMessage(intlMessages.breakoutRoom, breakout.sequence.toString())}
    //         <span className={styles.usersAssignedNumberLabel}>
    //           (
    //           {breakout.joinedUsers.length}
    //           )
    //         </span>
    //       </span>
    //       {waiting && requestedBreakoutId === breakout.breakoutId ? (
    //         <span>
    //           {intl.formatMessage(intlMessages.generatingURL)}
    //           <span className={styles.connectingAnimation} />
    //         </span>
    //       ) : this.renderUserActions(
    //         breakout.breakoutId,
    //         breakout.joinedUsers,
    //         breakout.sequence.toString(),
    //       )}
    //     </div>
    //     <div className={styles.joinedUserNames}>
    //       {breakout.joinedUsers
    //         .sort(BreakoutRoom.sortById)
    //         .filter((value, idx, arr) => !(value.userId === (arr[idx + 1] || {}).userId))
    //         .sort(BreakoutRoom.sortUsersByName)
    //         .map(u => u.name)
    //         .join(', ')}
    //     </div>
    //   </div>


  //   return (
  //     <div className={styles.breakoutColumn}>
  //       <div className={styles.breakoutScrollableList}>
  //         {roomItems}
  //       </div>
  //     </div>
  //   );
  // }

  render() {
    const {
      isMeteorConnected, intl, endAllBreakouts, amIModerator, closeBreakoutPanel,
    } = this.props;
    return (

      <div className={styles.channelListColumn}>        
         
              <div className={styles.container}>
                <h2 className={styles.channelsTitle}>
                  {/* TODO */}
                  {/* {intl.formatMessage(intlMessages.usersTitle)} */}
                  Chat Channels
                </h2>
              </div>

              <div
                className={styles.scrollableList}
                tabIndex={0}
                ref={(ref) => { this.refScrollContainer = ref; }}
              >
              
                <div className={styles.channelList}>
                   <span className={styles.channelNameMain}>
                    Master Channel
                    </span>
 
                  {this.renderBreakoutRooms()}
               
                </div>
            </div>

      </div>
    

             
      
      
    );  
  }
}

export default injectIntl(BreakoutChannel);
