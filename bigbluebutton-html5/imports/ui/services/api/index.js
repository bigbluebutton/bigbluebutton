import Auth from '/imports/ui/services/auth';

/* TODO: Will be pretty sweet if we return a promise from the callServer function */
function callServer(name) {
  if (!name || !(typeof (name) === 'string' || name instanceof String) || name.length === 0 ||
    !name.trim() || /^\s*$/.test(name)) {
    console.error(`serverCall: invalid function name '${name}'`);
    return false;
  }

  const credentials = Auth.getCredentials();

  // slice off the first element. That is the function name but we already have that.
  const args = Array.prototype.slice.call(arguments, 1);
  Meteor.call(name, credentials, ...args);
};

export {
  callServer,
};
