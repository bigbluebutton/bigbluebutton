import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { borderSizeLarge } from '/imports/ui/stylesheets/styled-components/general';
import { headingsFontWeight } from '/imports/ui/stylesheets/styled-components/typography';

const QuickPollButton = styled(Button)`
  margin-left: .5rem;
  padding: .1rem;
  box-shadow: none !important;
  background-clip: unset !important;
  width: 5rem;
  overflow: hidden;
  text-overflow: ellipsis;

  & > span:first-child {
    border-radius: ${borderSizeLarge};
    font-size: small;
    font-weight: ${headingsFontWeight};
    opacity: 1;
  }

  & > span:first-child:hover {
    opacity: 1 !important;
  }
`;

const QuickPollButtonPlaceholder = styled.div`
  width: 5rem;
  margin-left: .5rem;
  pointer-events: none;
`;

export default {
  QuickPollButton,
  QuickPollButtonPlaceholder,
};
