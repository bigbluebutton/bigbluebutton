import logger from '/imports/startup/client/logger';


async function exportNotesAsPDF(padId: string) {
  try {
    const filename = 'Shared_Notes.pdf';

    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('sessionToken');

    const response = await fetch(`/hocuspocus/api/documents/${padId}/export/pdf?sessionToken=${sessionToken}`, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    // Create a temporary link element to trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Clean up after a short delay to ensure download started
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    logger.error({
      logCode: 'bn_shared_notes_export_error',
      extraInfo: { error },
    }, 'Error exporting notes as PDF');
    throw error;
  }
}

export default {
  exportNotesAsPDF,
};
