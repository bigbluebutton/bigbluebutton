import { StateNode } from 'tldraw'

export class NoopTool extends StateNode {
	static override id = 'noop'
	static override initial = 'idle'

	override onEnter = () => {
		this.editor.setCursor({ type: 'default', rotation: 0 });
	}

	override onExit = () => {
		this.editor.setCursor({ type: 'default', rotation: 0 });
	}
}
