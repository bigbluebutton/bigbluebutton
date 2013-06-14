package org.bigbluebutton.core

import org.bigbluebutton.core.api.UserVO
import org.bigbluebutton.core.api.Role._

class User(val intUserID: String, val extUserID: String, val name: String, role: Role) {
     
  private var _presenter:Boolean = false;
  var raiseHand:Boolean = false;
  var hasStream:Boolean = false;

  def isPresenter():Boolean = {
    return _presenter;
  }
  
  def becomePresenter():Unit = {
    _presenter = true
  }
  
  def unbecomePresenter():Unit = {
    _presenter = false;
  }
  
  def toUserVO():UserVO = {
    new UserVO(intUserID, extUserID, name, role.toString, raiseHand, isPresenter, hasStream)
  }
}