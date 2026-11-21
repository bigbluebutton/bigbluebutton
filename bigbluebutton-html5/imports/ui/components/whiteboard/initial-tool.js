import { GeoShapeGeoStyle } from '@bigbluebutton/tldraw';

const selectableTools = [
  'select', 'hand', 'draw', 'eraser', 'arrow', 'text', 'note', 'line', 'frame', 'highlight',
  ...GeoShapeGeoStyle.values,
];

export default function selectInitialTool(editor, {
  savedTool, initialTool, defaultTool, allowedTools,
}) {
  // An empty list leaves the toolbar unrestricted, as in the toolbar overrides.
  const tools = Array.isArray(allowedTools) && allowedTools.length > 0
    ? allowedTools : selectableTools;
  const tool = [savedTool, initialTool, defaultTool, 'draw', ...tools].find((id) => (
    typeof id === 'string' && selectableTools.includes(id) && tools.includes(id)
  ));

  // Toolbar shape IDs are styles of the geo tool, not editor tool IDs.
  if (GeoShapeGeoStyle.values.includes(tool)) {
    editor.setStyleForNextShapes(GeoShapeGeoStyle, tool);
    editor.setCurrentTool('geo');
  } else {
    editor.setCurrentTool(tool || 'noop');
  }
}
