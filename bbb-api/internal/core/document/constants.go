package document

const (
	FileExtDOC          = ".doc"
	FileExtXLS          = ".xls"
	FileExtPPT          = ".ppt"
	FileExtDOCX         = ".docx"
	FileExtPPTX         = ".pptx"
	FileExtXLSX         = ".xlsx"
	FileExtODT          = ".odt"
	FileExtRTF          = ".rtf"
	FileExtTXT          = ".txt"
	FileExtODS          = ".ods"
	FileExtODP          = ".odp"
	FileExtODG          = ".odg"
	FileExtPDF          = ".pdf"
	FileExtJPG          = ".jpg"
	FileExtJPEG         = ".jpeg"
	FileExtPNG          = ".png"
	FileExtSVG          = ".svg"
	FileExtWEBP         = ".webp"
	FileExtDownloadable = ".downloadable"

	PodIDDefault = "DEFAULT_PRESENTATION_POD"

	AuthzTokenDefault = "preupload-download-authz-token"

	RunInSystemdCommand = "/usr/share/bbb-web/run-in-systemd.sh"

	GenerationProcessPDFToCairo GenerationProcessImpl = "pdftocairo"

	GenerationProcessFormatSVG GenerationProcessFormat = "-svg"
	GenerationProcessFormatPNG GenerationProcessFormat = "-png"

	PDFToCairoCommand = "pdftocairo"
)
