package org.bigbluebutton.modules.whiteboard.business.shapes
{
    import flash.text.TextField;
    import flash.text.TextFieldAutoSize;
    import flash.text.TextFieldType;
    import flash.text.TextFormat;
    
    public class TextBox extends TextField
    {
        function TextBox(size:uint)
        {
            super();
       //     defaultTextFormat = new TextFormat("_sans", size, 0xFFFFFF);
     //       background = true;
     //       backgroundColor = 0xFF88FF;
            multiline = false;
            autoSize = TextFieldAutoSize.LEFT;
            type = TextFieldType.INPUT;
           htmlText = "Hello World! ";
            selectable = true;
            setTextFormat(new TextFormat("_sans", size, 0xFFFFFF));          
        }
    }
}