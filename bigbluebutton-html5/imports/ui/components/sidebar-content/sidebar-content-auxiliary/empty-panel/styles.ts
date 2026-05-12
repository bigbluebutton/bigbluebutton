import styled from 'styled-components';
import {
  colorPrimary,
  colorNeutral2,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  headingsFontWeight,
  fontSizeBase,
  fontSizeLarger,
} from '/imports/ui/stylesheets/styled-components/typography';
import {
  jumboPaddingY,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import {
  PanelContent as BasePanelContent,
} from '/imports/ui/components/sidebar-content/styles';
import IconB from '/imports/ui/components/common/icon/icon-ts/component';

const PanelContent = styled(BasePanelContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${jumboPaddingY};
  padding: ${jumboPaddingY};
  flex-grow: 1;
  text-align: center;
`;

const WrapText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${mdPaddingX};
  align-items: center;
`;

const BodyTitle = styled.h2`
  font-size: ${fontSizeLarger};
  font-weight: ${headingsFontWeight};
  margin: 0;
`;

const BodyDescription = styled.p`
  font-size: ${fontSizeBase};
  margin: 0;
  color: inherit;
  color: ${colorNeutral2};
`;

const Icon = styled(IconB)`
  font-size: 3rem;
  color: ${colorPrimary};
`;

export default {
  PanelContent,
  WrapText,
  BodyTitle,
  BodyDescription,
  Icon,
};
