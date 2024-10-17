import styled from 'styled-components';
import { colorGrayLight } from '/imports/ui/stylesheets/styled-components/palette';
import { xlPadding, xsPadding } from '/imports/ui/stylesheets/styled-components/general';

export const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  color: ${colorGrayLight};

  [dir='ltr'] & {
    padding-right: ${xlPadding};
  }

  [dir='rtl'] & {
    padding-left: ${xlPadding};
  }
`;

export const Highlighted = styled.span`
  font-weight: bold;
`;

export const Left = styled.span`
  display: flex;
  align-items: center;
  gap: ${xsPadding};
`;

export const Cancel = styled.button`
  background: none;
  outline: none;
  border: none;
  color: inherit;
  padding: 0.125rem;
  border-radius: 0.5rem;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    opacity: .75;
  }

  &:focus {
    box-shadow: inset 0 0 0.125rem ${colorGrayLight};
  }
`;

export default {
  Root,
  Left,
  Cancel,
};
