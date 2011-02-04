import os, getopt, sys
import shutil, subprocess
from lxml import etree

def usage():
    print ' -------------------------------------------------------------------------'
    print ' (c) Blindside Networks Inc. 2010'
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
    
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hm:a:p:r:e:o:", ["help", "meeting-id=", "audio-dir=", "presentation-dir=", "archive-dir=", "redis-host=", "redis-port="])
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
    if (printUsage):
        printUsageHelp()

        
    print meetingId
    print audioSrcDir
    print presentationSrcDir
    print archiveDir
    print redisHost
    print redisPort
    
    command = "python archive.py -m " + meetingId + " -a " + audioSrcDir + " -p " + presentationSrcDir + " -r " + archiveDir
    print command
    
    proc = subprocess.Popen(command, shell=True)
    proc.wait()
    
    command = "python get-events.py -m " + meetingId + " -r " + redisHost + " -p " + redisPort + " -a " + archiveDir
    print command
    
    proc = subprocess.Popen(command, shell=True)
    proc.wait()

    command = "python process-audio.py -m " + meetingId + " -a " + archiveDir
    print command
    proc = subprocess.Popen(command, shell=True)
    proc.wait()

    meetingArchiveDir = archiveDir + "/" + meetingId
    presentationNames = []
    tree = etree.parse(meetingArchiveDir + '/events.xml')
    presentations = tree.xpath("//event[@name='SharePresentationEvent']")
    for p in presentations:
        pname = p.find('presentationName').text
        presentationNames.append(pname)
    
    command = "python gen-slides.py -p " + meetingArchiveDir + "/presentations/" 
    
    for p in presentationNames:
        genSlidesCmd = command + p + " -f " + p + ".pdf"
        print genSlidesCmd
        proc = subprocess.Popen(genSlidesCmd, shell=True)
        proc.wait()
    
if __name__ == "__main__":
    main()
    