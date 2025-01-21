import styled from 'styled-components';
import { btnPrimaryBg } from '/imports/ui/stylesheets/styled-components/palette';
import {
  lgBorderRadius,
} from '/imports/ui/stylesheets/styled-components/general';

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const NotificationActions = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
  width: 100%;
`;

const ConfirmationButton = styled.button`
  background-color: ${btnPrimaryBg};
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: ${lgBorderRadius};
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center
  height: 3.5rem;
  
  svg {
    margin-right: 0.5rem;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const CancelButton = styled.button`
  background-color: transparent;
  color: #333;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 400;
  cursor: pointer;
  margin-right: 16px;
  border-radius: ${lgBorderRadius};
  border: none;

  &:hover {
    background-color: #f4f4f4;
  }
`;

const TitleText = styled.h3`
  font-size: 1.125rem;
  color: #333;
  font-weight: 700;
  margin-bottom: 8px;
`;

const DescriptionText = styled.p`
  font-size: 1rem;
  color: #666;
  text-align: left;
  margin: 0;
`;

const SvgCapsule = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  margin-right: 0.5rem;
`;

export default {
  NotificationContent,
  NotificationActions,
  ConfirmationButton,
  CancelButton,
  TitleText,
  DescriptionText,
  SvgCapsule,
};
