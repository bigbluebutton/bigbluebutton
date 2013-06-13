package org.bigbluebutton.core

object Role extends Enumeration {
	type Role = Value
	val MODERATOR, VIEWER = Value
}

import Role._
class User(val intUserID: String, val extUserID: String, val name: String, role: Role) {
     
  private var _presenter:Boolean = false;
  

  def isPresenter():Boolean = {
    return _presenter;
  }
  
  def becomePresenter():Unit = {
    _presenter = true
  }
  
  def unbecomePresenter():Unit = {
    _presenter = false;
  }
}