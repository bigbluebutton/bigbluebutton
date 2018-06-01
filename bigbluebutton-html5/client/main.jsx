/* eslint no-unused-vars: 0 */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { log } from '/imports/ui/services/api';
import renderRoutes from '/imports/startup/client/routes';

Meteor.startup(() => {
  render(renderRoutes(), document.getElementById('app'));

  // Log all uncaught exceptions to the server
  // TODO: There is no StackTrace on the ErrorEvent object
  window.addEventListener('error', (e) => {
    log('error', e);
  });

  document.title = Meteor.settings.public.app.clientTitle;
});
