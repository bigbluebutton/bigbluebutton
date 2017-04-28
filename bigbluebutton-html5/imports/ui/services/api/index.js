import Auth from '/imports/ui/services/auth';

/* TODO: Will be pretty sweet if we return a promise from the callServer function */
function callServer(name) {
  if (!name || !(typeof (name) === 'string' || name instanceof String) || name.length === 0 ||
    !name.trim() || /^\s*$/.test(name)) {
    console.error(`serverCall: invalid function name '${name}'`);
    return false;
  }

  const credentials = Auth.credentials;

  // slice off the first element. That is the function name but we already have that.
  const args = Array.prototype.slice.call(arguments, 1);
  Meteor.call(name, credentials, ...args);
};

function logClient() {
  const credentials = Auth.credentials;
  const args = Array.prototype.slice.call(arguments, 0);
  const userInfo = window.navigator;

  args.push({
    systemProps: {
      language: userInfo.language,
      userAgent: userInfo.userAgent,
      screenSize: { width: screen.width, height: screen.height },
      windowSize: { width: window.innerWidth, height: window.innerHeight },
      bbbVersion: Meteor.settings.public.app.bbbServerVersion,
      location: window.location.href,
    }
  });

  const logTypeInformed = arguments.length > 1;
  const outputLog = logTypeInformed ? Array.prototype.slice.call(args, 1) : args;
  console.log("Client log: ", outputLog);

  Meteor.call('logClient',
    logTypeInformed ? args[0] : "info",
    credentials,
    outputLog
  );
};

export {
  logClient,
  callServer,
};
