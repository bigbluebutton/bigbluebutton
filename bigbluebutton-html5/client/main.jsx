import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from '/imports/startup/client/routes';
import 'whatwg-fetch'

Meteor.startup(() => {
  window.fetch = fetch;
  console.log('não me arrependo de nada', fetch);
  render(renderRoutes(), document.getElementById('app'));
});

