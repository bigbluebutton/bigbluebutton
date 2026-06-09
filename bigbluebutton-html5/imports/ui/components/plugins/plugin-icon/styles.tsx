import styled from 'styled-components';
import { btnSpacing } from '/imports/ui/stylesheets/styled-components/general';

export const PluginButtonIcon = styled.i`
  display: flex;
  line-height: 1;
  font-size: inherit;
  vertical-align: middle;

  svg {
    height: 1em;
    width: 1em;
  }

  &:before {
    width: 1em;
    height: 1em;
  }

  .buttonWrapper & {
    font-size: 125%;
  }

  & + span {
    margin: 0 0 0 ${btnSpacing};

    [dir="rtl"] & {
      margin: 0 ${btnSpacing} 0 0;
    }
  }
`;

export default PluginButtonIcon;
