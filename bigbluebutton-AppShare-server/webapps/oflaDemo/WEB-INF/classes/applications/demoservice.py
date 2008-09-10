"""
demoservice.py - a translation into Python of the ofla demo application, a Red5 example.

@author The Red5 Project (red5@osflash.org)
@author Joachim Bauch (jojo@struktur.de)
"""

from java.io import File
from java.lang import System
from java.text import SimpleDateFormat
from java.util import Date
from java.util import HashMap

from org.red5.server.api import Red5
from org.red5.server.webapp.oflaDemo import IDemoService

class DemoService(IDemoService):
    
    def getListOfAvailableFLVs(self):
        """Return list of .flv files that can be streamed."""
        scope = Red5.getConnectionLocal().getScope()
        serverRoot = System.getProperty('red5.root')
        filesMap = HashMap()
        try:
            print 'Getting the FLV files'
            flvs = scope.getResources("streams/*.flv")
            for file in flvs:
                fso = File(serverRoot + '/webapps/oflaDemo' + file.path)
                flvName = fso.getName()
                flvBytes = 0
                if hasattr(fso, 'length'):
                    flvBytes = fso.length()
                else:
                    print 'Length not found'
                
                lastMod = '0'
                if hasattr(fso, 'lastModified'):
                    lastMod = self.formatDate(Date(fso.lastModified()))
                else:
                    log.debug('Last modified not found')

                print 'FLV Name:', flvName
                print 'Last modified date:', lastMod
                print 'Size:', flvBytes
                print '-------'
                
                fileInfo = HashMap(3);
                fileInfo["name"] = flvName
                fileInfo["lastModified"] = lastMod
                fileInfo["size"] = flvBytes
                filesMap[flvName] = fileInfo
        except Exception, e:
            print 'Error in getListOfAvailableFLVs:', e
        
        return filesMap;

    def formatDate(self, date):
        return SimpleDateFormat("dd/MM/yyyy hh:mm:ss").format(date)

def getInstance(*args):
    print 'Arguments:', args
    return DemoService()
