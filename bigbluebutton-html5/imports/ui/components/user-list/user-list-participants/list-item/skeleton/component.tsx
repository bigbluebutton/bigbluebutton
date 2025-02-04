import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import Styled from './styles';
import listItemStyles from '../styles';
import AvatarStyled from '../user-name-with-subs/styles';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';

interface SkeletonUserListItemProps {
  enableAnimation?: boolean;
}

const SkeletonUserListItem: React.FC<SkeletonUserListItemProps> = ({
  enableAnimation = true,
}) => {
  const Settings = getSettingsSingletonInstance();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - temporary while settings are still in .js
  const { isRTL } = Settings.application;

  return (
    <Styled.SkeletonUserItemContents>
      <SkeletonTheme baseColor="#DCE4EC" enableAnimation={enableAnimation}>
        <div style={{ direction: isRTL ? 'rtl' : 'ltr', width: '100%' }}>
          <listItemStyles.UserItemContents>
            <Styled.UserAvatar data-test="userAvatar">
              <listItemStyles.Avatar isSkeleton>
                <Skeleton circle />
              </listItemStyles.Avatar>
            </Styled.UserAvatar>
            <AvatarStyled.UserNameContainer>
              <AvatarStyled.UserName>
                <Styled.SkeletonWrapper>
                  <Skeleton />
                </Styled.SkeletonWrapper>
              </AvatarStyled.UserName>
              <AvatarStyled.UserNameSub>
                <Styled.SkeletonWrapper>
                  <Skeleton />
                </Styled.SkeletonWrapper>
              </AvatarStyled.UserNameSub>
            </AvatarStyled.UserNameContainer>
          </listItemStyles.UserItemContents>
        </div>
      </SkeletonTheme>
    </Styled.SkeletonUserItemContents>
  );
};

export default SkeletonUserListItem;
