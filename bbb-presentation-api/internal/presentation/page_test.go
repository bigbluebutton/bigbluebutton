package presentation

import (
	"context"
	"errors"
	"os"
	"os/exec"
	"strings"
	"testing"
)

const (
	failDownscaleIn = "fail.pdf"
)

type MockPDFProcessor struct {
	countPagesFunc   func(path string) (int, error)
	extractPagesFunc func(in, out string, pages []string) error
}

func (p *MockPDFProcessor) countPages(path string) (int, error) {
	return p.countPagesFunc(path)
}

func (p *MockPDFProcessor) extractPages(in, out string, pages []string) error {
	return p.extractPagesFunc(in, out, pages)
}

func mockExecCommandContextForPage(ctx context.Context, name string, args ...string) *exec.Cmd {
	cs := []string{"-test.run=TestHelperProcessForPage", "--", name}
	cs = append(cs, args...)
	cmd := exec.CommandContext(ctx, os.Args[0], cs...)
	cmd.Env = append(cmd.Env, "GO_WANT_HELPER_PROCESS=1")

	if strings.Contains(strings.Join(args, " "), failDownscaleIn) {
		cmd.Env = append(cmd.Env, "GO_MOCK_FAILURE=1")
	}

	return cmd
}

func TestHelperProcessForPage(*testing.T) {
	if os.Getenv("GO_WANT_HELPER_PROCESS") != "1" {
		return
	}
	if os.Getenv("GO_MOCK_FAILURE") == "1" {
		os.Exit(1)
	}
	os.Exit(0)
}

func TestCountPages(t *testing.T) {
	tests := []struct {
		name      string
		pageCount int
		shouldErr bool
	}{
		{
			name:      "Valid page count",
			pageCount: 5,
			shouldErr: false,
		},
		{
			name:      "Error while counting pages",
			pageCount: 0,
			shouldErr: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockProcessor := &MockPDFProcessor{
				countPagesFunc: func(path string) (int, error) {
					if test.shouldErr {
						return 0, errors.New("mock error")
					}
					return test.pageCount, nil
				},
			}

			counter := NewPDFPageCounterWithProcessor(mockProcessor)
			pageCount, err := counter.CountPages("input.pdf")

			if (err != nil) != test.shouldErr {
				t.Errorf("CountPages(%s) error = %v, want error %v", "intput.pdf", err, test.shouldErr)
			}

			if !test.shouldErr && pageCount != test.pageCount {
				t.Errorf("expected page count: %d, got: %d", test.pageCount, pageCount)
			}
		})
	}
}

func TestExtractPage(t *testing.T) {
	tests := []struct {
		name        string
		pageCount   int
		pageNum     int
		expectedErr string
	}{
		{
			name:        "Valid extraction",
			pageCount:   5,
			pageNum:     3,
			expectedErr: "",
		},
		{
			name:        "Invalid page number - out of range",
			pageCount:   2,
			pageNum:     5,
			expectedErr: "invalid page number 5: must be between 1 and 2",
		},
		{
			name:        "Page count failed",
			pageCount:   5,
			pageNum:     3,
			expectedErr: "failed to get page count",
		},
		{
			name:        "Extraction failure",
			pageCount:   5,
			pageNum:     3,
			expectedErr: "failed to extract pages",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			mockProcessor := &MockPDFProcessor{
				countPagesFunc: func(path string) (int, error) {
					if test.expectedErr == "failed to get page count" {
						return 0, errors.New("failed to get page count")
					}
					return test.pageCount, nil
				},
				extractPagesFunc: func(in, out string, pages []string) error {
					if test.expectedErr == "failed to extract pages" {
						return errors.New("failed to extract pages")
					}
					return nil
				},
			}

			extractor := NewPDFPageExtractorWithProcessor(mockProcessor)
			err := extractor.ExtractPage("input.pdf", "output.pdf", test.pageNum)

			if (err != nil) != (test.expectedErr != "") {
				t.Fatalf("expected error: %v, got: %v", test.expectedErr, err)
			}

			if err != nil && !strings.Contains(err.Error(), test.expectedErr) {
				t.Errorf("expected error: %v, got: %v", test.expectedErr, err.Error())
			}
		})
	}
}

func TestDownscalePage(t *testing.T) {
	tests := []struct {
		name      string
		timeout   int
		in        string
		shouldErr bool
	}{
		{
			name:      "Successful downscale",
			timeout:   10,
			in:        "input.pdf",
			shouldErr: false,
		},
		{
			name:      "Downscale failed",
			timeout:   10,
			in:        failDownscaleIn,
			shouldErr: true,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			downscaler := NewPDFPageDownscaler()
			downscaler.exec = mockExecCommandContextForPage

			err := downscaler.DownscalePage(test.in, "output.pdf")
			if (err != nil) != test.shouldErr {
				t.Errorf("DownscalePage(%s, %s) error = %v, want error %v", test.in, "output.pdf", err, test.shouldErr)
			}
		})
	}
}
