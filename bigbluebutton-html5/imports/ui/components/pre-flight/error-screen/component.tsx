import React, { useEffect } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import { BBButton } from '@bigbluebutton/bbb-ui-components-react';
import Styled from './styles';
import PreFlightStyled from '../styles';

type BBButtonProps = React.ComponentProps<typeof BBButton>;

export interface PreFlightErrorAction {
  label: string;
  onClick: () => void;
  variant?: BBButtonProps['variant'];
  color?: BBButtonProps['color'];
  dataTest?: string;
}

interface PreFlightErrorHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  announcement?: string;
  notice?: string;
  windowTitle?: string;
  dataTest?: string;
}

export const PreFlightErrorHeader: React.FC<PreFlightErrorHeaderProps> = ({
  badge,
  title,
  description,
  announcement,
  notice,
  windowTitle,
  dataTest,
}) => {
  useEffect(() => {
    if (windowTitle) document.title = windowTitle;
  }, [windowTitle]);

  return (
    <>
      <Styled.ErrorBlock role="alert" data-test={dataTest}>
        {badge && (
          <Styled.NoticeBadge>
            <WarningIcon aria-hidden="true" />
            {badge}
          </Styled.NoticeBadge>
        )}
        <Styled.ErrorText>
          <Styled.ErrorHeading>{title}</Styled.ErrorHeading>
          {description && <Styled.ErrorDescription>{description}</Styled.ErrorDescription>}
        </Styled.ErrorText>
        {announcement && <span className="sr-only">{announcement}</span>}
      </Styled.ErrorBlock>
      {notice && (
        <Styled.ErrorNotice aria-live="off" data-test="preFlightErrorNotice">
          {notice}
        </Styled.ErrorNotice>
      )}
    </>
  );
};

interface PreFlightErrorActionsProps {
  actions: PreFlightErrorAction[];
}

export const PreFlightErrorActions: React.FC<PreFlightErrorActionsProps> = ({ actions }) => (
  <PreFlightStyled.ActionsWrapper>
    {actions.map(({
      label, onClick, variant = 'subtle', color = 'default', dataTest,
    }) => (
      <BBButton
        key={label}
        variant={variant}
        color={color}
        label={label}
        onClick={onClick}
        dataTest={dataTest}
      />
    ))}
  </PreFlightStyled.ActionsWrapper>
);
