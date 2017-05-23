package org.bigbluebutton.modules.sharednotes
{
	import org.bigbluebutton.core.BBB;

	public class SharedNotesOptions
	{
		[Bindable]
		public var refreshDelay:int = 500;

		[Bindable]
		public var position:String = "bottom-left";

		[Bindable]
		public var autoStart:Boolean = false;

		[Bindable]
		public var showButton:Boolean = false;

		[Bindable]
		public var enableMultipleNotes:Boolean = false;

		[Bindable]
		public var toolbarVisibleByDefault:Boolean = false;

		[Bindable]
		public var showToolbarButton:Boolean = false;

		[Bindable]
		public var fontSize:int = 10;

		public function SharedNotesOptions()
		{
			var vxml:XML = BBB.getConfigForModule("SharedNotesModule");
			if (vxml != null) {
				if (vxml.@refreshDelay != undefined) {
					refreshDelay = Number(vxml.@refreshDelay);
				}
				if (vxml.@position != undefined) {
					position = vxml.@position.toString();
				}
				if (vxml.@autoStart != undefined) {
					autoStart = (vxml.@autoStart.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@showButton != undefined) {
					showButton = (vxml.@showButton.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@enableMultipleNotes != undefined) {
					enableMultipleNotes = (vxml.@enableMultipleNotes.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@toolbarVisibleByDefault != undefined) {
					toolbarVisibleByDefault = (vxml.@toolbarVisibleByDefault.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@showToolbarButton != undefined) {
					showToolbarButton = (vxml.@showToolbarButton.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@fontSize != undefined) {
					fontSize = Number(vxml.@fontSize);
				}
			}
		}
	}
}
