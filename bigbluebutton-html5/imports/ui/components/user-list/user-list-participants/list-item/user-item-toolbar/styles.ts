import styled from 'styled-components';
import {
  colorGrayIcons,
  colorGrayUserListToolbar,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';

const ToolbarContainer = styled.div`
  border-radius: 1.5rem;
  background-color: ${colorGrayUserListToolbar};
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem 1rem;
  align-items: center;
`;

const ToolbarItem = styled.div<{ disabled?: boolean, hasText?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ hasText }) => (hasText ? colorPrimary : colorGrayIcons)};

  line-height: 1;

  ${({ disabled }) => disabled && `
    cursor: not-allowed;
  `}
`;

const MoreItems = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  cursor: pointer;
  color: ${colorGrayIcons};
`;

const Pipe = styled.span`
  display: inline-flex;
  align-items: center;
  line-height: 1;
  color: ${colorGrayIcons};
`;

export default {
  ToolbarContainer,
  ToolbarItem,
  MoreItems,
  Pipe,
};
