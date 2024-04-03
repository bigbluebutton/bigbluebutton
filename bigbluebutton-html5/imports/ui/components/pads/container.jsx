import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Pad from './component';
import Service from './service';
import SessionsService from './sessions/service';
import PadContainerGraphql from './pads-graphql/component';

const Container = ({ ...props }) => <Pad {...props} />;

withTracker((props) => {
  const {
    externalId,
    hasPermission,
  } = props;

  const hasPad = Service.hasPad(externalId);
  const hasSession = SessionsService.hasSession(externalId);

  if (hasPad && !hasSession && hasPermission) {
    Service.createSession(externalId);
  }

  return {
    hasSession,
  };
})(Container);

export default PadContainerGraphql;
