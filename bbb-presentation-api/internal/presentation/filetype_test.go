package presentation

import (
	"fmt"
	"testing"
)

func TestMimeType_Matches(t *testing.T) {
	tests := []struct {
		name     string
		mimeType MimeType
		input    string
		expected bool
	}{
		{"Exact match", TextXML, "text/xml", true},
		{"Case insensitive match", ApplicationXML, "APPLICATION/XML", true},
		{"No match", TextXML, "application/json", false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := test.mimeType.Matches(test.input)
			if result != test.expected {
				t.Errorf("Matches(%q) = %v; expected %v", test.input, result, test.expected)
			}
		})
	}
}

func TestFileExt_Matches(t *testing.T) {
	tests := []struct {
		name     string
		fileExt  FileExt
		input    string
		expected bool
	}{
		{"Exact match", ExtPdf, ".pdf", true},
		{"Case insensitive match", ExtJpeg, ".JPEG", true},
		{"No match", ExtDoc, ".xls", false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := test.fileExt.Matches(test.input)
			if result != test.expected {
				t.Errorf("Matches(%q) = %v; expected %v", test.input, result, test.expected)
			}
		})
	}
}

func TestExtMatchesMime(t *testing.T) {
	tests := []struct {
		name     string
		fileExt  FileExt
		mimeType MimeType
		expected bool
	}{
		{"Valid match", ExtPdf, Pdf, true},
		{"Invalid MIME type", ExtDoc, MimeType("application/unknown"), false},
		{"Invalid match", ExtDoc, Png, false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := ExtMatchesMime(test.fileExt, test.mimeType)
			if result != test.expected {
				t.Errorf("ExtMatchesMime(%q, %q) = %v; expected %v", test.fileExt, test.mimeType, result, test.expected)
			}
		})
	}
}

func TestLookupMIME(t *testing.T) {
	tests := []struct {
		name      string
		mimeType  MimeType
		expectErr bool
	}{
		{"Valid MIME type", Pdf, false},
		{"Invalid MIME type", MimeType("application/unknown"), true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			_, err := LookupMIME(test.mimeType)
			if (err != nil) != test.expectErr {
				t.Errorf("LookupMIME(%q) error = %v; expected error = %v", test.mimeType, err != nil, test.expectErr)
			}
		})
	}
}

func TestGetExtForMimeType(t *testing.T) {
	tests := []struct {
		name     string
		mimeType MimeType
		expected FileExt
	}{
		{"Valid MIME type", Pdf, ExtPdf},
		{"Unknown MIME type", MimeType("application/unknown"), "."},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := GetExtForMimeType(test.mimeType)
			if result != test.expected {
				t.Errorf("GetExtForMimeType(%q) = %q; expected %q", test.mimeType, result, test.expected)
			}
		})
	}
}

func TestToFileExt(t *testing.T) {
	tests := []struct {
		ext      string
		expected FileExt
	}{
		{ext: ".pdf", expected: ExtPdf},
		{ext: "pdf", expected: ExtPdf},
		{ext: ".abc", expected: FileExt(".abc")},
		{ext: "abc", expected: FileExt(".abc")},
	}

	for _, test := range tests {
		t.Run(fmt.Sprintf("ToFileExt(%s)", test.ext), func(t *testing.T) {
			result := ToFileExt(test.ext)
			if result != test.expected {
				t.Errorf("ToFileExt(%s) = %q; expected %q", test.ext, result, test.expected)
			}
		})
	}
}

func TestIsOfficeFile(t *testing.T) {
	tests := []struct {
		name     string
		fileExt  FileExt
		expected bool
	}{
		{"DOCX is office file", ExtDocx, true},
		{"PDF is not office file", ExtPdf, false},
		{"ODT is office file", ExtOdt, true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := IsOfficeFile(test.fileExt)
			if result != test.expected {
				t.Errorf("IsOfficeFile(%q) = %v; expected %v", test.fileExt, result, test.expected)
			}
		})
	}
}

func TestIsImageFile(t *testing.T) {
	tests := []struct {
		name     string
		fileExt  FileExt
		expected bool
	}{
		{"JPG is image file", ExtJpg, true},
		{"DOCX is not image file", ExtDocx, false},
		{"WEBP is image file", ExtWebp, true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := IsImageFile(test.fileExt)
			if result != test.expected {
				t.Errorf("IsImageFile(%q) = %v; expected %v", test.fileExt, result, test.expected)
			}
		})
	}
}

func TestIsPDF(t *testing.T) {
	tests := []struct {
		name     string
		fileExt  FileExt
		expected bool
	}{
		{"PDF file", ExtPdf, true},
		{"DOCX file", ExtDocx, false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := IsPDF(test.fileExt)
			if result != test.expected {
				t.Errorf("IsPDF(%q) = %v; expected %v", test.fileExt, result, test.expected)
			}
		})
	}
}

func TestIsMimeTypeValid(t *testing.T) {
	tests := []struct {
		name               string
		inputBytes         []byte
		fileExt            FileExt
		supportedMimeTypes map[MimeType]struct{}
		expected           bool
	}{
		{
			"Valid PDF MIME type",
			[]byte("%PDF-1.4"),
			ExtPdf,
			map[MimeType]struct{}{Pdf: {}},
			true,
		},
		{
			"Invalid MIME type",
			[]byte("Hello, world!"),
			ExtTxt,
			map[MimeType]struct{}{Pdf: {}},
			false,
		},
		{
			"Unsupported extension for MIME type",
			[]byte("%PDF-1.4"),
			ExtDoc,
			map[MimeType]struct{}{Pdf: {}},
			false,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := IsMimeTypeValid(test.inputBytes, test.fileExt, test.supportedMimeTypes)
			if result != test.expected {
				t.Errorf("IsMimeTypeValid(%q, %q) = %v; expected %v", test.inputBytes, test.fileExt, result, test.expected)
			}
		})
	}
}

func TestPDFName(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"test.docx", "test.pdf"},
		{"a/b/c.odt", "a/b/c.pdf"},
		{"example.pptx", "example.pdf"},
	}

	for _, test := range tests {
		result := PDFName(test.input)
		if result != test.expected {
			t.Errorf("PDFName(%q) = %q; expected %q", test.input, result, test.expected)
		}
	}
}
