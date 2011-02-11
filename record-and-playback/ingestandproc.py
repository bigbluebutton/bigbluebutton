import os, getopt, sys
import shutil, subprocess, logging
from lxml import etree

LOGFILE = "ingest.log"

def usage():
    print ' -------------------------------------------------------------------------'
    print ' '
    print ' Ingest and process BigBlueButton Recordings'
    print ' '
    print ' Usage:'
    print ' archive.py -m test123 -a /var/freeswitch/meetings -p /var/bigbluebutton -r /var/bigbluebutton/archive'
    print ' '
    print ' h, --help                   Print this'
    print ' m, --meeting-id             The id of the meeting'
    print ' a, --audio-dir              The location of the audio recording'
    print ' p, --presentation-dir       The location of the presentations'
    print ' r, --archive-dir            The directory where the audio and presentation will be archived'
    print ' -------------------------------------------------------------------------'

def printUsageHelp():
    usage()
    sys.exit(2)
    
def main():
    meetingId = ""
    audioSrcDir = ""
    presentationSrcDir = ""
    archiveDir = ""
    redisHost = ""
    redisPort = 0
    ingestDir = ""
    publishDir = ""
    
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hm:a:p:r:e:o:i:b:", ["help", "meeting-id=", "audio-dir=", "presentation-dir=", "archive-dir=", "redis-host=", "redis-port=", "ingest-dir=", "publish-dir="])
    except getopt.GetoptError, err:
        print str(err)
        usage()
        sys.exit(2)
    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit()
        elif o in ("-m", "--meeting-id"):
            meetingId = a
        elif o in ("-a", "--audio-dir"):
            audioSrcDir = a
        elif o in ("-p", "--presentation-dir"):
            presentationSrcDir = a
        elif o in ("-r", "--archive-dir"):
            archiveDir = a
        elif o in ("-e", "--redis-host"):
            redisHost = a
        elif o in ("-o", "--redis-port"):
            redisPort = a
        elif o in ("-i", "--ingest-dir"):
            ingestDir = a
        elif o in ("-b", "--publish-dir"):
            publishDir = a
        else:
            assert False, "unhandled option"
    
    printUsage = False
    if (meetingId == ""):
        print "Missing meeting id."
        printUsage = True
    if (audioSrcDir == ""):
        print "Missing audio dir."
        printUsage = True
    if (presentationSrcDir == ""):
        print "Missing presentation dir."
        printUsage = True
    if (archiveDir == ""):
        print "Missing archive dir."
        printUsage = True
    if (redisHost == ""):
        print "Missing redis host."
        printUsage = True
    if (redisPort == 0):
        print "Missing redis port."
        printUsage = True        
    if (ingestDir == ""):
        print "Missing ingest dir."
        printUsage = True  
    if (publishDir == ""):
        print "Missing publishDir."
        printUsage = True  
    if (printUsage):
        printUsageHelp()

# python archive.py -m e0401b38-0ed1-4526-b7d0-50e28211c9c4 -a /var/freeswitch/meetings -p /var/bigbluebutton -r /var/bigbluebutton/archive
# python get-events.py -m e0401b38-0ed1-4526-b7d0-50e28211c9c4 -r localhost -p 6379 -a /var/bigbluebutton/archive
# python ingest.py -m e0401b38-0ed1-4526-b7d0-50e28211c9c4 -i /var/bigbluebutton/ingest -a /var/bigbluebutton/archive
# python process-audio.py -m e0401b38-0ed1-4526-b7d0-50e28211c9c4 -a /var/bigbluebutton/ingest
# python gen-slides.py -p /var/bigbluebutton/ingest/df4f304c-2601-438f-a69f-dfd91e453b71/presentations/process -f process.pdf
# python publish.py -m e0401b38-0ed1-4526-b7d0-50e28211c9c4 -i /var/bigbluebutton/ingest -p /var/bigbluebutton/recordings

 
    command = "python /home/firstuser/python/src/archive.py -m " + meetingId + " -a " + audioSrcDir + " -p " + presentationSrcDir + " -r " + archiveDir
    print command
    
    proc = subprocess.Popen(command, shell=True)
    proc.wait()
    
    command = "python /home/firstuser/python/src/get-events.py -m " + meetingId + " -r " + redisHost + " -p " + redisPort + " -a " + archiveDir
    print command
    
    proc = subprocess.Popen(command, shell=True)
    proc.wait()

    command = "python /home/firstuser/python/src/ingest.py -m " + meetingId + " -i " + ingestDir + " -a " + archiveDir
    print command
    
    proc = subprocess.Popen(command, shell=True)
    proc.wait()
    
    command = "python /home/firstuser/python/src/process-audio.py -m " + meetingId + " -i " + ingestDir
    print command
    proc = subprocess.Popen(command, shell=True)
    proc.wait()

    meetingArchiveDir = ingestDir + "/" + meetingId
    presentationNames = []
    tree = etree.parse(meetingArchiveDir + '/events.xml')
    presentations = tree.xpath("//event[@name='SharePresentationEvent']")
    for p in presentations:
        pname = p.find('presentationName').text
        presentationNames.append(pname)
    
    command = "python /home/firstuser/python/src/gen-slides.py -p " + meetingArchiveDir + "/presentations/" 
    
    for p in presentationNames:
        genSlidesCmd = command + p + " -f " + p + ".pdf"
        print genSlidesCmd
        proc = subprocess.Popen(genSlidesCmd, shell=True)
        proc.wait()

    command = "python /home/firstuser/python/src/publish.py -m " + meetingId + " -i " + ingestDir + " -p " + publishDir
    print command
    proc = subprocess.Popen(command, shell=True)
    proc.wait()
    
if __name__ == "__main__":
    main()
    