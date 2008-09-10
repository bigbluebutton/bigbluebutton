
import org.red5.server.adapter.ApplicationAdapter
import org.red5.server.api.IConnection
import org.red5.server.api.IScope
import org.red5.server.api.stream.IPlayItem
import org.red5.server.api.stream.IServerStream
import org.red5.server.api.stream.IStreamCapableConnection
import org.red5.server.api.stream.support.SimpleBandwidthConfigure
import org.red5.server.api.stream.support.SimplePlayItem
import org.red5.server.api.stream.support.StreamUtils

/**
 * application.groovy - a translation into Groovy of the ofla demo application, a red5 example.
 *
 * @author Paul Gregoire
 */
public class Application extends ApplicationAdapter {
	def appScope
	def serverStream

	public Application() {
		println "Groovy ctor"
	}

	public void main(s) {
		println "Groovy main"
		appStart(null)
		appConnect(null, null)
		toString()
	}

	public boolean appStart(app) {
		println "Groovy appStart"
		appScope = app
		return true
	}

	public boolean appConnect(conn, params) {
		println "Groovy appConnect"
		measureBandwidth(conn)
		if (conn instanceof IStreamCapableConnection)  {
			def streamConn = conn
			def sbc = new SimpleBandwidthConfigure()
			sbc.setMaxBurst(8388608)
			sbc.setBurst(8388608)
			sbc.setOverallBandwidth(8388608)
			streamConn.setBandwidthConfigure(sbc)
		}
		return super.appConnect(conn, params)
	}

	public void appDisconnect(conn) {
		println "Groovy appDisconnect"
		if (appScope == conn.scope && serverStream != null)  {
			serverStream.close
		}
		super.appDisconnect(conn)
	}
	
	public void toString() {
		println "Groovy toString"
	}	
	
}
