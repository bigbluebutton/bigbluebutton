package org.bigbluebutton.air.voice.views {
	
	import spark.components.Button;
	import spark.components.Label;
	import spark.components.ProgressBar;
	import spark.components.VGroup;
	import spark.layouts.HorizontalAlign;
	
	public class EchoTestViewBase extends VGroup {
		
		[Bindable]
		public var echoTestButton:Button;
		
		[Bindable]
		public var micLevelProgressBar:ProgressBar;
		
		[Bindable]
		public var yesButton:Button;
		
		[Bindable]
		public var noButton:Button;
		
		public var echoLabel:Label;
		
		private var echoValidationGroup:VGroup;
		
		private var echoButtonGroup:VGroup;
		
		public function EchoTestViewBase() {
			super();
			
			// Echo Button Group
			echoButtonGroup = new VGroup();
			echoButtonGroup.percentWidth = 100;
			echoButtonGroup.horizontalAlign = HorizontalAlign.CENTER;
			addElement(echoButtonGroup);
			
			micLevelProgressBar = new ProgressBar();
			micLevelProgressBar.percentWidth = 100;
			micLevelProgressBar.height = 40;
			micLevelProgressBar.styleName = "micLevelProgressBar";
			echoButtonGroup.addElement(micLevelProgressBar);
			
			echoTestButton = new Button();
			echoTestButton.label = "Start Echo Test";
			echoTestButton.percentWidth = 100;
			echoButtonGroup.addElement(echoTestButton);
			
			// Echo Validation Group
			echoValidationGroup = new VGroup();
			echoValidationGroup.percentWidth = 100;
			echoValidationGroup.horizontalAlign = HorizontalAlign.CENTER;
			addElement(echoValidationGroup);
			
			echoValidationGroup.visible = echoValidationGroup.includeInLayout = false;
			
			echoLabel = new Label();
			echoLabel.maxDisplayedLines = 5;
			echoLabel.styleName = "echoTestLabel";
			echoLabel.text = "This is a private echo test. Speak a few words. Did you hear audio?";
			//echoLabel.maxWidth = echoValidationGroup.width - 40;
			echoValidationGroup.addElement(echoLabel);
			
			yesButton = new Button();
			yesButton.label = "Yes";
			yesButton.percentWidth = 100;
			echoValidationGroup.addElement(yesButton);
			
			noButton = new Button();
			noButton.label = "No";
			noButton.percentWidth = 100;
			echoValidationGroup.addElement(noButton);
		}
		
		public function setTestingState(connected:Boolean):void {
			echoButtonGroup.visible = echoButtonGroup.includeInLayout = !connected;
			echoValidationGroup.visible = echoValidationGroup.includeInLayout = connected;
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			
			this.padding = getStyle("padding");
			echoButtonGroup.padding = getStyle("padding");
		}
	}
}
