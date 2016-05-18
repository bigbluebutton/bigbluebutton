import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import {getInStorage} from '/imports/ui/components/app/service';
import {callServer} from '/imports/ui/services/api';

//TODO relocate? Anton

// Periodically check the status of the WebRTC call, when a call has been established attempt to
// hangup, retry if a call is in progress, send the leave voice conference message to BBB
function exitVoiceCall(afterExitCall) {
//   if (!Meteor.config.useSIPAudio) {
//     leaveWebRTCVoiceConference_verto();
//     cur_call = null;
//     return;
//   } else {
//     // To be called when the hangup is initiated
//     hangupCallback = function() {
//       console.log('Exiting Voice Conference');
//     }
//
//     // Checks periodically until a call is established so we can successfully end the call
//     // clean state
//     getInSession("triedHangup", false);
//     // function to initiate call
//     const checkToHangupCall = (function(context) {
//       // if an attempt to hang up the call is made when the current session is not yet finished,
//         the request has no effect
//       // keep track in the session if we haven't tried a hangup
//       if (BBB.getCallStatus() != null && !getInSession("triedHangup")) {
//         console.log('Attempting to hangup on WebRTC call');
//            notify BBB-apps we are leaving the call call if we are listen only
//         if (BBB.amIListenOnlyAudio()) {
//           Meteor.call('listenOnlyRequestToggle', BBB.getMeetingId(), BBB.getMyUserId(),
//                BBB.getMyAuthToken(), false);
//         }
//         BBB.leaveVoiceConference(hangupCallback);
//         getInSession("triedHangup", true); // we have hung up, prevent retries
//         notification_WebRTCAudioExited();
//         if (afterExitCall) {
//           afterExitCall(this, Meteor.config.app.listenOnly);
//         }
//       } else {
//         // console.log(`RETRYING hangup on WebRTC call in
// ${Meteor.config.app.WebRTCHangupRetryInterval} ms`);
//         // try again periodically
//         setTimeout(checkToHangupCall, Meteor.config.app.WebRTCHangupRetryInterval);
//       }
//     })(this); // automatically run function
//     return false;
//   };
}

BBB = {};
BBB.getMyUserInfo = function (callback) {
  const uid = getInStorage('userID');
  console.log(Users);
  const result = {
    myUserID: uid,
    myUsername: Users.findOne({ userId: uid }).user.name,
    myInternalUserID: uid,
    myAvatarURL: null,
    myRole: 'getMyRole',
    amIPresenter: 'false',
    voiceBridge: Meetings.findOne({}).voiceConf,
    dialNumber: null,
  };
  return callback(result);
};

// join the conference. If listen only send the request to the server
function joinVoiceCall(options) {
  console.log(options);
  if (options.useSIPAudio) {
    // create voice call params
    const joinCallback = function (message) {
      console.log('Beginning WebRTC Conference Call');
    };

    if (options.isListenOnly) {
      callServer('listenOnlyRequestToggle', true);
    }

    const voiceBridge = Meetings.findOne({}).voiceConf;
    callIntoConference(voiceBridge, function () {}, options.isListenOnly);

    return;
  } else {
    const extension = Meetings.findOne().voiceConf;
    const uName = Users.findOne({ userId: getInSession('userId') }).user.name;
    conferenceUsername = 'FreeSWITCH User - ' + encodeURIComponent(uName);
    conferenceIdNumber = '1009';
    vertoService.joinAudio();
  }
}

export { joinVoiceCall, exitVoiceCall };
