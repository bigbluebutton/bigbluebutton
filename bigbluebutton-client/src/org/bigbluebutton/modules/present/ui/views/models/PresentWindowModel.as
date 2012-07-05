package org.bigbluebutton.modules.present.ui.views.models
{
    import org.bigbluebutton.util.i18n.ResourceUtil;
    import org.bigbluebutton.common.Images;
    
    public class PresentWindowModel
    {
        [Bindable]
        public var presenter:Boolean = true;
        
        [Bindable] 
        public var presentationTitle:String = "";
        
        [Bindable]
        public var backBtnEnabled:Boolean = true;
        
        [Bindable]
        public var forwardBtnEnabled:Boolean = true;        
        
        
        private var images:Images = new Images();
        [Bindable] public var uploadIcon:Class = images.upload;
        [Bindable] public var forwardIcon:Class = images.forward;
        [Bindable] public var backwardIcon:Class = images.backward;
        [Bindable] public var magnifierIcon:Class = images.magnifier;
        [Bindable] public var fitToWidthIcon:Class = images.fitToWidth;
        [Bindable] public var fitToPageIcon:Class = images.fitToPage;
        
        [Bindable]
        public var uploadPresBtnToolTip:String = ResourceUtil.getInstance().getString('bbb.presentation.uploadPresBtn.toolTip');
        
        [Bindable]
        public var backBtnToolTip:String = ResourceUtil.getInstance().getString('bbb.presentation.backBtn.toolTip');
        
        [Bindable]
        public var slideNumLblToolTip:String = ResourceUtil.getInstance().getString('bbb.presentation.slideNumLbl.toolTip');

        [Bindable]
        public var forwardBtnToolTip:String = ResourceUtil.getInstance().getString('bbb.presentation.forwardBtn.toolTip');
        
        [Bindable]
        public var fitToWidthToolTip:String = ResourceUtil.getInstance().getString('bbb.presentation.fitToWidth.toolTip');
        
        [Bindable]
        public var fitToPageToolTip:String = ResourceUtil.getInstance().getString('bbb.presentation.fitToPage.toolTip');
        

    }
}