package org.bigbluebutton.modules.whiteboard.business.shapes
{
    import flash.display.Bitmap;
    import flash.display.BitmapData;
    import flash.display.DisplayObject;
    import flash.display.PixelSnapping;
    import flash.display.Sprite;
    import flash.geom.Matrix;
    import flash.text.TextField;
    
    import mx.controls.Image;
    import mx.controls.Text;

    public class Text extends DrawObject
    {
        public function Text(segment:Array, color:uint, thickness:uint)
        {
            super(DrawObject.TEXT, segment, color, thickness);           
        }
        
        /**
         * Gets rid of the unnecessary data in the segment array, so that the object can be more easily passed to
         * the server 
         * 
         */		
        override protected function optimize():void{

        }
        
        private var resizeCount:int = 1;
        private var txtSize:uint = 10;
        private var oldParentWidth:Number = 0;
        private var oldParentHeight:Number = 0;
        
        private var tb:TextBox = null; 
        private var bitmapdata:BitmapData;
        private var scale:uint = 1;
        private var fontSize:uint = 18;
        
        override public function makeShape(parentWidth:Number, parentHeight:Number):void {
            var newShape:Sprite = new Sprite();
            newShape.x = denormalize(getShapeArray()[0], parentWidth);
            newShape.y = denormalize(getShapeArray()[1], parentHeight);
                        
            if (oldParentHeight == 0 && oldParentWidth == 0) {
                fontSize = 18;
                oldParentHeight = parentHeight;
                oldParentWidth = parentWidth;
                
            } else {
                fontSize = (parentHeight/oldParentHeight) * 18;
               // scale *= 1;
            }
   
            ;
            resizeCount++;
 //           newShape.width = 200;
 //           newShape.height = 50;
  //         txtSize = (parentWidth/parentHeight) * 18;
  //          if (tb == null) {
                tb = new TextBox(fontSize);
    //            tb.width = 400 + resizeCount;
    //             tb.height = 20 + resizeCount;
    //            tb.htmlText = "Hello World! " + resizeCount;
                var txt:mx.controls.Text = new mx.controls.Text();
                txt.text = "Foo Bar!";
                txt.width = 200;
                bitmapdata = new BitmapData(tb.width, tb.height, false, 0x000000FF);
                bitmapdata.draw(tb);
   //         }
//            tb.height = resizeCount * 2;
//            tb.width = resizeCount * 2;
           newShape.addChild(tb);
            
/*            
//            var textfield:TextField = new TextField();
//            textfield.text = "text";
///            textfield.width *= 1.1;
//            textfield.height *= 1.1;
*/
            
/*                                 
            var image:Image = new Image();
            image.load(new Bitmap(bitmapdata, PixelSnapping.NEVER, true));
            
            var scaledWidth:uint = bitmapdata.width; //+ resizeCount; // * scale;
   //         var scaledHeight:uint = bitmapdata.height; //+ resizeCount; // * scale;
            
   //         image.width = scaledWidth;
  //          image.height = scaledHeight;
            
            var scaledBitmapData:BitmapData = new BitmapData(scaledWidth, scaledHeight, true, 0x00FF0000);
            scaledBitmapData.draw(image.content); 
            
            newShape.graphics.beginBitmapFill(scaledBitmapData, null, false, true);
            newShape.graphics.drawRect(0, 0, scaledBitmapData.width, scaledBitmapData.width);
            newShape.graphics.endFill();
            image = null;
*/            
/*          
            var mat:Matrix = new Matrix();
            mat.scale(200, 20);
            var bmpd_draw:BitmapData = new BitmapData(200, 20, false);
            bmpd_draw.draw(bitmapdata, mat, null, null, null, true);
            
  //          var scaledBitmapData:BitmapData =  bitmapScaled(tb, 200,  20);  
           newShape.graphics.beginBitmapFill(bmpd_draw, null, false, true);
            newShape.graphics.drawRect(0, 0, bmpd_draw.width, bmpd_draw.width);
            newShape.graphics.endFill();
*/
            
            
 //           image = null;
            
            
            _shape = newShape;
        }
        
        private function bitmapScaled(do_source:DisplayObject, thumbWidth:Number, thumbHeight:Number):BitmapData {
            var mat:Matrix = new Matrix();
            mat.scale(thumbWidth/do_source.width, thumbHeight/do_source.height);
            var bmpd_draw:BitmapData = new BitmapData(thumbWidth, thumbHeight, false);
            bmpd_draw.draw(do_source, mat, null, null, null, true);
            return bmpd_draw;
        }
    }
    

}