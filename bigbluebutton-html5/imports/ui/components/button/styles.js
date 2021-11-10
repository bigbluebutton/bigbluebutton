import styled from 'styled-components';
import Icon from '../icon/component';
import { btnSpacing } from '/imports/ui/stylesheets/styled-components/general';

const ButtonIcon = styled(Icon)`
  width: 1em;
  text-align: center;

  .buttonWrapper & {
    font-size: 125%;
  }

  & + span {
    margin: 0 0 0 ${btnSpacing};

    [dir="rtl"] & {
      margin: 0 ${btnSpacing} 0 0;
    }
  }
  .buttonWrapper:hover & {
    opacity: .75;
  }
`;

export default {
  ButtonIcon,
};
