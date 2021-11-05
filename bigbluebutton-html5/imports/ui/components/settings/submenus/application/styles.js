import styled from 'styled-components';
import {
  colorGrayLabel,
  colorPrimary,
  colorWhite,
  colorGrayLighter,
  colorGrayDark,
} from '/imports/ui/stylesheets/styled-components/palette';
import { borderSize, borderSizeLarge } from '/imports/ui/stylesheets/styled-components/general';
import Styled from '/imports/ui/components/loading-screen/styles';

const Row = styled.div`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  justify-content: space-between;
  margin-bottom: 0.7rem;
`;

const Col = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 0;

  &:last-child {
    padding-right: 0;
    padding-left: 1rem;

    [dir="rtl"] & {
      padding-right: 0.1rem;
      padding-left: 0;
    }
  }
`;

const FormElement = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
`;

const Label = styled.span`
  color: ${colorGrayLabel};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const FormElementRight = styled.div`
  position: relative;
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  flex-flow: row;
  align-items: center;
`;

const Select = styled.select`
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
`;

const Title = styled.h3`
  color: ${colorGrayDark};
  font-weight: 400;
  font-size: 1.3rem;
  margin: 0;
  margin-bottom: 1.5rem;
`;

const Form = styled.div`
  display: flex;
  flex-flow: column;
`;

const SpinnerOverlay = styled(Styled.Spinner)`
  & > div {
    background-color: black;
  }
`;

const Bounce1 = styled(Styled.Bounce1)``;

const Bounce2 = styled(Styled.Bounce2)``;

const Separator = styled.hr`
  margin: 2.5rem 0;
  border: 1px solid ${colorGrayLighter};
  opacity: 0.25;
`;

const FormElementCenter = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  flex-flow: row;
  align-items: center;
`;

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
