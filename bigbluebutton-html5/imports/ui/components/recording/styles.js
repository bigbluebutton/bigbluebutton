import styled from 'styled-components';
import ModalFooterButton from '/imports/ui/components/common/modal/footer-button/component';

const NotificationContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

// The same actions row as a modal footer: the buttons keep their own width at
// the end of the row, and wrap only when the pair does not fit the toast.
const NotificationActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
  width: 100%;
`;

const ActionButton = ModalFooterButton;

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
`;

export default {
  NotificationContent,
  NotificationActions,
  ActionButton,
  TitleText,
  DescriptionText,
  SvgCapsule,
};
