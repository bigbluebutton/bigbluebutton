import styled from 'styled-components';
import Button from '/imports/ui/components/common/button/component';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const FormWrapper = styled.div`
  min-width: 0;
`;

const Form = styled.div`
  display: flex;
  flex-flow: column;
  margin-top: 1.5rem;
`;

const Row = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  margin-bottom: 0.7rem;
`;

const EnterAudio = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
`;

const AudioNote = styled.div`
  @media ${smallOnly} {
    font-size: 0.8rem;
  }
`;

const Col = styled.div`
  min-width: 0;

  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  margin: 0 1rem 0 0;

  [dir="rtl"] & {
    margin: 0 0 0 1rem;
  }

  &:last-child {
    margin-right: 0;
    margin-left: inherit;
    padding: 0 0.1rem 0 4rem;

    [dir="rtl"] & {
      margin-right: inherit;
      margin-left: 0;
      padding: 0 4rem 0 0.1rem;
    }
  }
`;

const FormElement = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
`;

const LabelSmall = styled.label`
  color: black;
  font-size: 0.85rem;
  font-weight: 600;

  & > :first-child {
    margin-top: 0.5rem;
  }
`;

const LabelSmallFullWidth = styled(LabelSmall)`
  width: 100%;
`;

const SpacedLeftCol = styled.div`
  min-width: 0;

  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  margin: 0 1rem 0 0;

  [dir="rtl"] & {
    margin: 0 0 0 1rem;
  }

  &:last-child {
    margin-right: 0;
    margin-left: inherit;
    padding: 0 0.1rem 0 4rem;

    [dir="rtl"] & {
      margin-right: inherit;
      margin-left: 0;
      padding: 0 4rem 0 0.1rem;
    }
  }

  & label {
    flex-grow: 1;
    flex-basis: 0;
    margin-right: 0;
    margin-left: inherit;
    padding: 0 0.1rem 0 4rem;

    [dir="rtl"] & {
      margin-right: inherit;
      margin-left: 0;
      padding: 0 4rem 0 0.1rem;
    }
  }

  &:before {
    content: "";
    display: block;
    flex-grow: 1;
    flex-basis: 0;
    margin-right: 1rem;
    margin-left: inherit;

    [dir="rtl"] & {
      margin-right: inherit;
      margin-left: 1rem;
    }
  }

  &:last-child {
    margin-right: 0;
    margin-left: inherit;
    padding-right: 0;
    padding-left: 0;

    [dir="rtl"] & {
      margin-right: 0;
      margin-left: inherit;
    }
  }
`;

const BackButton = styled(Button)`
  margin: 0 0.5rem 0 0;
  border: none;

  [dir="rtl"] & {
    margin: 0 0 0 0.5rem;
  }

  @media ${smallOnly} {
    margin:0 auto 0 0;

    [dir="rtl"] & {
      margin:0 0 0 auto;
    }
  }

  &:first-child {
    margin: 0 0.5rem 0 0 !important;
  }
`;

export default {
  FormWrapper,
  Form,
  Row,
  EnterAudio,
  AudioNote,
  Col,
  FormElement,
  LabelSmall,
  LabelSmallFullWidth,
  SpacedLeftCol,
  BackButton,
};
