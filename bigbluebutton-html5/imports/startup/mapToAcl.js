import Acl from '/imports/startup/acl';
import { Meteor } from 'meteor/meteor';

const injectAclActionCheck = (name, handler) => (
  (...args) => {
    const credentials = args[0];
    if (!Acl.can(name, credentials)) {
      throw new Meteor.Error(
        'acl-not-allowed',
        `The user can't perform the action "${name}".`,
      );
    }

    return handler(...args);
  }
);

const injectAclSubscribeCheck = (name, handler) => (
  (...args) => {
    const credentials = args[args.length - 1];
    if (!Acl.can(name, ...credentials)) {
      throw new Meteor.Error(`acl-not-allowed, the user can't perform the subscription "${name}".`);
    }

    return handler(...credentials);
  }
);

const mapToAcl = (name, handler) => {
  // The Meteor#methods require an object, while the Meteor#subscribe an function.
  if (handler instanceof Function) {
    return injectAclSubscribeCheck(name, handler);
  }

  return Object.keys(handler).reduce((previous, current, index) => {
    const newPrevious = previous;
    newPrevious[current] = injectAclActionCheck(name[index], handler[current]);
    return newPrevious;
  }, {});
};

export default mapToAcl;
