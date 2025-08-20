import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import {
  HAS_PAD_SUBSCRIPTION,
  HasPadSubscriptionResponse,
  PAD_SESSION_SUBSCRIPTION,
  PadSessionSubscriptionResponse,
} from './queries';
import { CREATE_SESSION } from './mutations';
import Service from './service';
import Styled from './styles';
import PadContent from './content/component';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

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
  isRTL: boolean;
}

interface PadGraphqlProps extends PadContainerGraphqlProps {
  hasSession: boolean;
  sessionIds: Array<string>;
  padId: string | undefined;
}

const PadGraphql: React.FC<PadGraphqlProps> = (props) => {
  const {
    externalId,
    hasSession,
    isResizing,
    isRTL,
    sessionIds,
    padId,
    hasPermission,
  } = props;
  const [padURL, setPadURL] = useState<string | undefined>();
  const intl = useIntl();

  useEffect(() => {
    if (!padId) {
      setPadURL(undefined);
      return;
    }
    setPadURL(Service.buildPadURL(padId, sessionIds));
  }, [isRTL, hasSession, intl.locale]);

  if (!hasPermission) {
    return <PadContent externalId={externalId} />;
  }
  if (!hasSession || !padURL) return null;
  return (
    <Styled.Pad>
      <Styled.IFrame
        title="pad"
        src={padURL}
        aria-describedby="padEscapeHint"
        style={{
          pointerEvents: isResizing ? 'none' : 'inherit',
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
  } = props;

  const { data: hasPadData } = useDeduplicatedSubscription<HasPadSubscriptionResponse>(
    HAS_PAD_SUBSCRIPTION,
    { variables: { externalId } },
  );
  const { data: padSessionData } = useDeduplicatedSubscription<PadSessionSubscriptionResponse>(
    PAD_SESSION_SUBSCRIPTION,
  );
  const [createSession] = useMutation(CREATE_SESSION);

  const sessionData = padSessionData?.sharedNotes_session ?? [];
  const session = sessionData.find((s) => s.sharedNotesExtId === externalId);
  const hasPad = !!hasPadData && hasPadData.sharedNotes.length > 0;
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
      sessionIds={Array.from(sessionIds)}
      padId={session?.sharedNotes?.padId}
      hasPermission={hasPermission}
    />
  );
};

export default PadContainerGraphql;
