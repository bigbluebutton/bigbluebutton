import styled from 'styled-components';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import Modal from '/imports/ui/components/modal/simple/component';

const ReaderMenuModal = styled(Modal)`
  padding: 1rem;
`;

const Title = styled.header`
  display: block;
  color: var(--color-background);
  font-size: 1.4rem;
  text-align: center;
`;

const Col = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 1.5rem 0 0;
  justify-content: center;

  [dir="rtl"] & {
    margin: 0 0 0 1.5rem;
  }

  @media ${smallOnly} {
    width: 100%;
    height: unset;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: .2rem 0 .2rem 0;
`;

const Label = styled.div`
  flex: 1 0 0;
`;

const Select = styled.select`
  background-color: var(--color-white);
  border-radius: 0.3rem;
  color: var(--color-gray-label);
  height: 1.6rem;
  margin-top: 0.4rem;
  width: 50%;
`;

const Swatch = styled.div`
  flex: 1 0 0;
  border-radius: var(--border-size);
  border: var(--border-size) solid var(--color-gray-light);
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: inset 0 0 0 var(--border-size-large) var(--color-primary);
    border-radius: var(--border-size);
  }
`;

const SwatchInner = styled.div`
  width: auto;
  height: 1.1rem;
  border-radius: var(--border-size);
`;

const ColorPickerPopover = styled.div`
  position: absolute;
  z-index: 1001;
`;

const ColorPickerOverlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const Footer = styled.div`
  display: flex;
`;

const Actions = styled.div`
  margin-left: auto;
  margin-right: 3px;

  [dir="rtl"] & {
    margin-right: auto;
    margin-left: 3px;
  }

  > * {
    &:first-child {
      margin-right: 3px;
      margin-left: inherit;

      [dir="rtl"] & {
        margin-right: inherit;
        margin-left: 3px;
      }
    }
  }
`;

export default {
  ReaderMenuModal,
  Title,
  Col,
  Row,
  Label,
  Select,
  Swatch,
  SwatchInner,
  ColorPickerPopover,
  ColorPickerOverlay,
  Footer,
  Actions,
};
