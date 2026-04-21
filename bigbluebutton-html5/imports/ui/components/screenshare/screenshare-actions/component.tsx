import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import BBBMenu from '/imports/ui/components/common/menu/component';
import { SET_SCREENSHARE_SHOW_AS_CONTENT } from '/imports/ui/core/graphql/mutations/screenshareMutations';

const intlMessages = defineMessages({
  showAsContentLabel: {
    id: 'app.screenshare.showAsContentLabel',
    defaultMessage: 'Show as main content',
  },
  moveToThumbnailLabel: {
    id: 'app.screenshare.moveToThumbnailLabel',
    defaultMessage: 'Move to thumbnail',
  },
});

interface ScreenshareActionsProps {
  streamId: string;
  showAsContent: boolean;
}

const ScreenshareActions: React.FC<ScreenshareActionsProps> = ({ streamId, showAsContent }) => {
  const intl = useIntl();
  const [setShowAsContent] = useMutation(SET_SCREENSHARE_SHOW_AS_CONTENT);

  const label = showAsContent
    ? intl.formatMessage(intlMessages.moveToThumbnailLabel)
    : intl.formatMessage(intlMessages.showAsContentLabel);

  const actions = [{
    key: `screenshare-toggle-${streamId}`,
    label,
    description: label,
    onClick: () => setShowAsContent({ variables: { streamId, showAsContent: !showAsContent } }),
    dataTest: showAsContent ? 'screenshareMoveToThumbnailBtn' : 'screenshareShowAsContentBtn',
  }];

  return (
    <div
      style={{
        position: 'absolute',
        top: 4,
        right: 4,
        zIndex: 100,
      }}
    >
      <BBBMenu
        trigger={(
          <button
            type="button"
            aria-label={label}
            data-test="screenshareActionsBtn"
            style={{
              background: 'rgba(0,0,0,0.65)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: 22,
              height: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ⋮
          </button>
        )}
        actions={actions}
        opts={{
          container: document.body,
        }}
      />
    </div>
  );
};

export default ScreenshareActions;
