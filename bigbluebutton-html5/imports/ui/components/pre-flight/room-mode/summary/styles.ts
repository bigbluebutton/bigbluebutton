import styled, { css } from 'styled-components';
import {
  colorBorder,
  colorGrayLabel,
  colorPrimary,
  colorSuccess,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  mdPaddingX,
  smPadding,
  smPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  fontSizeSmall,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';

const Settings = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  gap: ${mdPaddingX};
  text-align: start;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${smPaddingX};

  & + & {
    padding-top: ${mdPaddingX};
    border-top: 1px solid ${colorBorder};
  }
`;

// The design's legend: its icon marks the group's kind. One level below the
// summary's own title.
const GroupHeading = styled.h4`
  display: flex;
  align-items: center;
  gap: ${smPadding};
  margin: 0;
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
  font-weight: ${textFontWeight};

  & > svg {
    width: 1rem;
    height: 1rem;
    color: ${colorPrimary};
  }
`;

const Controls = styled.div<{ $locked: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${smPaddingX};

  /* Locked while the room starts, dimmed as the mode cards are. */
  ${({ $locked }) => $locked && css`
    opacity: 0.6;

    &,
    & * {
      cursor: default;
    }
  `}
`;

const AutomaticList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${smPadding};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const AutomaticItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${smPadding};
  /* Secondary text in the design, below the editable settings. */
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};

  & > svg {
    flex: 0 0 auto;
    width: 1rem;
    height: 1rem;
    margin-top: 0.125rem;
    color: ${colorSuccess};
  }
`;

export default {
  Settings,
  Group,
  GroupHeading,
  Controls,
  AutomaticList,
  AutomaticItem,
};
