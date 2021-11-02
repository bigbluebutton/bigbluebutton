const audioTest = require('./audio/audio.obj');
const breakoutTest = require('./breakout/breakout.obj');
const chatTest = require('./chat/chat.obj');
const customParametersTest = require('./customparameters/customparameters.obj');
const notificationsTest = require('./notifications/notifications.obj');
const pollingTest = require('./polling/polling.obj');
const presentationTest = require('./presentation/presentation.obj');
const screenShareTest = require('./screenshare/screenshare.obj');
const sharedNotesTest = require('./sharednotes/sharednotes.obj');
const stressTest = require('./stress/stress.obj');
const userTest = require('./user/user.obj');
const virtualizedListTest = require('./virtualizedlist/virtualizedlist.obj');
const webcamTest = require('./webcam/webcam.obj');
const whiteboardTest = require('./whiteboard/whiteboard.obj');

process.setMaxListeners(Infinity);

describe('Audio', audioTest);
describe('Chat', chatTest);
describe('Breakout', breakoutTest);
describe('Custom Parameters', customParametersTest);
describe('Notifications', notificationsTest);
describe('Polling', pollingTest);
describe('Presentation', presentationTest);
describe('Screen Share', screenShareTest);
describe('Shared Notes ', sharedNotesTest);
describe('User', userTest);
describe('Virtualized List', virtualizedListTest);
describe('Webcam', webcamTest);
describe('Whiteboard', whiteboardTest);
if (process.env.STRESS_TEST === 'true') {
  describe('Stress', stressTest);
}
