Template.usersList.helpers({
  getInfoNumberOfUsers() {
    let numberUsers;
    numberUsers = BBB.getNumberOfUsers();
    if (numberUsers > 8) {
      return `Users: ${numberUsers}`;
    }

    // do not display the label if there are just a few users
  },
});

Template.usersList.rendered = function () {
  $('.userlistMenu').resizable({
    handles: 'e',
    maxWidth: 600,
    minWidth: 200,
    resize() {
      return adjustChatInputHeight();
    },
  });
  Tracker.autorun(comp => {
    setInSession('userListRenderedTime', TimeSync.serverTime());
    if (getInSession('userListRenderedTime') !== void 0) {
      return comp.stop();
    }
  });
  if (isPhone()) {
    return $('.userlistMenu').addClass('hiddenInLandscape');
  }
};
