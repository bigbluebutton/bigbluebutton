package org.bigbluebutton.modules.whiteboard.models
{
  import mx.collections.ArrayCollection;

  public class Whiteboard
  {
    private var _id:String;
    private var _annotations:ArrayCollection = new ArrayCollection();
    
    public function Whiteboard(id:String) {
      _id = id;
    }
    
    public function get id():String {
      return _id;
    }
    
    public function addAnnotation(annotation:Annotation):void {
      _annotations.addItem(annotation);
    }
    
    public function updateAnnotation(annotation:Annotation):void {
      var a:Annotation = getAnnotation(annotation.id);
      if (a != null) {
        a.annotation = annotation.annotation;
      } else {
        addAnnotation(annotation);
      }
    }
    
    public function undo():void {
      _annotations.removeItemAt(_annotations.length - 1);
    }
    
    public function clear():void {
      _annotations.removeAll();
    }
       
    public function getAnnotations():Array {
      var a:Array = new Array();
      for (var i:int = 0; i < _annotations.length; i++) {
        a.push(_annotations.getItemAt(i) as Annotation);
      }
      return a;
    }
    
    public function getAnnotation(id:String):Annotation {
      for (var i:int = 0; i < _annotations.length; i++) {
        if ((_annotations.getItemAt(i) as Annotation).id == id) {
          return _annotations.getItemAt(i) as Annotation;
        }
      }
      
      return null;
    }
  }
}