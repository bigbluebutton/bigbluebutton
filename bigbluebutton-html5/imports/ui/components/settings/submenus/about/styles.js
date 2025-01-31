import styled from 'styled-components';
import Styled from '/imports/ui/components/settings/submenus/styles';

const Title = styled(Styled.Title)``;

const Form = styled(Styled.Form)``;

const Label = styled(Styled.Label)``;

const Content = styled.div`
  padding: 16px;
`;

const Text = styled.p`
  margin: 8px 0;
  font-size: 14px;
  color: #333;
`;

const Link = styled.a`
  color: #333;
`;

const TableButton = styled.button`
  color: #333;
  background-color: transparent;
  border: none;
  font-size: 1rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  margin-top: 8px;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }

  &:focus {
    outline: 2px solid #007BFF;
    outline-offset: 2px;
  }

  &:active {
    color: #0056b3;
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
