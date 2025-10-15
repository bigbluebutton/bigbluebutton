import styled from 'styled-components';
import styles from '/imports/ui/components/lock-viewers/styles';
import { fontSizeSmall } from '../../stylesheets/styled-components/typography';

const ModalContainer = styled(styles.LockViewersModal)`
  width: fit-content !important;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Stack on small screens */
  }
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-background-light);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-height: 48px;
`;

const Label = styled.span`
  font-size: 0.95rem;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 1rem;
`;

export const CategorySection = styled.div`
  margin-bottom: 2rem;
`;

export const CategoryTitle = styled.h3`
  margin-bottom: 1rem;
  font-size: ${fontSizeSmall};
  font-weight: 600;
  color: var(--color-text-strong);
  text-transform: uppercase;
`;

export default {
  ...styles,
  FeaturesGrid,
  FeatureItem,
  Label,
  ModalContainer,
  CategorySection,
  CategoryTitle,
};
