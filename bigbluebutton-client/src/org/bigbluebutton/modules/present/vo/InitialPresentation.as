package org.bigbluebutton.modules.present.vo
{
    import mx.collections.ArrayCollection;

    public class InitialPresentation
    {
        public var hasPresenter:Boolean = false;
        public var xOffset:Number = 0;;
        public var yOffset:Number = 0;
        public var widthRatio:Number = 100;
        public var heightRatio:Number = 100;
        public var presentations:ArrayCollection = new ArrayCollection();
        public var sharing:Boolean = false;
        public var currentPage:uint = 0;
        public var presentationName:String;
        
        public function toString():String {
            return "hasPresenter=" + hasPresenter + ",presentationName=" + presentationName + ",sharing=" + sharing + "]";
        }
    }
}