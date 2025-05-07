import { StateNode, TLEventHandlers } from '@bigbluebutton/tldraw';

export default class DeleteSelectedItemsTool extends StateNode {
  static override id = 'delete-selected-items';

  override onPointerDown: TLEventHandlers['onPointerDown'] = () => {
    this.parent.transition('draw');
  };
}
