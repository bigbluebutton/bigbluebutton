import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import { safeMatch, uniqueId } from '/imports/utils/string-utils';
import { isUrlValid } from '/imports/ui/components/external-video-player/service';
import Styled from './styles';
import Dropdown from '/imports/ui/components/dropdown/component';

const intlMessages = defineMessages({
  externalVideo: {
    id: 'app.smartMediaShare.externalVideo',
  },
});

const createAction = (url, startWatching) => {
  const hasHttps = url?.startsWith('https://');
  const finalUrl = hasHttps ? url : `https://${url}`;
  const label = hasHttps ? url?.replace('https://', '') : url;

  if (!isUrlValid(finalUrl)) return null;

  return (
    <Dropdown.DropdownListItem
      label={label}
      key={uniqueId('quick-external-video-item')}
      onClick={() => {
        startWatching(finalUrl);
      }}
    />
  );
};

export const SmartMediaShare = ({
  currentSlide = undefined,
  intl,
  startWatching,
}) => {
  const linkPatt = /(https?:\/\/.*?)(?=\s|$)/g;
  const externalLinks = safeMatch(linkPatt, currentSlide?.content?.replace(/[\r\n]/g, '  '), false);
  if (!externalLinks) return null;

  const actions = [];

  externalLinks?.forEach((l) => {
    const action = createAction(l, startWatching);
    if (action) actions.push(action);
  });

  if (actions?.length === 0) return null;

  return (
    <Dropdown>
      <Dropdown.DropdownTrigger tabIndex={0}>
        <Styled.QuickVideoButton
          role="button"
          label={intl.formatMessage(intlMessages.externalVideo)}
          color="primary"
          circle
          icon="external-video"
          size="md"
          onClick={() => null}
          hideLabel
        />
      </Dropdown.DropdownTrigger>
      <Dropdown.DropdownContent>
        <Dropdown.DropdownList>
          {actions}
        </Dropdown.DropdownList>
      </Dropdown.DropdownContent>
    </Dropdown>
  );
};

export default SmartMediaShare;

SmartMediaShare.propTypes = {
  currentSlide: PropTypes.shape({
    content: PropTypes.string.isRequired,
  }),
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};
