'use strict';

let Page = require('./page');
let pageObject = new Page();
let chai = require('chai');

class HomePage extends Page {
  login(username, meeting) {
    super.open('demo/demoHTML5.jsp?username=' + username + '&meetingname=' + meeting.replace(/\s+/g, '+') + '&action=create');
  }
}

module.exports = new HomePage();

