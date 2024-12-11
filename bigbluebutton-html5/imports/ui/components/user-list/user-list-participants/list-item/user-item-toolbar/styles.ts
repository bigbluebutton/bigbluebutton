import styled from 'styled-components';
import { colorGrayIcons, colorGrayUserListToolbar } from '/imports/ui/stylesheets/styled-components/palette';

const ToolbarContainer = styled.div`
  border-radius: 1.5rem;
  background-color: ${colorGrayUserListToolbar};
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem 1rem;
  align-items: center;
`;

const ToolbarItem = styled.div`
  cursor: pointer;
  color: ${colorGrayIcons};
`;

const MoreItems = styled.div`
  cursor: pointer;
  color: ${colorGrayIcons};
`;

const Pipe = styled.span`
  color: ${colorGrayIcons};
`;

export default {
  ToolbarContainer,
  ToolbarItem,
  MoreItems,
  Pipe,
};
