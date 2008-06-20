/*
 * demoservice.js - a translation into JavaScript of the ofla demo DemoService class, a Red5 example.
 *
 * @see http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference
 * @author Paul Gregoire
 */

importPackage(Packages.org.red5.server.api);
importPackage(Packages.org.springframework.core.io);
importPackage(Packages.org.apache.commons.logging);

importClass(java.io.File);
importClass(java.util.HashMap);
importClass(java.text.SimpleDateFormat);
importClass(Packages.org.springframework.core.io.Resource);
importClass(Packages.org.red5.server.api.Red5);

function DemoService() {
	this.className = 'DemoService';
	log.debug('DemoService init');

    if (supa) {
        DemoService.prototype = supa;
    }

	getListOfAvailableFLVs = function() {
		log.debug('getListOfAvailableFLVs');
		log.debug('Con local: ' + Red5.getConnectionLocal());
		var scope = Red5.getConnectionLocal().getScope();
		log.debug('Scope: ' + scope);
		var filesMap = new HashMap(3);
		var fileInfo;
		try {
			print('Getting the FLV files');
			//var flvs = scope.getResources("streams/*.flv"); //Resource[]
			var serverRoot = java.lang.System.getProperty('red5.root');
			log.debug('Red5 root: ' + serverRoot);
			var streamsDir = new File(serverRoot + '/webapps/oflaDemo/streams/');
			var flvs = streamsDir.listFiles();
			log.debug('Flvs: ' + flvs);
			log.debug('Number of flvs: ' + flvs.length);
			for (var i=0;i<flvs.length;i++) {
				var file = flvs[i];
				log.debug('file: ' + file);
				log.debug('java.io.File type: ' + (file == typeof(java.io.File)));
				log.debug('js type: ' + typeof(file));
				log.debug('file path: ' + file.path);
				log.debug('file url: ' + file.URL);
				//var fso = new File(serverRoot + '/webapps/oflaDemo' + file.path);
				var fso = file;
				var flvName = fso.getName();
				if (flvName.indexOf('.flv') < 1) {
				    continue;
				}
				log.debug('flvName: ' + flvName);
				log.debug('exist: ' + fso.exists());
				log.debug('readable: ' + fso.canRead());
				//loop thru props
				var flvBytes = 0;
				if ('length' in fso) {
					flvBytes = fso.length();
				} else {
					log.warn('Length not found');
				}
				log.debug('flvBytes: ' + flvBytes);
				var lastMod = '0';
				if ('lastModified' in fso) {
					lastMod = this.formatDate(new java.util.Date(fso.lastModified()));
				} else {
					log.debug('Last modified not found');
				}

				print('FLV Name: ' + flvName);
				print('Last modified date: ' + lastMod);
				print('Size: ' + flvBytes);
				print('-------');

				fileInfo = new HashMap(3);
				fileInfo.put("name", flvName);
				fileInfo.put("lastModified", lastMod);
				fileInfo.put("size", flvBytes);
				filesMap.put(flvName, fileInfo);
			}
		} catch (e) {
			log.warn('Error in getListOfAvailableFLVs: ' + e);
		}
		return filesMap;
	};

    formatDate = function(date) {
    	//java 'thread-safe' date formatting
    	return new SimpleDateFormat("dd/MM/yyyy hh:mm:ss").format(date);
    };

    toString = function(string) {
    	return 'Javascript:DemoService';
    };

    doesNotUnderstand = function(name) {
        print("Unknown method called: " + name + "\n");
        for (n in context){
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

DemoService.__has__ = function(name) {
    println('Has: '+name);
    return true;
};

DemoService.__get__ = function(name) {
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

DemoService();
