import styled from 'styled-components';
import {
  colorBlueAux,
  colorPrimary,
} from '/imports/ui/stylesheets/styled-components/palette';
import { contentSidebarPadding } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, fontSizeLarger } from '/imports/ui/stylesheets/styled-components/typography';

// Covers the whole chat panel content. pointer-events: none keeps the drag
// events on the panel underneath, which is what tracks enter/leave/drop.
const Overlay = styled.div`
  position: absolute;
  inset: ${contentSidebarPadding};
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 1rem;
  border: 2px dashed ${colorPrimary};
  border-radius: 1rem;
  background-color: ${colorBlueAux};
  color: ${colorPrimary};
  text-align: center;
  pointer-events: none;
`;

const Title = styled.p`
  margin: 0 0 0.25rem;
  font-size: ${fontSizeLarger};
  font-weight: 600;
`;

const Detail = styled.p`
  margin: 0;
  font-size: ${fontSizeBase};
`;

export default {
  Overlay,
  Title,
  Detail,
};
