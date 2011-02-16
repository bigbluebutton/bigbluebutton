import os, getopt, sys
import shutil
from lxml.builder import E
from lxml import etree
import time

def usage():
    print ' -------------------------------------------------------------------------'
    print ' '
    print ' Usage:'
    print ' publish.py -m [meetingid] -i [ingest dir] -p [publish  dir]'
    print ' '
    print ' h, --help                   Print this'
    print ' m, --meeting-id             The id of the meeting'
    print ' i, --ingest-dir             The location of the ingest dir'
    print ' p, --publish-dir            The location of the publish dir'
    print ' -------------------------------------------------------------------------'

def printUsageHelp():
    usage()
    sys.exit(2)

def copy_files_to_publish_dir(meetingId, ingestDir, publishDir):   
    '''
        Copy all files from the archive directory to the ingest directory in preparation for processing.
    '''    
    if (os.path.isdir(publishDir) is False):
        os.makedirs(publishDir)                
    shutil.copytree(ingestDir + "/" + meetingId, publishDir + "/" + meetingId)

def generate_index_html(publishDir, playbackHost):   
    '''
        Copy all audio recordings and presentations into the archive directory.
    '''
    html = page = (
        E.html(
            E.head(
                E.title("List of recordings"),
                    E.body(
                        E.h1('List of recordings!')
                    )
                )
            )
        )
    
            
    dirList = os.listdir(publishDir)
    ctimeDict = {}
    ctimes = []
    for fname in dirList:
        if (os.path.isdir(publishDir + "/" + fname)):
            tree = etree.parse(publishDir + "/" + fname + '/events.xml')
            r = tree.xpath('/events/head/title')
            title = r[0].text
            print r[0].text
            ctime = os.path.getctime(publishDir + "/" + fname)
            ctimes.append(ctime)
            link = "http://" + playbackHost + "/playback/playback.html?meetingId=" + fname
            ctimeDict[ctime] = title, fname, link
            
    ctimes.sort()
    ctimes.reverse()
    
    for c in ctimes:
        lnk = ctimeDict[c]
        ev = E.p(time.ctime(c), E.a(lnk[0], href=lnk[2]))
        page.append(ev)
                            
    print(etree.tostring(page, pretty_print=True))

    targetFile = publishDir + "/index.html"
    f = open(targetFile, 'w')
    f.write(etree.tostring(page, pretty_print=True))
    f.close() 
    
    
def main():
    meetingId = ""
    ingestDir = ""
    publishDir = ""
    playbackHost = ""
    
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hm:i:p:k:", ["help", "meeting-id=", "ingest-dir=", "publish-dir=", "playback-host="])
    except getopt.GetoptError, err:
        # print help information and exit:
        print str(err)
        usage()
        sys.exit(2)
    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit()
        elif o in ("-m", "--meeting-id"):
            meetingId = a
        elif o in ("-i", "--ingest-dir"):
            ingestDir = a
        elif o in ("-p", "--publish-dir"):
            publishDir = a
        elif o in ("-k", "--playback-host"):
            playbackHost = a
        else:
            assert False, "unhandled option"
    
    printUsage = False
    if (meetingId == ""):
        print "Missing meeting id."
        printUsage = True
    if (ingestDir == ""):
        print "Missing ingest dir."
        printUsage = True
    if (publishDir == ""):
        print "Missing publish dir."
        printUsage = True
    if (playbackHost == ""):
        print "Missing playback host."
        printUsage = True        
    if (printUsage):
        printUsageHelp()
    
    copy_files_to_publish_dir(meetingId, ingestDir, publishDir)
    
    generate_index_html(publishDir, playbackHost)
    
if __name__ == "__main__":
    main()
