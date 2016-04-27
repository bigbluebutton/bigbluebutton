
export function initializeCursor(meetingId) {
  return Meteor.Cursor.upsert({
    meetingId: meetingId,
  }, {
    meetingId: meetingId,
    x: 0,
    y: 0,
  }, (err, numChanged) => {
    if (err) {
      return Meteor.log.error(`err upserting cursor for ${meetingId}`);
    } else {
      // Meteor.log.info "ok upserting cursor for #{meetingId}"
    }
  });
};

export function updateCursorLocation(meetingId, cursorObject) {
  return Meteor.Cursor.update({
    meetingId: meetingId,
  }, {
    $set: {
      x: cursorObject.x,
      y: cursorObject.y,
    },
  }, (err, numChanged) => {
    if (err != null) {
      return Meteor.log.error(`_unsucc update of cursor for ${meetingId} ${JSON.stringify(cursorObject)} err=${JSON.stringify(err)}`);
    } else {
      // Meteor.log.info "updated cursor for #{meetingId} #{JSON.stringify cursorObject}"
    }
  });
};

// called on server start and meeting end
export function clearCursorCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Meteor.Cursor.remove({
      meetingId: meetingId,
    }, () => {
      return Meteor.log.info(`cleared Cursor Collection (meetingId: ${meetingId})!`);
    });
  } else {
    return Meteor.Cursor.remove({}, () => {
      return Meteor.log.info('cleared Cursor Collection (all meetings)!');
    });
  }
};
