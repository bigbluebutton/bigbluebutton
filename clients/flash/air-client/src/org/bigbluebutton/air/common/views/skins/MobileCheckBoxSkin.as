package org.bigbluebutton.air.common.views.skins {
	import spark.skins.ios7.CheckBoxSkin;
	
	import org.bigbluebutton.air.common.views.skins.assets.CheckBoxUp;
	import org.bigbluebutton.air.common.views.skins.assets.CheckBoxUpSelected;
	import org.bigbluebutton.air.common.views.skins.assets.CheckBoxUpSymbolSelected;
	
	public class MobileCheckBoxSkin extends CheckBoxSkin {
		public function MobileCheckBoxSkin() {
			super();
			
			upIconClass = CheckBoxUp;
			upSymbolIconClass = null;
			upSelectedIconClass = CheckBoxUpSelected;
			upSymbolIconSelectedClass = CheckBoxUpSymbolSelected;
			
			downIconClass = CheckBoxUp;
			downSymbolIconClass = null
			downSelectedIconClass = CheckBoxUp;
			downSymbolIconSelectedClass = null;
		}
	}
}
