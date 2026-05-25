import React from 'react';

export interface TriggerProps {
  label?: string;
  'aria-label'?: string;
  hideLabel?: boolean;
  icon?: string;
  'data-test'?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  accessKey?: string;
  tooltip?: string;
}

declare const Trigger: React.ComponentType<TriggerProps>;
export default Trigger;
