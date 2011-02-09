import os, getopt, sys
import shutil

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

def main():
    meetingId = ""
    ingestDir = ""
    publishDir = ""
    
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hm:i:p:", ["help", "meeting-id=", "ingest-dir=", "publish-dir="])
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
        
    if (printUsage):
        printUsageHelp()
    
    copy_files_to_publish_dir(meetingId, ingestDir, publishDir)
           
if __name__ == "__main__":
    main()

