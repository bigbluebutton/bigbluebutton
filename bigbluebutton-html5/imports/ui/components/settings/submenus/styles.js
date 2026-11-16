import styled from 'styled-components';
import {
  colorGrayDark,
  colorGrayLabel,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  settingsItemGap,
  settingsSectionGap,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${settingsSectionGap};
`;

const Group = styled(Section)`
  gap: ${settingsItemGap};
`;

const Title = styled.h3`
  color: ${colorGrayDark};
  margin: 0;
  font-size: ${fontSizeBase};
  font-weight: 600;
`;

const SubTitle = styled.h4`
  margin: 0;
  font-size: ${fontSizeBase};
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
  Section,
  Group,
  Title,
  SubTitle,
  Row,
  Col,
  Label,
};
