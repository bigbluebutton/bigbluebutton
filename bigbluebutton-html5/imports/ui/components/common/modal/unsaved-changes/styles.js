import styled from 'styled-components';
import {
  titlesFontWeight,
  textFontWeight,
} from '/imports/ui/stylesheets/styled-components/typography';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';
import ModalSimple from '/imports/ui/components/common/modal/simple/component';

const Modal = styled(ModalSimple)`
  border-radius: 0.5rem;
  width: 35rem;
`;

const Content = styled.div`
  padding: 0 1rem;
`;

const Text = styled.div`
  font-weight: ${titlesFontWeight};
  margin-bottom: 0.25rem;
`;

const IgnoreText = styled.div`
  font-weight: ${textFontWeight};
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  padding: 1.5rem;

  @media ${smallOnly} {
    padding: 1rem;
    gap: 1rem;
    position: relative;
    bottom: auto;
    background: transparent;
    box-shadow: none;
  }
`;

const ActionButton = styled.button`
  width: 12.75rem;
  height: 3.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 1rem;
  cursor: pointer;
  font-size: 16px;
  color: #fff;

  &:first-child {
    background-color: transparent;
    color: #ccc;
  }

  &:last-child {
    background-color: ${colorPrimary};
  }

  &:hover {
    opacity: 0.9;
  }
`;

export default {
  Modal,
  Content,
  Text,
  IgnoreText,
  ActionsContainer,
  ActionButton,
};
