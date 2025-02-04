import styled from 'styled-components';
import { styled as materialStyled } from '@mui/material/styles';
import { Switch } from '@mui/material';
import {
  jumboPaddingY,
  smPaddingX,
  titlePositionLeft,
  mdPaddingX,
} from '/imports/ui/stylesheets/styled-components/general';
import { fontSizeBase, fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';
import { colorGray, colorGrayLabel, colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';
import Button from '/imports/ui/components/common/button/component';

const ToggleLabel = styled.span`
  margin-right: ${smPaddingX};

  [dir="rtl"] & {
    margin: 0 0 0 ${smPaddingX};
  }
`;

const LockViewersModal = styled(ModalSimple)`
  padding: 0px;
  border-radius: 1rem;
`;

const Container = styled.div`
  padding: 1.14rem 2.25rem 1.14rem;
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  gap: 1rem;
`;

const Description = styled.div`
  text-align: start;
  color: ${colorGray};
  margin-bottom: ${jumboPaddingY};
`;

const Form = styled.div`
  display: flex;
  flex-flow: column;
  gap: 0.6rem;
`;

const SubHeader = styled.header`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  justify-content: space-between;
  color: ${colorGrayLabel};
  font-size: ${fontSizeBase};
  margin-bottom: ${titlePositionLeft};
`;

const Bold = styled.div`
  font-weight: bold;
`;

const Row = styled.div`
  display: flex;
  flex-flow: row;
  flex-grow: 1;
  justify-content: space-between;
  gap: 1.1rem;

  & > :first-child {
    margin:  0 ${mdPaddingX} 0 0;

    [dir="rtl"] & {
      margin: 0 0 0 ${mdPaddingX};
    }
  }
`;

const ColToggle = styled.div`
  display: flex;
  flex-grow: 0;
  flex-basis: 0;
  margin: 0;

  [dir="rtl"] & {
    margin: 0;
  }
`;

const Col = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 0;
  margin: 0;

  [dir="rtl"] & {
    margin: 0;
  }
`;

const FormElement = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  flex-grow: 1;
`;

const FormElementLeft = styled(FormElement)`
  display: flex;
  justify-content: flex-start;
  flex-flow: row;
  align-items: center;
`;

const Label = styled.div`
  color: ${colorGrayLabel};
  font-size: ${fontSizeSmall};
`;

const Footer = styled.div`
  display: flex;
  padding: 1.7rem;
`;

const Actions = styled.div`
  margin-left: auto;
  margin-right: 0;

  [dir="rtl"] & {
    margin-right: auto;
    margin-left: 3px;
  }
`;

const ButtonCancel = styled(Button)`
  margin: 0 0.25rem;
  width: 10rem;
  height: 3rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
`;

const ButtonApply = styled(Button)`
  margin: 0 0.25rem;
  width: 10.75rem;
  height: 3rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
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
  ToggleLabel,
  LockViewersModal,
  Container,
  Description,
  Form,
  SubHeader,
  Bold,
  Row,
  ColToggle,
  Col,
  FormElement,
  FormElementLeft,
  Label,
  Footer,
  Actions,
  ButtonCancel,
  ButtonApply,
  MaterialSwitch,
};
