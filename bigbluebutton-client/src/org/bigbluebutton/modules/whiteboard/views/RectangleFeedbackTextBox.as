package org.bigbluebutton.modules.whiteboard.views
{
    import flash.display.Sprite;
    
    public class RectangleFeedbackTextBox extends Sprite
    {
        public function RectangleFeedbackTextBox()
        {
            super();
        }
        
        public function draw(startX:Number, startY:Number, width:Number, height:Number):void {
            graphics.clear();
            graphics.lineStyle(1, 0x0)
            graphics.drawRect(0, 0, width, height);
            x = startX;
            y = startY;
        }
        
        public function clear():void {
            graphics.clear();
        }
    }
}