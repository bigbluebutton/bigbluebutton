import styled from 'styled-components';

import { colorGrayLighter } from '/imports/ui/stylesheets/styled-components/palette';
import { lineHeightComputed } from '/imports/ui/stylesheets/styled-components/typography';
import { navigationSidebarLogoPadding } from '/imports/ui/stylesheets/styled-components/general';

const Separator = styled.div`
  height: 1px;
  background-color: ${colorGrayLighter};
  margin-bottom: calc(${lineHeightComputed} * .5);
`;

const Branding = styled.div`
  width: 100%;
  padding: ${navigationSidebarLogoPadding};
  & > img {
    max-height: 3rem;
    max-width: 100%;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
`;

export default {
  Separator,
  Branding,
};
