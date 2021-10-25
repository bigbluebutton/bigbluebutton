import styled from 'styled-components';
import Button from '/imports/ui/components/button/component';

const QuickPollButton = styled(Button)`
  padding: var(--whiteboard-toolbar-padding);
  background-color: var(--color-off-white) !important;
  box-shadow: none !important;

  & > span:first-child {
    border: 1px solid var(--toolbar-button-color);
    border-radius: var(--border-size-large);
    color: var(--toolbar-button-color);
    font-size: small;
    font-weight: var(--headings-font-weight);
    opacity: 1;
    padding-right: var(--border-size-large);
    padding-left: var(--border-size-large);
  }

  & > span:first-child:hover {
    opacity: 1 !important;
  }
`;

export default {
  QuickPollButton,
};
