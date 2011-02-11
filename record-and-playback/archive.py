import os, getopt, sys
import shutil

def usage():
    print ' -------------------------------------------------------------------------'
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

def copy_files_to_archive(meetingId, audioSrcDir, presentationSrcDir, archiveDir):   
    '''
        Copy all audio recordings and presentations into the archive directory.
    '''
    dirList = os.listdir(audioSrcDir)
    for fname in dirList:
        if (fname.find(meetingId) == 0):
            if (os.path.isdir(archiveDir + "/" + meetingId) is False):
                os.makedirs(archiveDir + "/" + meetingId + "/audio")
            # Use copy2 to copy including the stats (modified, access, creation times of the audio files.
            shutil.copy2(audioSrcDir + "/" + fname, archiveDir + "/" + meetingId + "/audio")
    
    source = presentationSrcDir + "/" + meetingId + "/" + meetingId
    destination = archiveDir + '/' + meetingId + "/presentations"        
    shutil.copytree(source, destination)
    
def main():
    meetingId = ""
    audioSrcDir = ""
    presentationSrcDir = ""
    archiveDir = ""
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hm:a:p:r:", ["help", "meeting-id=", "audio-dir=", "presentation-dir=", "archive-dir="])
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
    
    if (printUsage):
        printUsageHelp()

        
    print meetingId
    print audioSrcDir
    print presentationSrcDir
    print archiveDir
    
    copy_files_to_archive(meetingId, audioSrcDir, presentationSrcDir, archiveDir)
   
if __name__ == "__main__":
    main()
