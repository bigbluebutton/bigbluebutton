import styled from 'styled-components';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import {
  colorWhite,
  btnDefaultColor,
  colorGrayUserListToolbarTranslucent,
  listItemBgHover,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';
import { activeEntryBadge } from '/imports/ui/components/common/bar-overflow/styles';
import { ACTIONS_BAR_OVERFLOW_BUTTON_SIZE } from '../service';

// BBButton doubles the class of its own color rules and qualifies its hover further, so these
// selectors repeat it more to stay ahead of them.
const OverflowButton = styled(BBButton)<{ $hasActiveEntry?: boolean }>`
  &&& {
    position: relative;
    width: 2rem;
    height: 3rem;
    aspect-ratio: auto;
    border-radius: 3rem;
    color: ${colorWhite};
    background-color: ${colorGrayUserListToolbarTranslucent};

    ${ACTIONS_BAR_OVERFLOW_BUTTON_SIZE === 'md' && `
      width: calc(2.5rem * 2 / 3);
      height: 2.5rem;
    `}
  }

  &&&&:is(:hover, :active) {
    color: ${btnDefaultColor};
    background-color: ${listItemBgHover};
  }

  &&&:disabled {
    opacity: .65;
  }

  ${activeEntryBadge}

  i {
    width: 1em;
    height: 1em;
    font-size: ${ACTIONS_BAR_OVERFLOW_BUTTON_SIZE === 'md' ? `calc(${fontSizeBase} * .85 * 1.25)` : `calc(${fontSizeBase} * 1.25)`};
  }
`;

const OverflowBackButton = styled(OverflowButton)`
  i {
    [dir="rtl"] & {
      transform: scale(-1, 1);
    }
  }
`;

export default {
  OverflowButton,
  OverflowBackButton,
};
