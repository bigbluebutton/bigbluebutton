import styled from 'styled-components';
import { colorGrayLabel } from '/imports/ui/stylesheets/styled-components/palette';
import {
  settingsItemGap,
  settingsSectionGap,
  settingsTitleGap,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${settingsSectionGap};
`;

const Section = styled(Sections)`
  gap: ${settingsTitleGap};
`;

const Group = styled(Sections)`
  gap: ${settingsItemGap};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${settingsItemGap};
`;

const Col = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
`;

const Label = styled.span`
  color: ${colorGrayLabel};
  font-size: ${fontSizeBase};
`;

export default {
  Sections,
  Section,
  Group,
  Row,
  Col,
  Label,
};
