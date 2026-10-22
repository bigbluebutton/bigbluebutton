import React from 'react';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import Styled from './styles';

interface OverflowTriggerButtonProps {
  label: string;
  icon?: string;
  customIcon?: React.ReactNode;
  'data-test'?: string;
  disabled?: boolean;
  $hasActiveEntry?: boolean;
  onClick: () => void;
}

// OverflowMenuButton hands its trigger the props of the common Button.
const OverflowTriggerButton = ({
  label,
  icon,
  customIcon,
  'data-test': dataTest,
  disabled,
  $hasActiveEntry = false,
  onClick,
}: OverflowTriggerButtonProps) => (
  <Styled.OverflowButton
    layout="circle"
    icon={icon ? <Icon iconName={icon} /> : customIcon}
    label={label}
    tooltipLabel={label}
    dataTest={dataTest}
    disabled={disabled}
    onClick={onClick}
    $hasActiveEntry={$hasActiveEntry}
  />
);

export default OverflowTriggerButton;
