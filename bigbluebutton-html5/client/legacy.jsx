import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import Legacy from '/imports/ui/components/legacy/component';

// This class is the start of the content loaded on legacy (unsupported) browsers.
// What is included here needs to be minimal and carefully considered because some
// things can't be polyfilled.

Meteor.startup(() => {
  render(
    <Legacy />,
    document.getElementById('app'),
  );
});
