import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer,
  HeadingLevel,
  convertInchesToTwip,
} from 'docx';
import { AdministrativeDocument, SchoolProfile } from '../types';

/**
 * Creates a valid DOCX document blob conforming to Decree 30/2020/ND-CP on Vietnamese Administrative Work.
 */
export async function generateAdminDocx(
  doc: AdministrativeDocument,
  school: SchoolProfile
): Promise<Blob> {
  const font = 'Times New Roman';

  // 1. Two-column Header Table (Border none)
  // Left: Governing body, School Name, Doc Number
  // Right: National Motto, Location & Date
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (school.governingBody || 'PHÒNG GD&ĐT QUẬN/HUYỆN').toUpperCase(),
                    font,
                    size: 24, // 12pt
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (school.schoolName || 'TRƯỜNG TIỂU HỌC & THCS').toUpperCase(),
                    bold: true,
                    font,
                    size: 24, // 12pt
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Số: ' + (doc.docNumber || '……/……'),
                    font,
                    size: 24,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
                    bold: true,
                    font,
                    size: 24, // 12pt
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'Độc lập - Tự do - Hạnh phúc',
                    bold: true,
                    underline: {},
                    font,
                    size: 26, // 13pt
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${doc.location || 'Hà Nội'}, ngày ${doc.issueDate ? doc.issueDate.split('/')[0] : '…'} tháng ${doc.issueDate ? doc.issueDate.split('/')[1] : '…'} năm ${doc.issueDate ? doc.issueDate.split('/')[2] : '20…'}`,
                    italics: true,
                    font,
                    size: 24, // 12pt
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // 2. Title & Subject
  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text: (doc.title || 'VĂN BẢN HÀNH CHÍNH').toUpperCase(),
        bold: true,
        font,
        size: 30, // 15pt
      }),
    ],
  });

  const subjectParagraph = doc.subject
    ? new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: doc.subject.startsWith('V/v') ? doc.subject : `V/v ${doc.subject}`,
            bold: true,
            italics: true,
            font,
            size: 26,
          }),
        ],
      })
    : new Paragraph({ children: [] });

  // 3. Body paragraphs parsing
  const bodyParagraphs: (Paragraph | Table)[] = [];
  const lines = (doc.content || '').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      bodyParagraphs.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      continue;
    }

    // Markdown headers
    if (line.startsWith('### ')) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { before: 180, after: 60 },
          children: [
            new TextRun({
              text: line.replace('### ', ''),
              bold: true,
              font,
              size: 26,
            }),
          ],
        })
      );
    } else if (line.startsWith('## ') || line.startsWith('# ')) {
      bodyParagraphs.push(
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: line.replace(/^#+\s*/, ''),
              bold: true,
              font,
              size: 28,
            }),
          ],
        })
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      bodyParagraphs.push(
        new Paragraph({
          indent: { left: 720 }, // 0.5 inch indent
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: '• ' + line.substring(2),
              font,
              size: 26,
            }),
          ],
        })
      );
    } else {
      // Regular paragraph with standard Vietnamese administrative indent (1.27cm = 720 twips)
      bodyParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: 720 },
          spacing: { line: 280, after: 100 }, // 1.2 line spacing
          children: [
            new TextRun({
              text: line,
              font,
              size: 26, // 13pt - 14pt is standard
            }),
          ],
        })
      );
    }
  }

  // 4. Sign-off block (Table 2 columns)
  // Left: Recipients (Nơi nhận: Phòng GD, BGH, Lưu VT)
  // Right: Signer position & Full Name
  const recipientsLines = (doc.recipients || ['Lưu: VT']).map(
    (r) =>
      new Paragraph({
        children: [
          new TextRun({
            text: '- ' + r,
            font,
            size: 22, // 11pt
          }),
        ],
      })
  );

  const signoffTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Nơi nhận:',
                    bold: true,
                    italics: true,
                    font,
                    size: 22,
                  }),
                ],
              }),
              ...recipientsLines,
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: (doc.signerPosition || 'HIỆU TRƯỞNG').toUpperCase(),
                    bold: true,
                    font,
                    size: 26,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 1000, after: 120 }, // Gap for signature and stamp
                children: [
                  new TextRun({
                    text: doc.signerName || school.principalName || '[Họ và tên]',
                    bold: true,
                    font,
                    size: 26,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const wordDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.79), // 20mm
              bottom: convertInchesToTwip(0.79), // 20mm
              left: convertInchesToTwip(1.18), // 30mm standard left margin
              right: convertInchesToTwip(0.59), // 15mm
            },
          },
        },
        children: [
          headerTable,
          new Paragraph({ spacing: { after: 120 }, children: [] }),
          titleParagraph,
          subjectParagraph,
          ...bodyParagraphs,
          new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),
          signoffTable,
        ],
      },
    ],
  });

  return await Packer.toBlob(wordDoc);
}

/**
 * Downloads a Blob directly to the client browser.
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
