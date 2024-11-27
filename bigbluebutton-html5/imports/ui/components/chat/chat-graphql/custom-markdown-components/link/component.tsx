/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import Auth from '/imports/ui/services/auth';
import Styled from './styles';

type Props = Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, 'ref'> & ReactMarkdownProps;

const MENTION_PROTOCOL = 'bbb://';

const extractUserIdFromMention = (href: string) => {
  return href.replace(MENTION_PROTOCOL, '');
};

const CustomMarkdownLink: React.FC<Props> = (props) => {
  const { children, node, ...rest } = props;
  if (typeof node.properties?.href === 'string' && node.properties.href.startsWith(MENTION_PROTOCOL)) {
    const userId = extractUserIdFromMention(node.properties.href);
    return <Styled.Mention $isMe={userId === Auth.userID}>{children}</Styled.Mention>;
  }
  return <a {...rest}>{children}</a>;
};

export default CustomMarkdownLink;
