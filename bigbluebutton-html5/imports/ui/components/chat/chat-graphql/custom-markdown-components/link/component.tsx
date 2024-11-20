/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import Styled from './styles';

type Props = Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, 'ref'> & ReactMarkdownProps;

const CustomMarkdownLink: React.FC<Props> = (props) => {
  const { children, node, ...rest } = props;
  if (typeof node.properties?.href === 'string' && node.properties.href.includes('mention://')) {
    return <Styled.Mention>{children}</Styled.Mention>;
  }
  return <a {...rest}>{children}</a>;
};

export default CustomMarkdownLink;
