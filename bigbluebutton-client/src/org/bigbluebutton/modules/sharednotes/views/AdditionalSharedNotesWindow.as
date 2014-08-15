package org.bigbluebutton.modules.sharednotes.views
{
	import flash.display.Sprite;
	import flash.events.MouseEvent;

	import mx.controls.Alert;
	import mx.events.CloseEvent;

	import org.bigbluebutton.main.views.MainCanvas;
	import org.bigbluebutton.modules.sharednotes.events.SharedNotesEvent;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public class AdditionalSharedNotesWindow extends SharedNotesWindow
	{

		public function AdditionalSharedNotesWindow(notesId:String) {
			trace("AdditionalSharedNotesWindow: in-constructor additional notes " + notesId);
			_notesId = notesId;

			showCloseButton = true;
			width = 240;
			height = 240;

			closeBtn.addEventListener(MouseEvent.CLICK, onCloseBtnClick);
		}

		private function onCloseBtnClick(e:MouseEvent):void {
			var alert:Alert = Alert.show("This action will destroy these notes for everyone, and there's no way to undo. Are you sure you want to close these notes?", "Closing shared notes", Alert.YES | Alert.NO, parent as Sprite, alertClose, null, Alert.YES);
			e.stopPropagation();
		}

		private function alertClose(e:CloseEvent):void {
			if (e.detail == Alert.YES) {
				showCloseButton = false;

				trace("AdditionalSharedNotesWindow: requesting to destroy notes " + _notesId);
				var destroyNotesEvent:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.DESTROY_ADDITIONAL_NOTES_REQUEST_EVENT);
				destroyNotesEvent.payload.notesId = _notesId;
				_dispatcher.dispatchEvent(destroyNotesEvent);
			}
		}

		override public function getPrefferedPosition():String {
			return MainCanvas.POPUP;
		}

	}
}
