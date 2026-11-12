import JSZip from 'jszip';
import mammoth from 'mammoth';

/**
 * Converts a DOCX ArrayBuffer into HTML for safe, rich preview.
 */
export async function convertDocxToHtml(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value;
  } catch (err) {
    console.warn('Mammoth preview error:', err);
    return '<p class="text-gray-500 italic">Không thể dựng bản xem trước trực tiếp từ file này. Bạn vẫn có thể tải và xem bằng Microsoft Word.</p>';
  }
}

/**
 * Extracts plain text from DOCX ArrayBuffer for analysis.
 */
export async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (err) {
    console.error('Error extracting docx text:', err);
    return '';
  }
}

/**
 * Fills variables into a DOCX template by safely replacing text in word/document.xml (OOXML).
 * This preserves tables, headers, footers, images, fonts, styles, and page layouts!
 */
export async function fillDocxTemplate(
  docxData: ArrayBuffer | Uint8Array,
  dataMap: Record<string, string>
): Promise<Blob> {
  const zip = await JSZip.loadAsync(docxData);

  // Targets where text can reside in DOCX
  const xmlTargets = [
    'word/document.xml',
    'word/header1.xml',
    'word/header2.xml',
    'word/header3.xml',
    'word/footer1.xml',
    'word/footer2.xml',
    'word/footer3.xml',
  ];

  for (const target of xmlTargets) {
    const file = zip.file(target);
    if (!file) continue;

    let content = await file.async('string');

    // Replace keys in format: {{key}}, {key}, [key], ${key}
    for (const [key, value] of Object.entries(dataMap)) {
      const escapedValue = (value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const patterns = [
        new RegExp(`\\{\\{\\s*${escapeRegExp(key)}\\s*\\}\\}`, 'g'),
        new RegExp(`\\{\\s*${escapeRegExp(key)}\\s*\\}`, 'g'),
        new RegExp(`\\[\\s*${escapeRegExp(key)}\\s*\\]`, 'g'),
        new RegExp(`\\$\\{\\s*${escapeRegExp(key)}\\s*\\}`, 'g'),
      ];

      for (const pattern of patterns) {
        content = content.replace(pattern, escapedValue);
      }
    }

    zip.file(target, content);
  }

  const outputBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  return outputBlob;
}

/**
 * Batch mail-merges a DOCX template with an array of Excel rows,
 * and packages them into a single downloadable .ZIP archive.
 */
export async function batchMergeToZip(
  docxTemplateData: ArrayBuffer,
  rows: Record<string, string>[],
  fileNameField: string = 'Họ tên',
  filePrefix: string = 'Van_Ban'
): Promise<Blob> {
  const zipArchive = new JSZip();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const personName = (row[fileNameField] || row['HoTen'] || row['STT'] || (i + 1))
      .toString()
      .replace(/[/\\?%*:|"<>]/g, '_')
      .trim();

    const filledBlob = await fillDocxTemplate(docxTemplateData, row);
    const fileName = `${filePrefix}_${String(i + 1).padStart(2, '0')}_${personName}.docx`;

    zipArchive.file(fileName, filledBlob);
  }

  return await zipArchive.generateAsync({ type: 'blob' });
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
