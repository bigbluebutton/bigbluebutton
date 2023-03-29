const config = require('../../config');

const EXPORT_STATUSES = Object.freeze({
  COLLECTING: 'COLLECTING',
  PROCESSING: 'PROCESSING',
});

class PresAnnStatusMsg {
  constructor(exportJob, status = EXPORT_STATUSES.COLLECTING) {
    this.message = {
      envelope: {
        name: config.log.msgName,
        routing: {
          sender: exportJob.module,
        },
        timestamp: (new Date()).getTime(),
      },
      core: {
        header: {
          name: config.log.msgName,
          meetingId: exportJob.parentMeetingId,
          userId: '',
        },
        body: {
          presId: exportJob.presId,
          pageNumber: 1,
          totalPages: JSON.parse(exportJob.pages).length,
          status,
          error: false,
        },
      },
    };
  }

  build = (pageNumber = 1) => {
    this.message.core.body.pageNumber = pageNumber;
    this.message.envelope.timestamp = (new Date()).getTime();
    const event = JSON.stringify(this.message);
    this.message.core.body.error = false;
    return event;
  };

  setError = (error = true) => {
    this.message.core.body.error = error;
  };

  setStatus = (status) => {
    this.message.core.body.status = status;
  };

  static get EXPORT_STATUSES() {
    return EXPORT_STATUSES;
  }
};

class NewPresAnnFileAvailableMsg {
  constructor(exportJob, link) {
    this.message = {
      envelope: {
        name: config.notifier.msgName,
        routing: {
          sender: exportJob.module,
        },
        timestamp: (new Date()).getTime(),
      },
      core: {
        header: {
          name: config.notifier.msgName,
          meetingId: exportJob.parentMeetingId,
          userId: '',
        },
        body: {
          fileURI: link,
          presId: exportJob.presId,
        },
      },
    };
  }

  build = () => {
    return JSON.stringify(this.message);
  };
};

module.exports = {
  PresAnnStatusMsg,
  NewPresAnnFileAvailableMsg,
};
