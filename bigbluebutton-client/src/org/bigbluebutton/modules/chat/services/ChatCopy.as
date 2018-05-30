package org.bigbluebutton.modules.chat.services
{
  import flash.system.System;
  
  import org.bigbluebutton.common.toaster.Toaster;
  import org.bigbluebutton.common.toaster.message.ToastType;
  import org.bigbluebutton.modules.chat.events.ChatCopyEvent;
  import org.bigbluebutton.modules.chat.model.ChatConversation;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class ChatCopy
  {
    public function copyAllText(e:ChatCopyEvent):void {
      var chat:ChatConversation = e.chatMessages;
      System.setClipboard(chat.getAllMessageAsString());
	  Toaster.toast(ResourceUtil.getInstance().getString('bbb.chat.copy.complete'), ToastType.SUCCESS);
    }
  }
}
