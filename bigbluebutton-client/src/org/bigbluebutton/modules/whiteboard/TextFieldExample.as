package org.bigbluebutton.modules.whiteboard {
    import flash.display.DisplayObject;
    import flash.display.Sprite;
    import flash.events.Event;
    import flash.events.KeyboardEvent;
    import flash.events.TextEvent;
    import flash.text.TextField;
    import flash.text.TextFieldAutoSize;
    import flash.text.TextFieldType;
    import flash.text.TextFormat;
    import flash.ui.Keyboard;
    
    import mx.core.UIComponent;
    
    import org.bigbluebutton.common.LogUtil;
    
    
    public class TextFieldExample extends UIComponent {
        private var label:TextField;
        private var labelText:String = "Hello world and welcome to the show.";
        
        public function TextFieldExample() {
            configureLabel();
            setLabel(labelText);

        }
        
        public function setLabel(str:String):void {
            label.text = str;
        }
        
        private function configureLabel():void {
            label = new TextField();
            label.autoSize = TextFieldAutoSize.LEFT;
            label.type = TextFieldType.INPUT;
            label.background = true;
            label.border = true;
            
            label.addEventListener(TextEvent.TEXT_INPUT, textInputHandler);
            label.addEventListener(KeyboardEvent.KEY_UP, onKeyUp);
            label.addEventListener(Event.CHANGE, changeHandler);
            label.addEventListener(flash.events.FocusEvent.FOCUS_OUT, onFocusOut);
            
            var format:TextFormat = new TextFormat();
            format.font = "_sans";
            format.color = 0xFF0000;
            format.size = 18;
            format.underline = true;
            
            label.defaultTextFormat = format;
            
            addChild(label);
        }
        
        private function onFocusOut(e:Event):void {
            LogUtil.debug("Focust out tf=" + label.text);           
        }

        private function changeHandler(e:Event):void {
            LogUtil.debug("tf=" + label.text);           
        }
        
        private function onKeyUp(event:KeyboardEvent):void {	
            switch (event.keyCode) {
                case Keyboard.ENTER:
                    LogUtil.debug("Enter Key Pressed.");
                    break; 
                default:
                   // LogUtil.debug("Capturing text: " + event.keyCode);
            }
        }    
        
        public function textInputHandler(event:TextEvent):void
        {
  //          LogUtil.debug("TEXT EVENT = " + event.text);
        }
    }
}