import styled from 'styled-components';
import {
  colorGrayLabel,
  colorPrimary,
  colorWhite,
  colorBorder,
} from '/imports/ui/stylesheets/styled-components/palette';
import { borderSize, borderSizeLarge, lgBorderRadius } from '/imports/ui/stylesheets/styled-components/general';
import SpinnerStyles from '/imports/ui/components/common/loading-screen/styles';
import Styled from '/imports/ui/components/settings/submenus/styles';

const Row = styled(Styled.Row)``;

const Col = styled(Styled.Col)`
  display: flex;
  flex-grow: 1;
  flex-basis: 0;

  &:last-child {
    padding-right: 0;
    padding-left: 0;

    [dir="rtl"] & {
      padding-right: 0.1rem;
      padding-left: 0;
    }
  }
`;

const FormElement = styled(Styled.FormElement)``;

const Label = styled(Styled.Label)`
  margin-left: 0.5rem;
  color: ${colorGrayLabel};
  font-size: 0.9rem;
`;

const FormElementRight = styled(Styled.FormElementRight)`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 0;
`;

const Select = styled(Styled.Select)``;

const Title = styled(Styled.Title)``;

const ApplicationTitle = styled(Styled.Title)`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0;
  padding-bottom: 1.5rem;
`;

const Form = styled(Styled.Form)``;

const SpinnerOverlay = styled(SpinnerStyles.Spinner)`
  & > div {
    background-color: black;
  }
`;

const Bounce1 = styled(SpinnerStyles.Bounce1)``;

const Bounce2 = styled(SpinnerStyles.Bounce2)``;

const Separator = styled.hr`
  margin: 2.5rem 0;
  border: 1px solid ${colorBorder};
  opacity: 0.25;
`;

const FormElementCenter = styled(Styled.FormElementCenter)``;

const BoldLabel = styled.label`
  color: ${colorGrayLabel};
  font-size: 1rem;
  font-weight: bold;
`;

const PullContentRight = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-flow: row;
  align-items: center;
`;

const LocalesDropdownSelect = styled.div`
  width: 100%;
  margin-top: 0.5rem;

  & > select {
    background-color: ${colorWhite};
    border: ${borderSize} solid ${colorBorder};
    border-radius: ${lgBorderRadius};  
    color: ${colorGrayLabel};
    width: 100%;
    height: 3.5rem;
    padding: 1rem;
    box-sizing: border-box;

    &:focus {
      box-shadow: inset 0 0 0 ${borderSizeLarge} ${colorPrimary};
      border-radius: ${lgBorderRadius};
    }

    &:hover,
    &:focus {
      outline: transparent;
      outline-style: dotted;
      outline-width: ${borderSize};
    }
  }
`;

const ExampleText = styled.p`
  color: ${colorGrayLabel};
  font-size: ${(props) => props.style.fontSize || '16px'};
`;

const FontContainer = styled.div`
`;
const LanguageContainer = styled.div`
  padding-bottom: 1.5rem;
`;
const AplicationContainer = styled.div`
  padding-bottom: 1.5rem;
`;

export default {
  Row,
  Col,
  FormElement,
  Label,
  FormElementRight,
  Select,
  Title,
  Form,
  SpinnerOverlay,
  Bounce1,
  Bounce2,
  Separator,
  FormElementCenter,
  BoldLabel,
  PullContentRight,
  LocalesDropdownSelect,
  ExampleText,
  FontContainer,
  LanguageContainer,
  AplicationContainer,
  ApplicationTitle,
};
