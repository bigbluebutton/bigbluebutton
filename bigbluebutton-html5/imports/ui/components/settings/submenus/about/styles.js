import styled from 'styled-components';
import {
  colorLink,
  colorTextEmphasis,
} from '/imports/ui/stylesheets/styled-components/palette';
import Styled from '/imports/ui/components/settings/submenus/styles';
import { fontSizeBase } from '/imports/ui/stylesheets/styled-components/typography';

const Title = styled(Styled.Title)``;

const Form = styled(Styled.Form)``;

const Label = styled(Styled.Label)``;

const Content = styled.div`
  padding: 16px;
`;

const Text = styled.p`
  margin: 8px 0;
  font-size: ${fontSizeBase};
  color: ${colorTextEmphasis};
`;

const Link = styled.a`
  color: ${colorTextEmphasis};
`;

const TableButton = styled.button`
  color: ${colorTextEmphasis};
  background-color: transparent;
  border: none;
  font-size: ${fontSizeBase};
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  margin-top: 8px;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }

  &:focus {
    outline: 2px solid ${colorLink};
    outline-offset: 2px;
  }

  &:active {
    color: ${colorLink};
  }
`;

export default {
  Title,
  Form,
  Label,
  Text,
  Content,
  Link,
  TableButton,
};
