import os, getopt, sys
import shutil, subprocess

OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH";
FIRSTPAGE = "-dFirstPage=";
LASTPAGE = "-dLastPage=";
NO_PDF_MARK_WORKAROUND = "/etc/bigbluebutton/nopdfmark.ps";
OUTPUTFILE = "-sOutputFile=";

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

def determine_number_of_pages(presentationDir):
    dirList = os.listdir(presentationDir)
    numFiles = 0
    for fname in dirList:
        if fname.endswith('.swf'):
            numFiles += 1
            
    return numFiles
            
def extract_page_from_pdf(page, pdfFile, presentationDir):
    command = "ghostscript " + OPTIONS + " " + FIRSTPAGE + str(page) + " " + LASTPAGE + str(page) + " " + OUTPUTFILE + presentationDir + "/slide-" + str(page) + ".pdf" + " " + NO_PDF_MARK_WORKAROUND + " " + pdfFile
    print command
    proc = subprocess.Popen(command, shell=True)
    # Wait for the process to finish
    proc.wait()

def convert_pdf_to_png(pdfPage, pngOut):
    command = "convert -depth 8 " + pdfPage + " " + pngOut
    print command
    proc = subprocess.Popen(command, shell=True)
    # Wait for the process to finish
    proc.wait()    
        
def main():
    presentationSrcDir = ""
    pdfFilename = ""
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hp:f:", ["help", "presentation-dir=", "pdf-filename="])
    except getopt.GetoptError, err:
        # print help information and exit:
        print str(err)
        usage()
        sys.exit(2)
    for o, a in opts:
        if o in ("-h", "--help"):
            usage()
            sys.exit()
        elif o in ("-p", "--presentation-dir"):
            presentationSrcDir = a
        elif o in ("-f", "--pdf-filename"):
            pdfFilename = a
        else:
            assert False, "unhandled option"
    
    printUsage = False
    if (presentationSrcDir == ""):
        print "Missing presentation dir."
        printUsage = True
    if (pdfFilename == ""):
        print "Missing pdf filename."
        printUsage = True
    
    if (printUsage):
        printUsageHelp()

    print presentationSrcDir
    print pdfFilename
    
    numPages = determine_number_of_pages(presentationSrcDir)
    print "num pages = " + str(numPages)
    if (numPages > 0):
        i = 1
        while i <= numPages:
            print "Processing page " + str(i)
            extract_page_from_pdf(i, presentationSrcDir + "/" + pdfFilename, presentationSrcDir)
            fileToConvert = presentationSrcDir + "/slide-" + str(i)
            convert_pdf_to_png(fileToConvert + ".pdf", fileToConvert + ".png")
            i += 1
            
if __name__ == "__main__":
    main()
    



