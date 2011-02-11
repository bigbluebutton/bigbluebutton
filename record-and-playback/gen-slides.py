import os, getopt, sys
import shutil, subprocess

OPTIONS = "-sDEVICE=pdfwrite -dNOPAUSE -dQUIET -dBATCH";
FIRSTPAGE = "-dFirstPage=";
LASTPAGE = "-dLastPage=";
NO_PDF_MARK_WORKAROUND = "/etc/bigbluebutton/nopdfmark.ps";
OUTPUTFILE = "-sOutputFile=";

def usage():
    print ' -------------------------------------------------------------------------'
    print ' Generates PNG files from each page of the PDF file.'
    print ' Usage:'
    print ' gen-slides.py -p [presentation dir] -f [filename]'
    print ' '
    print ' h, --help                   Print this'
    print ' p, --presentation-dir       The location of the presentation'
    print ' f, --pdf-filename           The filename of the PDF presentation.'
    print ' -------------------------------------------------------------------------'

def printUsageHelp():
    usage()
    sys.exit(2)

def determine_number_of_pages(presentationDir):
    '''
        Determine the number pages in a presentation by looking at the number of
        swf files in a directory.
    '''
    dirList = os.listdir(presentationDir)
    numFiles = 0
    for fname in dirList:
        if fname.endswith('.swf'):
            numFiles += 1
            
    return numFiles
            
def extract_page_from_pdf(page, pdfFile, presentationDir):
    '''
        Extract a page from the pdf file.
    '''
    command = "ghostscript " + OPTIONS + " " + FIRSTPAGE + str(page) + " " + LASTPAGE + str(page) + " " + OUTPUTFILE + presentationDir + "/slide-" + str(page) + ".pdf" + " " + NO_PDF_MARK_WORKAROUND + " " + pdfFile
    print command
    proc = subprocess.Popen(command, shell=True)
    # Wait for the process to finish
    proc.wait()

def convert_pdf_to_png(pdfPage, pngOut):
    '''
        Convert a pdf page to a png.
    '''
    command = "convert -depth 8 " + pdfPage + " " + pngOut
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
    
    numPages = determine_number_of_pages(presentationSrcDir)
    if (numPages > 0):
        i = 1
        while i <= numPages:
            extract_page_from_pdf(i, presentationSrcDir + "/" + pdfFilename, presentationSrcDir)
            fileToConvert = presentationSrcDir + "/slide-" + str(i)
            convert_pdf_to_png(fileToConvert + ".pdf", fileToConvert + ".png")
            i += 1
            
if __name__ == "__main__":
    main()
    



