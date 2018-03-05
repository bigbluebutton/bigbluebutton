package org.bigbluebutton.air.voice.views {
	import spark.components.Button;
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.components.VGroup;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalAlign;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	
	public class JoinAudioView extends NoTabView {
		
		[Bindable]
		public var listenOnlyButton:Button;
		
		[Bindable]
		public var microphoneButton:Button;
		
		private var helpLabel:Label;
		
		private var listenLabel:Label;
		
		private var micLabel:Label;
		
		private var _buttonsGroup:HGroup;
		
		private var _micGroup:VGroup;
		
		private var _listenGroup:VGroup;
		
		public function JoinAudioView() {
			super();
			
			var vLayout:VerticalLayout = new VerticalLayout();
			vLayout.horizontalAlign = HorizontalAlign.CENTER;
			vLayout.verticalAlign = VerticalAlign.MIDDLE;
			layout = vLayout;
			
			var mainGroup:VGroup = new VGroup();
			mainGroup.verticalAlign = VerticalAlign.MIDDLE;
			mainGroup.horizontalAlign = HorizontalAlign.CENTER;
			mainGroup.percentHeight = 100;
			this.addElement(mainGroup);
			
			helpLabel = new Label();
			helpLabel.text = "How do you want to join the audio?";
			mainGroup.addElement(helpLabel);
			
			_buttonsGroup = new HGroup();
			_buttonsGroup.verticalAlign = VerticalAlign.MIDDLE;
			mainGroup.addElement(_buttonsGroup);
			
			_micGroup = new VGroup();
			_micGroup.horizontalAlign = HorizontalAlign.CENTER;
			_buttonsGroup.addElement(_micGroup);
			
			microphoneButton = new Button();
			_micGroup.addElement(microphoneButton);
			
			micLabel = new Label();
			micLabel.text = "Microphone"
			_micGroup.addElement(micLabel);
			
			_listenGroup = new VGroup();
			_micGroup.horizontalAlign = HorizontalAlign.CENTER;
			_buttonsGroup.addElement(_listenGroup);
			
			listenOnlyButton = new Button();
			_listenGroup.addElement(listenOnlyButton);
			
			listenLabel = new Label();
			listenLabel.text = "Listen Only";
			_listenGroup.addElement(listenLabel);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
		
			helpLabel.styleName = "audioHelpLabel";
			micLabel.styleName = "audioButtonLabel";
			listenLabel.styleName = "audioButtonLabel";
			_buttonsGroup.gap = getStyle("gap");
			listenOnlyButton.styleName = "audioButtonStyle menuButton icon-listen";
			microphoneButton.styleName = "audioButtonStyle menuButton icon-audio-on";
		}
	}
}
