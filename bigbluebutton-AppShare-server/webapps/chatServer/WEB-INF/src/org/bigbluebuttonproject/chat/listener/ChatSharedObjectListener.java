/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebuttonproject.chat.listener;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.red5.server.api.IAttributeStore;
import org.red5.server.api.so.ISharedObjectBase;
import org.red5.server.api.so.ISharedObjectListener;
import java.sql.Time;


/**
 * This class implements the interface ISharedObjectListener to be registered as listener of a SharedObject.
 * Whenever there is an event occurs on SharedObject, methods of this class are automatically called.
 * 
 * @author kajan85
 */

public class ChatSharedObjectListener implements ISharedObjectListener {
	
	/** chat log storage linked list. */
	private LinkedList buffer;
	//private int currentIndex =0;
	/** The chatlog size. */
	private int chatlogSize = 100;
	
	/**
	 * Instantiates a new chat shared object listener.
	 */
	public ChatSharedObjectListener(){
		
		buffer = new LinkedList();
	}
	
	
	//@Override
	/**
	 * @see org.red5.server.api.so.ISharedObjectListener#onSharedObjectClear(org.red5.server.api.so.ISharedObjectBase)
	 */
	public void onSharedObjectClear(ISharedObjectBase so) {
		// TODO Auto-generated method stub

	}

	//@Override
	/**
	 * @see org.red5.server.api.so.ISharedObjectListener#onSharedObjectConnect(org.red5.server.api.so.ISharedObjectBase)
	 */
	public void onSharedObjectConnect(ISharedObjectBase so) {
		// TODO Auto-generated method stub

	}

	//@Override
	/**
	 * @see org.red5.server.api.so.ISharedObjectListener#onSharedObjectDelete(org.red5.server.api.so.ISharedObjectBase, java.lang.String)
	 */
	public void onSharedObjectDelete(ISharedObjectBase so, String key) {
		// TODO Auto-generated method stub

	}

	//@Override
	/**
	 * @see org.red5.server.api.so.ISharedObjectListener#onSharedObjectDisconnect(org.red5.server.api.so.ISharedObjectBase)
	 */
	public void onSharedObjectDisconnect(ISharedObjectBase so) {
		// TODO Auto-generated method stub

	}

	
	/**
	 * Called when a shared object method call, newMessage() is sent using chatSO.
	 * The chat message is extracted from the parameters passed and stored in stringBuffer.
	 * 
	 * @param so chatSO SharedObject
	 * @param method method invoked
	 * @param params List of parameters passed to the method
	 */
	//@Override
	public void onSharedObjectSend(ISharedObjectBase so, String method,
			List params) {
		
	 	// newMessage method is called by client when sending new chat message
		// store chat message only when newMessage is called
		if(method.equals("receiveNewMessage")){
	
			if(buffer.size() == chatlogSize){
				buffer.removeFirst();
			} 
			
			int color = Integer.valueOf( params.get(2).toString() ).intValue();
			String hexColor = Integer.toHexString(color);
			
			//System.out.println("======================================================");
			//System.out.println("======================================================");
			//System.out.println("======================================================");
			//System.out.println("======================================================");
			//System.out.println(color+ " , " + hexColor);
			//buffer.addLast("<b>[" + (String)params.get(0) + " @ " + new Time(System.currentTimeMillis())+  "]</b> " + (String)params.get(1)+ "\n");
            buffer.addLast("<font color=\"#" + hexColor + "\"><b>[" + (String)params.get(0) +" @ "+ new Time(System.currentTimeMillis())+ "]</b> " + (String)params.get(1) + "</font>" + "\n");
		}

	}

	//@Override
	/**
	 * @see org.red5.server.api.so.ISharedObjectListener#onSharedObjectUpdate(org.red5.server.api.so.ISharedObjectBase, java.lang.String, java.lang.Object)
	 */
	public void onSharedObjectUpdate(ISharedObjectBase so, String key,
			Object value) {
		// TODO Auto-generated method stub

	}

	//@Override
	/**
	 * @see org.red5.server.api.so.ISharedObjectListener#onSharedObjectUpdate(org.red5.server.api.so.ISharedObjectBase, org.red5.server.api.IAttributeStore)
	 */
	public void onSharedObjectUpdate(ISharedObjectBase so,
			IAttributeStore values) {
		// TODO Auto-generated method stub

	}

	//@Override
	/**
	 * @see org.red5.server.api.so.ISharedObjectListener#onSharedObjectUpdate(org.red5.server.api.so.ISharedObjectBase, java.util.Map)
	 */
	public void onSharedObjectUpdate(ISharedObjectBase so,
			Map<String, Object> values) {
		// TODO Auto-generated method stub
 
	}
	
	/**
	 * To get the chat history stored in buffer linkedlist.
	 * 
	 * @return chat History
	 */
	public String getChatLog(){
		StringBuffer log = new StringBuffer();
		Object[] obj = buffer.toArray();
		 
		if(!buffer.isEmpty()) {
		
			for(int i = 0;i<buffer.size();i++){
				log.append(obj[i] + "");
			}
		} 
//		return "fake chatLog";
		return log.toString();
		
	}

}
