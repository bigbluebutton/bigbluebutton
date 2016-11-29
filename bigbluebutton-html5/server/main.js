import '/imports/startup/server';
import '/imports/api/chat/server';

import '/imports/api/cursor/server';

import '/imports/api/deskshare/server/publications';
import '/imports/api/deskshare/server/modifiers/clearDeskshareCollection';
import '/imports/api/deskshare/server/modifiers/handleDeskShareChange';
import '/imports/api/deskshare/server/modifiers/handleIncomingDeskshareMessage';
import '/imports/api/deskshare/server/modifiers/eventHandlers';

import '/imports/api/meetings/server';

import '/imports/api/phone/server/modifiers/eventHandlers';

import '/imports/api/polls/server';

import '/imports/api/breakouts/server';

import '/imports/api/presentations/server';

import '/imports/api/shapes/server';

import '/imports/api/slides/server';

import '/imports/api/captions/server/publications';
import '/imports/api/captions/server/modifiers/clearCaptionsCollection';
import '/imports/api/captions/server/modifiers/eventHandlers';

import '/imports/api/users/server/publications';
import '/imports/api/users/server/methods/kickUser';
import '/imports/api/users/server/methods/listenOnlyRequestToggle';
import '/imports/api/users/server/methods/muteUser';
import '/imports/api/users/server/methods/setUserPresenter';
import '/imports/api/users/server/methods/unmuteUser';
import '/imports/api/users/server/methods/userLogout';
import '/imports/api/users/server/methods/userSetEmoji';
import '/imports/api/users/server/methods/validateAuthToken';
import '/imports/api/users/server/modifiers/clearUsersCollection';
import '/imports/api/users/server/modifiers/createDummyUser';
import '/imports/api/users/server/modifiers/handleLockingMic';
import '/imports/api/users/server/modifiers/markUserOffline';
import '/imports/api/users/server/modifiers/requestUserLeaving';
import '/imports/api/users/server/modifiers/setUserLockedStatus';
import '/imports/api/users/server/modifiers/updateVoiceUser';
import '/imports/api/users/server/modifiers/userJoined';
import '/imports/api/users/server/modifiers/eventHandlers';

import '/imports/api/common/server/helpers';
import '/imports/startup/server/logger';
import '/imports/startup/server/userPermissions';
