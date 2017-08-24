package org.bigbluebutton.modules.sharednotes {
	import org.bigbluebutton.core.Options;

	public class SharedNotesOptions extends Options {

		[Bindable]
		public var refreshDelay:int = 500;

		[Bindable]
		public var enableMultipleNotes:Boolean = false;

		[Bindable]
		public var toolbarVisibleByDefault:Boolean = false;

		[Bindable]
		public var showToolbarButton:Boolean = false;

		[Bindable]
		public var fontSize:int = 14;

		[Bindable]
		public var maxPasteLength:int = 1024;

		[Bindable]
		public var maxNoteLength:int = 5120;

		[Bindable]
		public var enableDeleteNotes:Boolean = false;

		public function SharedNotesOptions() {
			name = "SharedNotesModule";
		}
	}
}
