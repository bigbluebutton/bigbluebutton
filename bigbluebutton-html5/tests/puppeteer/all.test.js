const audioTest = require('./audio.obj');
const chatTest = require('./chat.obj');
const breakoutTest = require('./breakout.obj');
const customParametersTest = require('./customparameters.obj');
const notificationsTest = require('./notifications.obj');
const presentationTest = require('./presentation.obj');
const screenShareTest = require('./screenshare.obj');
const sharedNotesTest = require('./sharednotes.obj');
const userTest = require('./user.obj');
const virtualizedListTest = require('./virtualizedlist.obj');
const webcamTest = require('./webcam.obj');
const whiteboardTest = require('./whiteboard.obj');

process.setMaxListeners(Infinity);

describe('Audio', audioTest);
describe('Chat', chatTest);
describe('Breakout', breakoutTest);
describe('Custom Parameters', customParametersTest);
describe('Notifications', notificationsTest);
describe('Presentation', presentationTest);
describe('Screen Share', screenShareTest);
describe('Shared Notes ', sharedNotesTest);
describe('User', userTest);
describe('Virtualized List', virtualizedListTest);
describe('Webcam', webcamTest);
describe('Whiteboard', whiteboardTest);
