import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import Styled from './styles';
import listItemStyles from '../styles';
import Settings from '/imports/ui/services/settings';

const SkeletonUserListItem: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - temporary while settings are still in .js
  const { isRTL } = Settings.application;

  return (
    <Styled.SkeletonUserItemContents>
      <SkeletonTheme baseColor="#DCE4EC">
        <div style={{ direction: isRTL ? 'rtl' : 'ltr', width: '100%' }}>
          <listItemStyles.UserItemContents>
            <Styled.UserAvatar data-test="userAvatar">
              <listItemStyles.Avatar isSkeleton>
                <Skeleton circle />
              </listItemStyles.Avatar>
            </Styled.UserAvatar>
            <listItemStyles.UserNameContainer>
              <listItemStyles.UserName>
                <Styled.SkeletonWrapper>
                  <Skeleton />
                </Styled.SkeletonWrapper>
              </listItemStyles.UserName>
              <listItemStyles.UserNameSub>
                <Styled.SkeletonWrapper>
                  <Skeleton />
                </Styled.SkeletonWrapper>
              </listItemStyles.UserNameSub>
            </listItemStyles.UserNameContainer>
          </listItemStyles.UserItemContents>
        </div>
      </SkeletonTheme>
    </Styled.SkeletonUserItemContents>
  );
};

export default SkeletonUserListItem;
