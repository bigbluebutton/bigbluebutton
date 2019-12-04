package org.bigbluebutton.modules.sharednotes.views
{
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	
	import mx.controls.Alert;
	import mx.events.CloseEvent;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.modules.sharednotes.SharedNotesOptions;
	import org.bigbluebutton.modules.sharednotes.events.SharedNotesEvent;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public class AdditionalSharedNotesWindow extends SharedNotesWindow
	{
		private static const LOGGER:ILogger = getClassLogger(AdditionalSharedNotesWindow);

		public function AdditionalSharedNotesWindow(n:String) {
			super();

			LOGGER.debug("AdditionalSharedNotesWindow: in-constructor additional notes " + n);
			_noteId = n;

			options = Options.getOptions(SharedNotesOptions) as SharedNotesOptions;

			showCloseButton = UsersUtil.amIModerator() && options.enableDeleteNotes;
			width = 240;
			height = 240;
		}

		override public function getName():String {
			return "AdditionalSharedNotesWindow_" + noteId;
		}

		public function set noteName(name:String):void {
			this._noteName = name;
		}

		override public function onCreationComplete():void {
			super.onCreationComplete();

			LOGGER.debug("AdditionalSharedNotesWindow: [2] in-constructor additional notes " + noteId);

			closeBtn.addEventListener(MouseEvent.CLICK, onCloseBtnClick);
		}

		private function onCloseBtnClick(e:MouseEvent):void {
			var alert:Alert = Alert.show(
					ResourceUtil.getInstance().getString('bbb.sharedNotes.additionalNotes.closeWarning.message'),
					ResourceUtil.getInstance().getString('bbb.sharedNotes.additionalNotes.closeWarning.title'),
					Alert.YES | Alert.NO, parent as Sprite, alertClose, null, Alert.YES);
			e.stopPropagation();
		}

		private function alertClose(e:CloseEvent):void {
			if (e.detail == Alert.YES) {
				showCloseButton = false;

				LOGGER.debug("AdditionalSharedNotesWindow: requesting to destroy notes " + noteId);
				var destroyNotesEvent:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.DESTROY_ADDITIONAL_NOTES_REQUEST_EVENT);
				destroyNotesEvent.payload.notesId = noteId;
				_dispatcher.dispatchEvent(destroyNotesEvent);
			}
		}

		override protected function updateTitle():void {
			if (_noteName.length > 0) {
				title = _noteName;
			} else {
				title = ResourceUtil.getInstance().getString('bbb.sharedNotes.title') + " " + noteId;
			}
		}
	}
}
