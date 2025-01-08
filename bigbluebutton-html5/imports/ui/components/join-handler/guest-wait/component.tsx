import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { LoadingContext } from '../../common/loading-screen/loading-screen-HOC/component';
import Styled from './styles';

const REDIRECT_TIMEOUT = 15000;

export const GUEST_STATUSES = {
  ALLOW: 'ALLOW',
  DENY: 'DENY',
  WAIT: 'WAIT',
};

const intlMessages = defineMessages({
  windowTitle: {
    id: 'app.guest.windowTitle',
    description: 'tab title',
  },
  guestWait: {
    id: 'app.guest.guestWait',
    description: '',
  },
  noSessionToken: {
    id: 'app.guest.noSessionToken',
    description: '',
  },
  guestInvalid: {
    id: 'app.guest.guestInvalid',
    description: '',
  },
  allow: {
    id: 'app.guest.allow',
    description: '',
  },
  deny: {
    id: 'app.guest.guestDeny',
    description: '',
  },
  firstPosition: {
    id: 'app.guest.firstPositionInWaitingQueue',
    description: '',
  },
  position: {
    id: 'app.guest.positionInWaitingQueue',
    description: '',
  },
  calculating: {
    id: 'app.guest.calculating',
    description: '',
  },
});

function getSearchParam(name: string) {
  const params = new URLSearchParams(window.location.search);

  if (params && params.has(name)) {
    const param = params.get(name);

    return param;
  }

  return null;
}

interface GuestWaitProps {
  guestStatus: string | null;
  guestLobbyMessage: string | null;
  positionInWaitingQueue: number | null;
  logoutUrl: string;
}

const GuestWait: React.FC<GuestWaitProps> = (props) => {
  const {
    guestLobbyMessage,
    guestStatus,
    logoutUrl,
    positionInWaitingQueue,
  } = props;

  const intl = useIntl();
  const [animate, setAnimate] = useState(true);
  const [message, setMessage] = useState(intl.formatMessage(intlMessages.guestWait));
  const [positionMessage, setPositionMessage] = useState(intl.formatMessage(intlMessages.calculating));
  const lobbyMessageRef = useRef('');
  const positionInWaitingQueueRef = useRef('');
  const loadingContextInfo = useContext(LoadingContext);

  const updateLobbyMessage = useCallback((message: string | null) => {
    if (!message) {
      setMessage(intl.formatMessage(intlMessages.guestWait));
      return;
    }
    if (message !== lobbyMessageRef.current) {
      lobbyMessageRef.current = message;
      if (lobbyMessageRef.current.length !== 0) {
        setMessage(lobbyMessageRef.current);
      } else {
        setMessage(intl.formatMessage(intlMessages.guestWait));
      }
    }
  }, [intl]);

  const updatePositionInWaitingQueue = useCallback((newPositionInWaitingQueue: number) => {
    if (positionInWaitingQueueRef.current !== newPositionInWaitingQueue.toString()) {
      positionInWaitingQueueRef.current = newPositionInWaitingQueue.toString();
      if (positionInWaitingQueueRef.current === '1') {
        setPositionMessage(intl.formatMessage(intlMessages.firstPosition));
      } else {
        setPositionMessage(intl.formatMessage(intlMessages.position) + positionInWaitingQueueRef.current);
      }
    }
  }, [intl]);

  useEffect(() => {
    document.title = intl.formatMessage(intlMessages.windowTitle);
  }, []);

  useEffect(() => {
    const sessionToken = getSearchParam('sessionToken');

    if (loadingContextInfo.isLoading) {
      loadingContextInfo.setLoading(false);
    }

    if (!sessionToken) {
      setAnimate(false);
      setMessage(intl.formatMessage(intlMessages.noSessionToken));
      return;
    }

    if (!guestStatus) {
      setAnimate(false);
      setPositionMessage('');
      setMessage(intl.formatMessage(intlMessages.guestInvalid));
      return;
    }

    if (guestStatus === GUEST_STATUSES.ALLOW) {
      setPositionMessage('');
      updateLobbyMessage(intl.formatMessage(intlMessages.allow));
      setAnimate(false);
      return;
    }

    if (guestStatus === GUEST_STATUSES.DENY) {
      setAnimate(false);
      setPositionMessage('');
      setMessage(intl.formatMessage(intlMessages.deny));
      setTimeout(() => {
        window.location.assign(logoutUrl);
      }, REDIRECT_TIMEOUT);
      return;
    }

    // WAIT
    updateLobbyMessage(guestLobbyMessage || '');
    if (positionInWaitingQueue) {
      updatePositionInWaitingQueue(positionInWaitingQueue);
    }
  }, [
    guestLobbyMessage,
    guestStatus,
    logoutUrl,
    positionInWaitingQueue,
    intl,
    updateLobbyMessage,
    updatePositionInWaitingQueue,
  ]);

  return (
    <Styled.Container>
      <Styled.Content id="content">
        <Styled.Heading id="heading">{intl.formatMessage(intlMessages.windowTitle)}</Styled.Heading>
        {animate && (
          <Styled.Spinner>
            <Styled.Bounce1 />
            <Styled.Bounce2 />
            <Styled.Bounce />
          </Styled.Spinner>
        )}
        <p
          aria-live="polite"
          data-test="guestMessage"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <Styled.Position id="positionInWaitingQueue">
          <p aria-live="polite">{positionMessage}</p>
        </Styled.Position>
      </Styled.Content>
    </Styled.Container>
  );
};

export default GuestWait;
