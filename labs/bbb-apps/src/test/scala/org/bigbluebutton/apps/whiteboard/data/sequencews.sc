package org.bigbluebutton.apps.whiteboard.data

import org.bigbluebutton.apps.users.data.UserIdAndName



object sequencews1 {
  val nums = Seq(1,2,3,4,5)                       //> nums  : Seq[Int] = List(1, 2, 3, 4, 5)
  
  val isEven : PartialFunction[Int, Int] = { case x if x % 2 == 0 => x}
                                                  //> isEven  : PartialFunction[Int,Int] = <function1>
  nums collect isEven                             //> res0: Seq[Int] = List(2, 4)
  
  val user = UserIdAndName("me", "me")            //> user  : org.bigbluebutton.apps.users.data.UserIdAndName = UserIdAndName(me,m
                                                  //| e)
  
  val f = Foo1("bar")                             //> f  : org.bigbluebutton.apps.whiteboard.data.Foo1 = Foo1(bar)
  var desc = new ShapeDescriptor("shape1", "cor1", ShapeTypes.SCRIBBLE, user, 0)
                                                  //> desc  : org.bigbluebutton.apps.whiteboard.data.ShapeDescriptor = ShapeDescri
                                                  //| ptor(shape1,cor1,SCRIBBLE,UserIdAndName(me,me),0)
//  val isShape : PartialFunction[Shape, Option[Shape]] = {
//                    case x @ Scribble(desc, _, _) => if (desc.id == x.descriptor.id) Some(x) else None
//                    }
  

}