import Acl from '/imports/startup/acl';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';

const emptyCollection = new Mongo.Collection("emptyCollection");

const injectAclActionCheck = (name, handler) => {
  return (...args) => {
    const credentials = args[args.length - 1];
    if (!Acl.can(name, credentials)) {
      throw new Meteor.Error('acl-not-allowed', 
        `The user can't perform the action "${name}".`);
    }
    return handler(...args);
  }
};

const injectAclSubscribeCheck = (name,handler) => {
  return (...args) => {
    const credentials = args[args.length - 1];
    if (!Acl.subscribe(name, credentials)) {
      Logger.error(`acl-not-allowed, the user can't perform the subscription "${name}".`);
      return emptyCollection.find();
    }
    return handler(...credentials);
  }
};

export default mapToAcl = (name,handler) => {
  //The Meteor#methods require an object, while the Meteor#subscribe and function.
  if(handler instanceof Function){
    return injectAclSubscribeCheck(name, handler);
  }
  return Object.keys(handler).reduce((previous, current, index) => {
    previous[current] = injectAclActionCheck(name[index], handler[current]);
    return previous;
  }, {})
};
  