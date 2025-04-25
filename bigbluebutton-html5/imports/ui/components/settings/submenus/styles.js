import styled from 'styled-components';
import {
  colorGrayDark,
  colorGrayLabel,
  colorPrimary,
  colorWhite,
  colorGrayLighter,
} from '/imports/ui/stylesheets/styled-components/palette';
import { Switch } from '@mui/material';
import { styled as materialStyled } from '@mui/material/styles';
import { borderSize, borderSizeLarge } from '/imports/ui/stylesheets/styled-components/general';

const Title = styled.h3`
  color: ${colorGrayDark};
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0;
`;

const SubTitle = styled.h4`
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const Form = styled.div`
  display: flex;
  flex-flow: column;
`;

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

const FormElementRight = styled.div`
  position: relative;
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  flex-flow: row;
  align-items: center;
`;

const FormElementCenter = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  flex-flow: row;
  align-items: center;
`;

const Label = styled.span`
  color: ${colorGrayLabel};
  font-size: 0.9rem;
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

const MaterialSwitch = materialStyled(Switch)(({ theme }) => ({
  width: '2.3rem',
  height: '1.2rem',
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(1.2rem)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: '0.2rem',
    '&.Mui-checked': {
      transform: 'translateX(1.2rem)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: colorPrimary,
        ...theme.applyStyles('dark', {
          backgroundColor: colorPrimary,
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: '0.6rem',
    height: '0.6rem',
    borderRadius: '0.5rem',
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
    transform: 'translateY(1px)',
  },
  '& .MuiSwitch-track': {
    borderRadius: '0.6rem',
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

export default {
  Title,
  SubTitle,
  Form,
  Row,
  Col,
  FormElement,
  FormElementRight,
  FormElementCenter,
  Label,
  Select,
  MaterialSwitch,
};
