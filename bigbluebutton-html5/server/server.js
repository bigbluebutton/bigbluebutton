import '/imports/startup/server/index';
import '/imports/startup/server/collection_methods/chat';
import '/imports/startup/server/collection_methods/cursor';
import '/imports/startup/server/collection_methods/meetings';
import '/imports/startup/server/collection_methods/poll';
import '/imports/startup/server/collection_methods/presentations';
import '/imports/startup/server/collection_methods/shapes';
import '/imports/startup/server/collection_methods/slides';
import '/imports/startup/server/collection_methods/users';
import '/imports/startup/server/methods/deletePrivateChatMessages';
import '/imports/startup/server/methods/kickUser';
import '/imports/startup/server/methods/listenOnlyRequestToggle';
import '/imports/startup/server/methods/muteUser';
import '/imports/startup/server/methods/publishSwitchToNextSlideMessage';
import '/imports/startup/server/methods/publishSwitchToPreviousSlideMessage';
import '/imports/startup/server/methods/publishVoteMessage';
import '/imports/startup/server/methods/sendChatMessagetoServer';
import '/imports/startup/server/methods/setUserPresenter';
import '/imports/startup/server/methods/unmuteUser';
import '/imports/startup/server/methods/userLogout';
import '/imports/startup/server/methods/userSetEmoji';
import '/imports/startup/server/methods/validateAuthToken';
import '/imports/startup/server/EventQueue';
import '/imports/startup/server/helpers';
import '/imports/startup/server/logger';
import '/imports/startup/server/publish';
import '/imports/startup/server/redispubsub';
import '/imports/startup/server/redispubsub2';
import '/imports/startup/server/user_permissions';



// import { redisPubSub } from '/imports/startup/server/index';
// console.log("in server I check if I can publish", redisPubSub.constructor());
