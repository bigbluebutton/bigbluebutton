import React, { useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import getBaseUrl from '/imports/ui/core/utils/getBaseUrl';
import Auth from '/imports/ui/services/auth';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';
import Styled from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.mobileAppModal.title',
    description: 'App modal title',
  },
  description: {
    id: 'app.mobileAppModal.description',
    description: 'App modal description',
  },
  openStore: {
    id: 'app.mobileAppModal.openStore',
    defaultMessage: new Date().getFullYear().toString(),
    description: 'Open Store button label',
  },
  openApp: {
    id: 'app.mobileAppModal.openApp',
    description: 'Open App button label',
  },
  obtainUrlMsg: {
    id: 'app.mobileAppModal.obtainUrlMsg',
    description: 'Obtain URL message',
  },
  obtainUrlErrorMsg: {
    id: 'app.mobileAppModal.obtainUrlErrorMsg',
    description: 'Obtain URL error message',
  },
  dismissLabel: {
    id: 'app.mobileAppModal.dismissLabel',
    description: 'Dismiss button label',
  },
  dismissDesc: {
    id: 'app.mobileAppModal.dismissDesc',
    description: 'adds descriptive context to dissmissLabel',
  },
});

interface MobileAppModalGraphqlContainerProps {
  isOpen: boolean,
  onRequestClose: () => void,
  priority: string,
}

interface MobileAppModalGraphqlProps extends MobileAppModalGraphqlContainerProps {
  meetingName: string;
  sessionToken: string;
}

const MobileAppModalGraphql: React.FC<MobileAppModalGraphqlProps> = (props) => {
  const {
    meetingName,
    sessionToken,
    isOpen,
    onRequestClose,
    priority,
  } = props;
  const [url, setUrl] = useState('');
  const [urlMessage, setUrlMessage] = useState('');
  const intl = useIntl();

  const BBB_TABLET_APP_CONFIG = window.meetingClientSettings.public.app.bbbTabletApp;

  useEffect(() => {
    const url = `${getBaseUrl()}/api/getJoinUrl?sessionToken=${sessionToken}`;
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    setUrlMessage(intl.formatMessage(intlMessages.obtainUrlMsg));
    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          return Promise.reject();
        }
        return response.json();
      })
      .then((messages) => {
        setUrl(messages.response.url);
        setUrlMessage('');
      })
      .catch(() => {
        setUrlMessage(intl.formatMessage(intlMessages.obtainUrlErrorMsg));
      });
  }, []);

  return (
    <ModalSimple
      title={intl.formatMessage(intlMessages.title)}
      dismiss={{
        label: intl.formatMessage(intlMessages.dismissLabel),
        description: intl.formatMessage(intlMessages.dismissDesc),
      }}
      {...{
        isOpen,
        onRequestClose,
        priority,
      }}
    >
      <Styled.Center>
        {`${intl.formatMessage(intlMessages.description)}`}

        <Styled.ButtonContainer>
          <Button
            color="primary"
            disabled={url === ''}
            label={intl.formatMessage(intlMessages.openApp)}
            onClick={() => {
              window.open(
                `${
                  BBB_TABLET_APP_CONFIG.iosAppUrlScheme
                }://${encodeURIComponent(meetingName)}/${encodeURIComponent(
                  url,
                )}`,
                '_blank',
              );
            }}
            role="button"
            size="lg"
          />
          {urlMessage !== '' ? (
            <Styled.UrlMessage>{urlMessage}</Styled.UrlMessage>
          ) : null}
        </Styled.ButtonContainer>

        {BBB_TABLET_APP_CONFIG.iosAppStoreUrl === '' ? null : (
          <Styled.ButtonContainer>
            <Button
              color="default"
              label={intl.formatMessage(intlMessages.openStore)}
              onClick={() => window.open(`${BBB_TABLET_APP_CONFIG.iosAppStoreUrl}`, '_blank')}
              role="button"
              size="lg"
            />
          </Styled.ButtonContainer>
        )}
      </Styled.Center>
    </ModalSimple>
  );
};

const MobileAppModalGraphqlContainer: React.FC<MobileAppModalGraphqlContainerProps> = ({
  isOpen,
  onRequestClose,
  priority,
}) => {
  /* eslint no-underscore-dangle: "off" */
  // @ts-ignore Due to Meteor legacy reasons
  const sessionToken = useReactiveVar(Auth._sessionToken) as string;
  const { loading, data: currentMeeting } = useMeeting((m) => {
    return {
      name: m.name,
    };
  });

  if (loading || !currentMeeting) {
    return null;
  }

  return (
    <MobileAppModalGraphql
      meetingName={currentMeeting.name ?? ''}
      sessionToken={sessionToken}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      priority={priority}
    />
  );
};

export default MobileAppModalGraphqlContainer;
