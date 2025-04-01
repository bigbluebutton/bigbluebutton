// Needed for Atmosphere package RocketChat/meteor-streamer
// It is out of date and was written when Meteor contained lodash
// package. However, we now import lodash as an npm package
// in order to control versions, update flexibly, etc..
// Setting the global._ to utilize the npm lodash package is an interim fix
// and its introduction was inspired by
// https://github.com/RocketChat/meteor-streamer/issues/40#issuecomment-497627893
import { isEmpty } from 'radash';

global._ = { isEmpty };

Meteor.settings.public.packages = {
  'dynamic-import': { useLocationOrigin: true },
};
