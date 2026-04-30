import styled from 'styled-components';
import { Select as SelectMui, SelectProps } from '@mui/material';
import {
  colorWhite,
  colorGrayLighter,
  colorGray,
  colorGrayDark,
  colorPrimary,
  colorText,
} from '/imports/ui/stylesheets/styled-components/palette';
import { borderRadius } from '/imports/ui/stylesheets/styled-components/general';

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

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colorGray};
  font-size: 1.25rem;
  line-height: 1;
  border-radius: ${borderRadius};

  &:hover {
    color: ${colorGrayDark};
    background: ${colorGrayLighter};
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

const EnterButton = styled.button`
  background: ${colorPrimary};
  color: ${colorWhite};
  border: none;
  border-radius: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: transparent;
  color: ${colorText};
  border: none;
  border-radius: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${colorGrayLighter};
  }
`;

const SelectParent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Select = styled(SelectMui)<SelectProps>`
  background-color: ${colorWhite};
  width: 100%;
  margin: 0.75rem 0;
  border-radius: 0.5rem !important;
  overflow: hidden;

  & .MuiOutlinedInput-notchedOutline {
    border-color: ${colorGrayLighter};
  }

  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: ${colorGray};
  }

  &.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${colorPrimary} !important;
  }

  & .MuiSelect-select {
    padding: 0.625rem 0.75rem;
    font-size: 1rem;
  }
`;

export default {
  Overlay,
  Dialog,
  Header,
  Title,
  CloseButton,
  Body,
  BodyText,
  Footer,
  EnterButton,
  CancelButton,
  SelectParent,
  Select,
};
