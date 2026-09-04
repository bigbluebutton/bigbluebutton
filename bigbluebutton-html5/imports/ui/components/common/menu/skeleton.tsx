import React from 'react';
import {
  appsGalleryOutlineColorSurface,
  colorWhiteSurface,
} from '/imports/ui/stylesheets/styled-components/palette';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import Styled from './styles';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';

const MenuSkeleton: React.FC = () => {
  const Settings = getSettingsSingletonInstance();
  // @ts-ignore
  const { isRTL } = Settings.application;

  return (
    <Styled.Skeleton>
      <SkeletonTheme baseColor={appsGalleryOutlineColorSurface} highlightColor={colorWhiteSurface}>
        <Styled.SkeletonWrapper>
          <Skeleton direction={isRTL ? 'rtl' : 'ltr'} />
        </Styled.SkeletonWrapper>
      </SkeletonTheme>
    </Styled.Skeleton>
  );
};

export default MenuSkeleton;
