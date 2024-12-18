/* eslint-disable lines-between-class-members */
import { StateNode } from '@bigbluebutton/tldraw';

export default class NoopTool extends StateNode {
  static override id = 'noop';
  static override initial = 'idle';

  override onEnter = () => {
    this.editor.setCursor({ type: 'default', rotation: 0 });
  }

  override onExit = () => {
    this.editor.setCursor({ type: 'default', rotation: 0 });
  }
}
