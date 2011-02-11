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
    print ' i, --ingest-dir             The ingest dir'
    print ' a, --archive-dir            The archive dir'
    print ' -------------------------------------------------------------------------'

def printUsageHelp():
    usage()
    sys.exit(2)

def copy_files_to_ingest_dir(meetingId, ingestDir, archiveDir):   
    '''
        Copy all files from the archive directory to the ingest directory in preparation for processing.
    '''    
    if (os.path.isdir(ingestDir) is False):
        os.makedirs(ingestDir + "/" + meetingId)
                
    shutil.copytree(archiveDir + "/" + meetingId, ingestDir + "/" + meetingId)
    
def main():
    meetingId = ""
    ingestDir = ""
    archiveDir = ""
    
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hm:i:a:", ["help", "meeting-id=", "ingest-dir=", "archive-dir="])
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
        elif o in ("-a", "--archive-dir"):
            archiveDir = a
        else:
            assert False, "unhandled option"
    
    printUsage = False
    if (meetingId == ""):
        print "Missing meeting id."
        printUsage = True
    if (ingestDir == ""):
        print "Missing ingest dir."
        printUsage = True
    if (archiveDir == ""):
        print "Missing archive dir."
        printUsage = True
        
    if (printUsage):
        printUsageHelp()
    
    copy_files_to_ingest_dir(meetingId, ingestDir, archiveDir)
   
if __name__ == "__main__":
    main()
