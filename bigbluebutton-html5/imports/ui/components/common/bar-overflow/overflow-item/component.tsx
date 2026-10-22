import React from 'react';
import Styled from './styles';

interface OverflowItemProps {
  id: string;
  // With the feature off, the item is rendered bare so the bar lays out exactly as without it.
  enabled?: boolean;
  hidden: boolean;
  registerItem: (id: string) => (el: HTMLElement | null) => void;
  children?: React.ReactNode;
}

const OverflowItem: React.FC<OverflowItemProps> = ({
  id,
  enabled = true,
  hidden,
  registerItem,
  children,
}) => {
  if (!enabled) return <>{children}</>;

  // React 18 drops a boolean inert, so it has to be the empty string; @types/react 18 does not
  // declare the attribute, hence the spread.
  const inertAttribute = { inert: hidden ? '' : undefined };

  return (
    <Styled.Slot
      ref={registerItem(id)}
      data-overflow-item={id}
      data-overflowed={hidden ? 'true' : undefined}
      aria-hidden={hidden || undefined}
      $hidden={hidden}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...inertAttribute}
    >
      {children}
    </Styled.Slot>
  );
};

export default OverflowItem;
