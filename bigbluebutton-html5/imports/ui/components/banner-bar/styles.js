import styled from 'styled-components';
import { TextElipsis } from '/imports/ui/stylesheets/styled-components/placeholders';
import { colorWhite } from '/imports/ui/stylesheets/styled-components/palette';

const BannerTextColor = styled(TextElipsis)`
  color: ${colorWhite};
`;

export default {
  BannerTextColor,
};
