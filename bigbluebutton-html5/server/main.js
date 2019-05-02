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
import '/imports/api/video/server';
import '/imports/api/users-infos/server';

import '/imports/api/external-videos/server';
import '/imports/api/guest-users/server';


// Commons
import '/imports/api/log-client/server';
import '/imports/api/common/server/helpers';
import '/imports/startup/server/logger';

import { setMinimumBrowserVersions } from 'meteor/modern-browsers';

// common restriction is support for WebRTC functions

// WebRTC stats might require FF 55/CH 67 (or 66)

setMinimumBrowserVersions({
  chrome: 59,
  firefox: 52,
  edge: 17,
  ie: Infinity,
  mobileSafari: [11, 1],
  opera: 46,
  safari: [11, 1],
  electron: [0, 36],
}, 'service workers');
