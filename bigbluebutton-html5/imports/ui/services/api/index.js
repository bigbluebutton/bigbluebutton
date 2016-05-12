function callServer(name, ...args) {
  if (!name || name.length === 0 || !name.trim() || /^\s*$/.test(name)) {
    console.error(`serverCall: invalid function name '${name}'`);
    return false;
  }

  const credentials = {
    // meetingID: getInStorage('meetingID'),
    // userID: getInStorage('userID'),
    // authToken: getInStorage('authToken'),
  };

  Meteor.call(name, credentials, ...args);
};

export {
  callServer,
};
