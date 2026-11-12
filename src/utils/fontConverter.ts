/**
 * Utility for converting legacy Vietnamese fonts (TCVN3 / ABC, VNI) to Unicode
 * and cleaning administrative document text.
 */

// TCVN3 (ABC / .VnTime) character mapping table
const TCVN3_CHARS = [
  'a\u0300', 'a\u0301', 'a\u0303', 'a\u0309', 'a\u0323',
  'â', 'â\u0300', 'â\u0301', 'â\u0303', 'â\u0309', 'â\u0323',
  'ă', 'ă\u0300', 'ă\u0301', 'ă\u0303', 'ă\u0309', 'ă\u0323',
  'e\u0300', 'e\u0301', 'e\u0303', 'e\u0309', 'e\u0323',
  'ê', 'ê\u0300', 'ê\u0301', 'ê\u0303', 'ê\u0309', 'ê\u0323',
  'i\u0300', 'i\u0301', 'i\u0303', 'i\u0309', 'i\u0323',
  'o\u0300', 'o\u0301', 'o\u0303', 'o\u0309', 'o\u0323',
  'ô', 'ô\u0300', 'ô\u0301', 'ô\u0303', 'ô\u0309', 'ô\u0323',
  'ơ', 'ơ\u0300', 'ơ\u0301', 'ơ\u0303', 'ơ\u0309', 'ơ\u0323',
  'u\u0300', 'u\u0301', 'u\u0303', 'u\u0309', 'u\u0323',
  'ư', 'ư\u0300', 'ư\u0301', 'ư\u0303', 'ư\u0309', 'ư\u0323',
  'y\u0300', 'y\u0301', 'y\u0303', 'y\u0309', 'y\u0323',
  'đ', 'Đ'
];

// Direct mapping table for TCVN3 1-byte code points
const TCVN3_MAP: Record<string, string> = {
  '\u00B8': 'à', '\u00B5': 'á', '\u00B7': 'ả', '\u00B6': 'ã', '\u00B9': 'ạ',
  '\u00A2': 'â', '\u00C7': 'ầ', '\u00C6': 'ấ', '\u00C9': 'ẩ', '\u00C8': 'ẫ', '\u00CA': 'ậ',
  '\u00A1': 'ă', '\u00BE': 'ằ', '\u00BB': 'ắ', '\u00BD': 'ẳ', '\u00BC': 'ẵ', '\u00C5': 'ặ',
  '\u00CC': 'è', '\u00CE': 'é', '\u00CF': 'ẻ', '\u00CE\u0303': 'ẽ', '\u00D1': 'ẹ',
  '\u00A3': 'ê', '\u00D3': 'ề', '\u00D2': 'ế', '\u00D5': 'ể', '\u00D4': 'ễ', '\u00D6': 'ệ',
  '\u00D7': 'ì', '\u00DD': 'í', '\u00D8': 'ỉ', '\u00DC': 'ĩ', '\u00DE': 'ị',
  '\u00DF': 'ò', '\u00E1': 'ó', '\u00E3': 'ỏ', '\u00E2': 'õ', '\u00E4': 'ọ',
  '\u00A4': 'ô', '\u00E6': 'ồ', '\u00E5': 'ố', '\u00E8': 'ổ', '\u00E7': 'ỗ', '\u00E9': 'ộ',
  '\u00A5': 'ơ', '\u00EB': 'ờ', '\u00EA': 'ớ', '\u00ED': 'ở', '\u00EC': 'ỡ', '\u00EE': 'ợ',
  '\u00EF': 'ù', '\u00F1': 'ú', '\u00F3': 'ủ', '\u00F2': 'ũ', '\u00F4': 'ụ',
  '\u00A6': 'ư', '\u00F6': 'ừ', '\u00F5': 'ứ', '\u00F8': 'ử', '\u00F7': 'ữ', '\u00F9': 'ự',
  '\u00FA': 'ỳ', '\u00FD': 'ý', '\u00FB': 'ỷ', '\u00FC': 'ỹ', '\u00FE': 'ỵ',
  '\u00AE': 'đ', '\u00A7': 'Đ'
};

// VNI two-character and single-character sequence mappings
const VNI_MAP: Record<string, string> = {
  'a1': 'á', 'a2': 'à', 'a3': 'ả', 'a4': 'ã', 'a5': 'ạ',
  'a8': 'ă', 'a81': 'ắ', 'a82': 'ằ', 'a83': 'ẳ', 'a84': 'ẵ', 'a85': 'ặ',
  'a6': 'â', 'a61': 'ấ', 'a62': 'ầ', 'a63': 'ẩ', 'a64': 'ẫ', 'a65': 'ậ',
  'e1': 'é', 'e2': 'è', 'e3': 'ẻ', 'e4': 'ẽ', 'e5': 'ẹ',
  'e6': 'ê', 'e61': 'ế', 'e62': 'ề', 'e63': 'ể', 'e64': 'ễ', 'e65': 'ệ',
  'i1': 'í', 'i2': 'ì', 'i3': 'ỉ', 'i4': 'ĩ', 'i5': 'ị',
  'o1': 'ó', 'o2': 'ò', 'o3': 'ỏ', 'o4': 'õ', 'o5': 'ọ',
  'o6': 'ô', 'o61': 'ố', 'o62': 'ồ', 'o63': 'ổ', 'o64': 'ỗ', 'o65': 'ộ',
  'o7': 'ơ', 'o71': 'ớ', 'o72': 'ờ', 'o73': 'ở', 'o74': 'ỡ', 'o75': 'ợ',
  'u1': 'ú', 'u2': 'ù', 'u3': 'ủ', 'u4': 'ũ', 'u5': 'ụ',
  'u7': 'ư', 'u71': 'ứ', 'u72': 'ừ', 'u73': 'ử', 'u74': 'ữ', 'u75': 'ự',
  'y1': 'ý', 'y2': 'ỳ', 'y3': 'ỷ', 'y4': 'ỹ', 'y5': 'ỵ',
  'd9': 'đ', 'D9': 'Đ'
};

/**
 * Converts TCVN3 (.VnTime, .VnTimeH, ABC) encoded string to standard Unicode.
 */
export function convertTcvn3ToUnicode(text: string): string {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (TCVN3_MAP[ch]) {
      result += TCVN3_MAP[ch];
    } else {
      result += ch;
    }
  }
  return result.normalize('NFC');
}

/**
 * Converts VNI-Times to Unicode.
 */
export function convertVniToUnicode(text: string): string {
  if (!text) return '';
  let res = text;
  // Sort keys by descending length so 3-char patterns match before 2-char patterns
  const keys = Object.keys(VNI_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const reg = new RegExp(k, 'g');
    res = res.replace(reg, VNI_MAP[k]);
    const upperReg = new RegExp(k.toUpperCase(), 'g');
    res = res.replace(upperReg, VNI_MAP[k].toUpperCase());
  }
  return res.normalize('NFC');
}

/**
 * Cleans messy formatting, removes multiple spaces, fixes spacing around punctuation.
 */
export function cleanDocumentText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[ \t]+/g, ' ')                   // Multiple spaces/tabs to single space
    .replace(/ ?([.,;:!?]) ?/g, '$1 ')          // Fix spacing around punctuation marks
    .replace(/\( /g, '(')                       // Parentheses spacing
    .replace(/ \)/g, ')')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')          // Max 2 consecutive line breaks
    .replace(/“|”/g, '"')                       // Standardize quotes
    .trim();
}
