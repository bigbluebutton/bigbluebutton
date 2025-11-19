import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import {
  PAD_SESSION_SUBSCRIPTION,
  PadSessionSubscriptionResponse,
} from './queries';
import { CREATE_SESSION } from './mutations';
import Service from './service';
import Styled from './styles';
import PadContent from './content/component';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useNotesLastRead from '/imports/ui/components/notes/hooks/useNotesLastRead';

const intlMessages = defineMessages({
  hint: {
    id: 'app.pads.hint',
    description: 'Label for hint on how to escape iframe',
  },
});

interface PadContainerGraphqlProps {
  externalId: string;
  hasPermission: boolean;
  isResizing: boolean;
  isLocalChange: boolean;
  isRTL: boolean;
  amIPresenter: boolean;
  isOnMediaArea?: boolean;
}

interface PadGraphqlProps extends PadContainerGraphqlProps {
  hasSession: boolean;
  sessionIds: Array<string>;
  padId: string | undefined;
  amIPresenter: boolean;
  isOnMediaArea: boolean;
}

const PadGraphql: React.FC<PadGraphqlProps> = (props) => {
  const {
    externalId,
    hasSession,
    isResizing,
    isLocalChange,
    isRTL,
    sessionIds,
    padId,
    amIPresenter,
    isOnMediaArea,
    hasPermission,
  } = props;
  const [padURL, setPadURL] = useState<string | undefined>();
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const intl = useIntl();
  const { markNotesAsRead } = useNotesLastRead();

  useEffect(() => {
    if (!padId) {
      setPadURL(undefined);
      return;
    }
    setPadURL(Service.buildPadURL(padId, sessionIds));
  }, [isRTL, hasSession, intl.locale]);

  useEffect(() => {
    if (!hasSession || !padId) return () => {};
    return () => {
      if (hasLoaded) {
        markNotesAsRead();
      }
    };
  }, [hasSession, padId, hasLoaded]);

  if (!hasPermission) {
    return <PadContent externalId={externalId} isOnMediaArea={isOnMediaArea} />;
  }
  if (!hasSession || !padURL) return null;
  return (
    <Styled.Pad>
      <Styled.IFrame
        title="pad"
        src={padURL}
        aria-describedby="padEscapeHint"
        amIPresenter={amIPresenter}
        preventInteraction={isResizing && isLocalChange}
        onLoad={() => {
          setHasLoaded(true);
          markNotesAsRead();
        }}
      />
      <Styled.Hint
        id="padEscapeHint"
        aria-hidden
      >
        {intl.formatMessage(intlMessages.hint)}
      </Styled.Hint>
    </Styled.Pad>
  );
};

const PadContainerGraphql: React.FC<PadContainerGraphqlProps> = (props) => {
  const {
    externalId,
    hasPermission,
    isRTL,
    isResizing,
    isLocalChange,
    amIPresenter,
    isOnMediaArea = false,
  } = props;

  const { data: meeting } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));
  const { data: padSessionData } = useDeduplicatedSubscription<PadSessionSubscriptionResponse>(
    PAD_SESSION_SUBSCRIPTION,
  );
  const [createSession] = useMutation(CREATE_SESSION);

  const sessionData = padSessionData?.sharedNotes_session ?? [];
  const session = sessionData.find((s) => s.sharedNotesExtId === externalId);
  const hasPad = meeting?.componentsFlags?.hasSharedNotes;
  const hasSession = session?.sessionId !== undefined;
  const sessionIds = new Set<string>(sessionData.map((s) => s.sessionId));

  useEffect(() => {
    if (hasPad && !hasSession && hasPermission) {
      createSession({ variables: { externalId } });
    }
  }, [hasPad, hasSession, hasPermission]);

  return (
    <PadGraphql
      hasSession={hasSession}
      externalId={externalId}
      isRTL={isRTL}
      isResizing={isResizing}
      isLocalChange={isLocalChange}
      sessionIds={Array.from(sessionIds)}
      padId={session?.sharedNotes?.padId}
      amIPresenter={amIPresenter}
      isOnMediaArea={isOnMediaArea}
      hasPermission={hasPermission}
    />
  );
};

export default PadContainerGraphql;
