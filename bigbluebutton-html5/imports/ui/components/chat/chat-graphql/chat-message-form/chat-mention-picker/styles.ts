import styled from 'styled-components';
import { colorGrayLightest, colorWhite } from '/imports/ui/stylesheets/styled-components/palette';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';
import { ScrollboxVertical } from '/imports/ui/stylesheets/styled-components/scrollable';

const Root = styled.div`
  height: 150px;
  overflow: hidden;
  border: 1px solid ${colorGrayLightest};
  border-radius: 8px;
  position: absolute;
  bottom: 110%;
  z-index: 100;
  background-color: ${colorWhite};

  [dir="ltr"] & {
    left: 0;
    right: ${smPaddingX};
  }

  [dir="rtl"] & {
    left: ${smPaddingX};
    right: 0;
  }
`;

const Container = styled(ScrollboxVertical)`
  height: 100%;
  overflow: auto;
`;

const List = styled.ul`
  padding: 0;
  margin: 0;
  list-style-type: none;
`;

export default {
  Container,
  List,
  Root,
};
