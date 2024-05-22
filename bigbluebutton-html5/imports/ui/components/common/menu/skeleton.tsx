import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import Styled from './styles';
import Settings from '/imports/ui/services/settings';

const MenuSkeleton: React.FC = () => {
  // @ts-ignore
  const { isRTL } = Settings.application;

  return (
    <Styled.Skeleton>
      <SkeletonTheme baseColor="#DCE4EC">
        <Styled.SkeletonWrapper>
          <Skeleton direction={isRTL ? 'rtl' : 'ltr'} />
        </Styled.SkeletonWrapper>
      </SkeletonTheme>
    </Styled.Skeleton>
  );
};

export default MenuSkeleton;
