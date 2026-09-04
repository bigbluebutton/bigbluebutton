import styled from 'styled-components';
import { Select as SelectMui, type SelectProps } from '@mui/material';
import {
  colorWhite,
  colorGrayLighter,
  colorGrayDark,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
`;

const Dialog = styled.div`
  background: ${colorWhite};
  border-radius: 0.75rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  width: 32rem;
  max-width: 92vw;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 0.5rem 1.5rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colorGrayDark};
`;

// BBButton's circle layout is hardcoded to 3rem, much larger than this
// dialog's original close glyph. Shrink it back to the previous footprint.
const CloseButtonWrapper = styled.div`
  button {
    width: 1.75rem !important;
    height: 1.75rem !important;
  }
`;

const Body = styled.div`
  padding: 1.5rem;
  color: ${colorText};
  font-size: 1rem;
  line-height: 1.6;
`;

const BodyText = styled.p`
  margin: 0 0 0.5rem 0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
`;

const SelectParent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Select = styled(SelectMui)<SelectProps>`
  width: 100%;
  margin: 0.75rem 0;

  .MuiOutlinedInput-notchedOutline {
    border-color: ${colorGrayLighter};
    border-radius: 0.5rem;
  }

  .MuiSelect-select {
    padding: 0.625rem;
    font-size: 1rem;
    background-color: ${colorWhite};
  }
`;

export default {
  Overlay,
  Dialog,
  Header,
  Title,
  CloseButtonWrapper,
  Body,
  BodyText,
  Footer,
  SelectParent,
  Select,
};
