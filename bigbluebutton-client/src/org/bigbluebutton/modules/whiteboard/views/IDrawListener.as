package org.bigbluebutton.modules.whiteboard.views
{
    import org.bigbluebutton.modules.whiteboard.views.models.WhiteboardTool;

    public interface IDrawListener
    {
        function onMouseDown(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void;
        function onMouseMove(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void;
        function onMouseUp(mouseX:Number, mouseY:Number, tool:WhiteboardTool):void;
        function ctrlKeyDown(down:Boolean):void;
    }
}