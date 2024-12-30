import PDFParser from "pdf2json";
import mammoth from "mammoth";

export async function parseDocument(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileType = file.type;

  if (fileType === "application/pdf") {
    return parsePDF(buffer);
  } else if (
    fileType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return parseDocx(buffer);
  }

  throw new Error("Format de fichier non supporté");
}

async function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(errData.parserError);
    });

    pdfParser.on("pdfParser_dataReady", () => {
      resolve(pdfParser.getRawTextContent());
    });

    pdfParser.parseBuffer(buffer);
  });
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export function extractJsonFromString(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const jsonString = jsonMatch[0];
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Erreur lors de l'extraction du JSON:", error);
    return null;
  }
}
