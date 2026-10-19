import styled from 'styled-components';
import { colorGrayLighter, colorGrayLightest } from '/imports/ui/stylesheets/styled-components/palette';
import { borderSize, smPaddingX, smPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, fontSizeSmaller } from '/imports/ui/stylesheets/styled-components/typography';

const Section = styled.section`
  margin-top: ${smPaddingY};
  padding-top: ${smPaddingY};
  border-top: ${borderSize} solid ${colorGrayLighter};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${smPaddingX};
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: ${fontSizeBase};
`;

const Actions = styled.div`
  display: flex;
  gap: ${smPaddingY};
`;

const Scroll = styled.div`
  max-height: 45vh;
  overflow: auto;
`;

const DataTable = styled.table`
  width: 100%;
  margin-top: ${smPaddingY};
  border-collapse: collapse;
  font-size: ${fontSizeSmaller};

  caption {
    padding: ${smPaddingY} 0;
    font-weight: bold;
    text-align: start;
  }

  th,
  td {
    padding: 2px ${smPaddingX};
    border-bottom: ${borderSize} solid ${colorGrayLightest};
    text-align: start;
  }

  th {
    white-space: nowrap;
  }

  td {
    word-break: break-all;
  }
`;

export default {
  Section,
  SectionHeader,
  SectionTitle,
  Actions,
  Scroll,
  DataTable,
};
