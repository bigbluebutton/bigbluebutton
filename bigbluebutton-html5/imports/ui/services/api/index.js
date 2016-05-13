import {getInStorage} from '/imports/ui/components/app/service.js';

function callServer(name) {
  if (!name || !(typeof (name) === 'string' || name instanceof String) || name.length === 0 ||
    !name.trim() || /^\s*$/.test(name)) {
    console.error(`serverCall: invalid function name '${name}'`);
    return false;
  }

  const credentials = {
    meetingID: getInStorage('meetingID'),
    userID: getInStorage('userID'),
    authToken: getInStorage('authToken'),
  };

  // slice off the first element. That is the function name but we already have that.
  // the last 3 elements are a React event, an undefined object, and a JavaScript event
  const args = Array.prototype.slice.call(arguments, 1, -3);
  Meteor.call(name, credentials, ...args);
};

export {
  callServer,
};
