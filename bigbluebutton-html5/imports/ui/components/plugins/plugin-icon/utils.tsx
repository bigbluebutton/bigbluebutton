import React, { ReactNode } from 'react';
import Icon from '/imports/ui/components/common/icon/component';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import { PluginButtonIcon } from '/imports/ui/components/plugins/plugin-icon/styles';

type ForeignReactElement = {
  $$typeof: symbol;
  type: React.ElementType;
  key: React.Key | null;
  ref?: unknown;
  props: Record<string, unknown>;
};

// Plugins bundle their own copy of React, so the svgContent they provide may be an
// element created by another React version, which React 19 refuses to render.
// Rebuild such elements with the host's createElement. Only plain elements
// (svg, path, ...) can be rebuilt; a plugin component would still run the
// plugin's React.
export const toHostReactNode = (node: unknown): ReactNode => {
  if (Array.isArray(node)) return node.map(toHostReactNode);
  if (!node || typeof node !== 'object' || React.isValidElement(node)) return node as ReactNode;
  if (!('$$typeof' in node) || !('type' in node) || !('props' in node)) return node as ReactNode;

  const {
    type, key, ref, props,
  } = node as ForeignReactElement;
  const { children, ...otherProps } = props;
  const hostProps: Record<string, unknown> = { ...otherProps };
  if (key != null) hostProps.key = key;
  if (ref) hostProps.ref = ref;
  if (children === undefined) return React.createElement(type, hostProps);

  return React.createElement(
    type,
    hostProps,
    ...(Array.isArray(children) ? children : [children]).map(toHostReactNode),
  );
};

const resolveIcon = (icon: PluginIconType): React.ReactNode => {
  if (typeof icon === 'string') return <Icon iconName={icon} />;
  if (icon && typeof icon === 'object' && 'iconName' in icon) {
    return <Icon iconName={icon.iconName} />;
  }
  if (icon && typeof icon === 'object' && 'svgContent' in icon) {
    return <PluginButtonIcon>{toHostReactNode(icon.svgContent)}</PluginButtonIcon>;
  }
  return null;
};

export default resolveIcon;
