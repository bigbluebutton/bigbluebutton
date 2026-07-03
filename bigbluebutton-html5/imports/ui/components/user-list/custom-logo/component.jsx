import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';

const messages = defineMessages({
  customLogoAlt: {
    id: 'app.userList.customLogoAlt',
    defaultMessage: 'Custom branding logo',
  },
});

const CustomLogo = ({ CustomLogoUrl }) => {
  const intl = useIntl();
  return (
    <div>
      <Styled.Branding data-test="brandingArea">
        <img src={CustomLogoUrl} alt={intl.formatMessage(messages.customLogoAlt)} />
      </Styled.Branding>
      <Styled.Separator />
    </div>
  );
};

export default CustomLogo;
