import '/imports/startup/server/index';

import '/imports/api/users/server/publications';
import '/imports/api/users/server/users';

import '/imports/api/chat/server/publications';
import '/imports/api/chat/server/chat';

import '/imports/api/meetings/server/publications';
import '/imports/api/meetings/server/meetings';

import '/imports/api/shapes/server/publications';
import '/imports/api/shapes/server/shapes';

import '/imports/api/slides/server/publications';
import '/imports/api/slides/server/slides';

import '/imports/api/cursor/server/publications';
import '/imports/api/cursor/server/cursor';

import '/imports/api/presentations/server/publications';
import '/imports/api/presentations/server/presentations';

// add the same for poll, deskshare TODO

import '/imports/api/index';
import '/imports/startup/server/EventQueue';
import '/imports/startup/server/helpers';
import '/imports/startup/server/logger';
import '/imports/startup/server/eventHandlers';
import '/imports/startup/server/RedisPubSub';
import '/imports/startup/server/userPermissions';

import '/imports/startup/server/meteorMethods/deletePrivateChatMessages';
import '/imports/startup/server/meteorMethods/kickUser';
import '/imports/startup/server/meteorMethods/listenOnlyRequestToggle';
import '/imports/startup/server/meteorMethods/muteUser';
import '/imports/startup/server/meteorMethods/publishSwitchToNextSlideMessage';
import '/imports/startup/server/meteorMethods/publishSwitchToPreviousSlideMessage';
import '/imports/startup/server/meteorMethods/publishVoteMessage';
import '/imports/startup/server/meteorMethods/sendChatMessagetoServer';
import '/imports/startup/server/meteorMethods/setUserPresenter';
import '/imports/startup/server/meteorMethods/unmuteUser';
import '/imports/startup/server/meteorMethods/userLogout';
import '/imports/startup/server/meteorMethods/userSetEmoji';
import '/imports/startup/server/meteorMethods/validateAuthToken';
