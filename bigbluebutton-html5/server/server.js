import '/imports/startup/server/index';


import '/imports/api/chat/server/publications';
import '/imports/api/chat/server/methods/sendChatMessagetoServer';
import '/imports/api/chat/server/modifiers/addChatToCollection';
import '/imports/api/chat/server/modifiers/clearChatCollection';

import '/imports/api/cursor/server/publications';
import '/imports/api/cursor/server/modifiers/clearCursorCollection';
import '/imports/api/cursor/server/modifiers/initializeCursor';
import '/imports/api/cursor/server/modifiers/updateCursorLocation';

import '/imports/api/deskshare/server/publications';
import '/imports/api/deskshare/server/modifiers/clearDeskshareCollection';
import '/imports/api/deskshare/server/modifiers/handleDeskShareChange';
import '/imports/api/deskshare/server/modifiers/handleIncomingDeskshareMessage';

import '/imports/api/meetings/server/publications';
import '/imports/api/meetings/server/modifiers/addMeetingToCollection';
import '/imports/api/meetings/server/modifiers/clearMeetingsCollection';
import '/imports/api/meetings/server/modifiers/removeMeetingFromCollection';

import '/imports/api/polls/server/publications';
import '/imports/api/polls/server/methods/publishVoteMessage';
import '/imports/api/polls/server/modifiers/addPollToCollection';
import '/imports/api/polls/server/modifiers/clearPollCollection';
import '/imports/api/polls/server/modifiers/updatePollCollection';

import '/imports/api/presentations/server/publications';
import '/imports/api/presentations/server/methods/publishSwitchToNextSlideMessage';
import '/imports/api/presentations/server/methods/publishSwitchToPreviousSlideMessage';
import '/imports/api/presentations/server/modifiers/addPresentationToCollection';
import '/imports/api/presentations/server/modifiers/clearPresentationsCollection';
import '/imports/api/presentations/server/modifiers/removePresentationFromCollection';

import '/imports/api/shapes/server/publications';
import '/imports/api/shapes/server/modifiers/addShapeToCollection';
import '/imports/api/shapes/server/modifiers/clearShapesCollection';
import '/imports/api/shapes/server/modifiers/removeAllShapesFromSlide';
import '/imports/api/shapes/server/modifiers/removeShapeFromSlide';

import '/imports/api/slides/server/publications';
import '/imports/api/slides/server/modifiers/addSlideToCollection';
import '/imports/api/slides/server/modifiers/clearSlidesCollection';
import '/imports/api/slides/server/modifiers/displayThisSlide';

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

import '/imports/startup/server/EventQueue';
import '/imports/startup/server/helpers';
import '/imports/startup/server/logger';
import '/imports/startup/server/eventHandlers';
import '/imports/startup/server/RedisPubSub';
import '/imports/startup/server/userPermissions';

// TODO import all the modifiers/* files from api
