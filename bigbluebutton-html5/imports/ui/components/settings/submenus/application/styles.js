import styled from 'styled-components';
import {
  colorGrayLabel,
  colorPrimary,
  colorWhite,
  colorGrayLighter,
} from '/imports/ui/stylesheets/styled-components/palette';
import { borderSize, borderSizeLarge } from '/imports/ui/stylesheets/styled-components/general';
import SpinnerStyles from '/imports/ui/components/common/loading-screen/styles';
import Styled from '/imports/ui/components/settings/submenus/styles';

const Row = styled(Styled.Row)``;

const Col = styled(Styled.Col)``;

const FormElement = styled(Styled.FormElement)``;

const Label = styled(Styled.Label)``;

const FormElementRight = styled(Styled.FormElementRight)``;

const Select = styled(Styled.Select)``;

const Title = styled(Styled.Title)``;

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
  border: 1px solid ${colorGrayLighter};
  opacity: 0.25;
`;

const FormElementCenter = styled(Styled.FormElementCenter)``;

const BoldLabel = styled.label`
  color: ${colorGrayLabel};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const PullContentRight = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-flow: row;
  align-items: center;
`;

const LocalesDropdownSelect = styled.div`
  & > select {
    &:focus {
      box-shadow: inset 0 0 0 ${borderSizeLarge} ${colorPrimary};
      border-radius: ${borderSize};
    }

    background-color: ${colorWhite};
    border: ${borderSize} solid ${colorWhite};
    border-radius: ${borderSize};
    border-bottom: 0.1rem solid ${colorGrayLighter};
    color: ${colorGrayLabel};
    width: 100%;
    height: 1.75rem;
    padding: 1px;

    &:hover,
    &:focus {
      outline: transparent;
      outline-style: dotted;
      outline-width: ${borderSize};
    }
  }
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
};
