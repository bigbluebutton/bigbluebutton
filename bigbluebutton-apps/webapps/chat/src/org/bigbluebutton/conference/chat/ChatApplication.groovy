package org.bigbluebutton.conference.chat

import org.red5.server.adapter.IApplicationimport org.red5.server.api.IConnectionimport org.red5.server.api.IClientimport org.red5.server.api.IScopeimport org.red5.server.adapter.ApplicationAdapterimport org.red5.server.api.Red5
public class ChatApplication implements IApplication {
	
	private ApplicationAdapter application;
	def  static String APP = "ChatApplication"
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		println "${APP}:appConnect"
		return false;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		println "${APP}:appDisconnect"
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		println "${APP}:appJoin ${scope.name}"
		return false;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		println "${APP}:appLeave ${scope.name}"
	}

	@Override
	public boolean appStart(IScope scope) {
		println "${APP}:appStart ${scope.name}"
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		println "${APP}:appStop ${scope.name}"
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		println "${APP}:roomConnect"
		connection.setAttribute("conference", 12345)
		return false;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		println "${APP}:roomDisconnect"

	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		println "${APP}:roomJoin ${scope.name} - ${scope.parent.name}"
		println "${APP}: " + Red5.connectionLocal.getAttribute("conference")
		return false;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		println "${APP}:roomLeave ${scope.name}"

	}

	@Override
	public boolean roomStart(IScope scope) {
		println "${APP}:roomStart ${scope.name}"
		return false;
	}

	@Override
	public void roomStop(IScope scope) {
		println "${APP}:roomStop ${scope.name}"
	}

	public void setApplicationAdapter(ApplicationAdapter a) {
		application = a;
		application.addListener(this);
	}
}
