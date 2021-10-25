import styled from 'styled-components';

import { colorGrayLighter } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';
import { smPaddingX } from '/imports/ui/stylesheets/styled-components/general';

const Separator = styled.div`
  height: 1px;
  background-color: ${colorGrayLighter};
  margin-bottom: calc(${lineHeightComputed} * .5);
`;

const Branding = styled.div`
  padding: ${smPaddingX};
  width: 100%;
  & > img {
    max-height: 2rem;
    max-width: 100%;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
`;

export default {
  Separator,
  Branding,
}
