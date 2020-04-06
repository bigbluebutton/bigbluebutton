import '/imports/startup/server';

// 2x
import '/imports/api/meetings/server';
import '/imports/api/users/server';
import '/imports/api/annotations/server';
import '/imports/api/cursor/server';
import '/imports/api/polls/server';
import '/imports/api/captions/server';
import '/imports/api/presentations/server';
import '/imports/api/presentation-pods/server';
import '/imports/api/presentation-upload-token/server';
import '/imports/api/slides/server';
import '/imports/api/breakouts/server';
import '/imports/api/group-chat/server';
import '/imports/api/group-chat-msg/server';
import '/imports/api/screenshare/server';
import '/imports/api/users-settings/server';
import '/imports/api/voice-users/server';
import '/imports/api/whiteboard-multi-user/server';
import '/imports/api/video-streams/server';
import '/imports/api/network-information/server';
import '/imports/api/users-infos/server';
import '/imports/api/note/server';
import '/imports/api/external-videos/server';
import '/imports/api/guest-users/server';
import '/imports/api/ping-pong/server';
import '/imports/api/local-settings/server';
import '/imports/api/voice-call-states/server';

// Commons
import '/imports/api/log-client/server';
import '/imports/api/common/server/helpers';
import '/imports/startup/server/logger';

// Needed for Atmosphere package RocketChat/meteor-streamer
// It is out of date and was written when Meteor contained lodash
// package. However, we now import lodash as an npm package
// in order to control versions, update flexibly, etc..
// Setting the global._ to utilize the npm lodash package is an interim fix
// and its introduction was inspired by
// https://github.com/RocketChat/meteor-streamer/issues/40#issuecomment-497627893
import _ from 'lodash';

global._ = _;
