import _ from 'lodash';
import Pads, { PadsPatches, PadsSessions, PadsUpdates } from '/imports/api/pads';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import { patch } from '@mconf/bbb-diff';

const PADS_CONFIG = Meteor.settings.public.pads;
const THROTTLE_TIMEOUT = 2000;

const getLang = () => {
  const { locale } = Settings.application;
  return locale ? locale.toLowerCase() : '';
};

const getParams = () => {
  const config = {};
  config.lang = getLang();
  config.rtl = document.documentElement.getAttribute('dir') === 'rtl';

  const params = Object.keys(config)
    .map((key) => `${key}=${encodeURIComponent(config[key])}`)
    .join('&');
  return params;
};

const getPadId = (externalId) => makeCall('getPadId', externalId);

const createGroup = (externalId, model, name) => makeCall('createGroup', externalId, model, name);

const hasPad = (externalId) => {
  const pad = Pads.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    },
  );

  return pad !== undefined;
};

const createSession = (externalId) => makeCall('createSession', externalId);

const throttledCreateSession = _.throttle(createSession, THROTTLE_TIMEOUT, {
  leading: true,
  trailing: false,
});

const buildPadURL = (padId) => {
  if (padId) {
    const padsSessions = PadsSessions.findOne({});
    if (padsSessions && padsSessions.sessions) {
      const params = getParams();
      const sessionIds = padsSessions.sessions.map(session => Object.values(session)).join(',');
      const url = Auth.authenticateURL(`${PADS_CONFIG.url}/auth_session?padName=${padId}&sessionID=${sessionIds}&${params}`);
      return url;
    }
  }

  return null;
};

const getRev = (externalId) => {
  const updates = PadsUpdates.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { rev: 1 } },
  );

  return updates ? updates.rev : 0;
};

const getPadTail = (externalId) => {
  const updates = PadsUpdates.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { tail: 1 } },
  );

  if (updates && updates.tail) return updates.tail;

  return '';
};

const PadsContent = new Mongo.Collection(null);

const getPadContent = (externalId) => {
  const content = PadsContent.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { content: 1 } },
  );

  if (content && content.content) return content.content;

  return '';
};

const setPadContent = (externalId) => {
  makeCall('getPadContent', externalId).then((payload) => {
    if (!payload) return;

    const { content, contentLastUpdatedAt } = payload;
    const selector = { meetingId: Auth.meetingID, externalId };
    const modifier = {
      $set: {
        content,
        contentLastUpdatedAt,
      },
    };

    PadsContent.upsert(selector, modifier);
  });
};

const getPadLastUpdate = (externalId) => {
  const content = PadsContent.findOne(
    {
      meetingId: Auth.meetingID,
      externalId,
    }, { fields: { contentLastUpdatedAt: 1 } },
  );

  if (content && content.contentLastUpdatedAt) return content.contentLastUpdatedAt;

  return 0;
};

const padPatchWatcher = () => {
  const query = PadsPatches.find({});

  query.observe({
    added: (patchDoc) => {
      const { meetingId, externalId, start, end, text, timestamp: patchTimestamp } = patchDoc;
      const padContent = getPadContent(externalId);
      const padLastUpdate = getPadLastUpdate(externalId);

      if (patchTimestamp < padLastUpdate) return;

      PadsContent.upsert({ meetingId, externalId }, {
        $set: {
          content: patch(padContent, { start, end, text }),
          contentLastUpdatedAt: patchTimestamp,
        },
      });
    },
  });
}

const padContentSetter = (comp) => {
  const { connected } = Meteor.status();
  const { loggedIn, meetingID } = Auth;
  const ready = Session.get('subscriptionsReady');
  const externalIds = Pads.find(
    {
      meetingId: meetingID,
    },
    {
      fields: { externalId: 1 },
    },
  ).fetch().map((doc) => doc.externalId);

  if (connected && loggedIn && ready) {
    externalIds.forEach((externalId, index) => {
      setPadContent(externalId);

      if (index === externalIds.length - 1 && comp) comp.stop();
    });
  }
};

export default {
  getPadId,
  createGroup,
  hasPad,
  createSession: (externalId) => throttledCreateSession(externalId),
  buildPadURL,
  getRev,
  getPadTail,
  getPadContent,
  getParams,
  padPatchWatcher,
  padContentSetter,
};
