import { StateNode, TLEventHandlers } from '@bigbluebutton/tldraw';

export default class DeleteAllTool extends StateNode {
  static override id = 'delete-all';

  override onPointerDown: TLEventHandlers['onPointerDown'] = () => {
    this.parent.transition('draw');
  };
}
