package presentation

import "github.com/pdfcpu/pdfcpu/pkg/api"

// PDFProcessor is an interface that encapsulates the logic for handling PDF documents
// allowing different processor implementations to be swapped in at runtime depending
// on the requirements.
type PDFProcessor interface {
	countPages(path string) (int, error)
	extractPages(in, out string, pages []string) error
}

// PDFCPU is an implementation of PDFProcessor that uses the pdfcpu library for
// handling PDF documents.
type PDFCPU struct{}

func (p *PDFCPU) countPages(path string) (int, error) {
	return api.PageCountFile(path)
}

func (p *PDFCPU) extractPages(in, out string, pages []string) error {
	return api.ExtractPagesFile(in, out, pages, nil)
}
