import styled from 'styled-components';
import { jumboPaddingY } from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, headingsFontWeight} from '/imports/ui/stylesheets/styled-components/typography';
import { colorGray } from '/imports/ui/stylesheets/styled-components/palette';

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${jumboPaddingY};
`;

const Title = styled.h1`
  font-size: ${fontSizeBase};
  color: ${colorGray};
  font-weight: ${headingsFontWeight};
  margin: 0;
`;

const LeftWrapper = styled.div`
  & > div {
    display: flex;
  }
`;

export default {
  Header,
  Title,
  LeftWrapper,
};
