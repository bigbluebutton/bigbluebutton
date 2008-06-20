/*
 * main.js - a translation into JavaScript of the ofla demo Application class, a Red5 example.
 *
 * @author Paul Gregoire
 */

importPackage(Packages.org.red5.server);
importPackage(Packages.org.red5.server.api);
importPackage(Packages.org.red5.server.api.stream);
importPackage(Packages.org.red5.server.api.stream.support);
importPackage(Packages.org.apache.commons.logging);

importClass(Packages.org.springframework.core.io.Resource);
importClass(Packages.org.red5.server.api.Red5);
importClass(Packages.org.red5.server.api.IScope);
importClass(Packages.org.red5.server.api.IScopeHandler);

var IStreamCapableConnection = Packages.org.red5.server.api.stream.IStreamCapableConnection;

function Application() {
	this.appScope = undefined;
	this.serverStream = undefined;
	this.className = 'Application';
	log.debug('Application init');

	if (supa) {
        Application.prototype = supa;
        log.debug('Instance of '+supa);
    }

	appStart = function(app) {
		if (log.isDebugEnabled) {
			print('Javascript appStart\n');
		}
		this.appScope = app;
		return true;
	};

	appConnect = function(conn, params) {
		log.error('Javascript appConnect');
		if (log.isDebugEnabled) {
			print('Javascript appConnect\n');
		}
		measureBandwidth(conn);
		if (conn == typeof(IStreamCapableConnection)) {
			var streamConn = conn;
			var sbc = new Packages.org.red5.server.api.stream.support.SimpleBandwidthConfigure();
			sbc.setMaxBurst(8388608);
			sbc.setBurst(8388608);
			sbc.setOverallBandwidth(2097152);
			streamConn.setBandwidthConfigure(sbc);
		}
		return this.__proto__.appConnect(conn, params);
	};

	appDisconnect = function(conn) {
		if (log.isDebugEnabled) {
			print('Javascript appDisconnect\n');
		}
		if (this.appScope == conn.getScope() && this.serverStream)  {
			this.serverStream.close();
		}
		return this.__proto__.appDisconnect(conn);
	};

	toString = function(string) {
		return 'Javascript:Application\n';
	};

	start = function(app) {
		print('Javascript start\n');	
		return appStart(app);
	};
	
	connect = function(conn, scope, params) {
		print('Javascript connect\n');	
		return this.supa.connect(conn, scope, params);
	};	
	
	join = function(client, scope) {
		print('Javascript join\n');	
		return this.supa.join(client, scope);
	};	

	disconnect = function(conn, scope) {
		print('Javascript disconnect\n');	
		return this.supa.disconnect(conn, scope);
	};	

    leave = function(client, scope) {
		print('Javascript leave\n');	
		this.supa.leave(client, scope);
	};	
	
	serviceCall = function(conn, call) {
		print('Javascript serviceCall\n');	
		return this.supa.serviceCall(conn, call);	    
	};

    doesNotUnderstand = function(name) {
        print("Unknown method called: " + name + "\n");
        for (n in context) {
            print('Context: '+n);
        }
        if (name in this.__proto__) {
            if (arguments.length > 0) {
                return this.__proto__[name](arguments);
            } else {
                return this.__proto__[name]();
            }
        }
    };

}

Application.__has__ = function(name) {
    println('Has: '+name);
    return true;
};

Application.__get__ = function(name) {
    println('Get: '+name);
    if (name in this) {
        return this[name];
    } else if (typeof(this['doesNotUnderstand']) == 'function') {
        return function() {
            return this.doesNotUnderstand(name, arguments);
        }
    } else {
        return undefined;
    }
};

Application();








