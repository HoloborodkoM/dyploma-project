import { NextRequest } from 'next/server';

const CHUNK_SIZE = 500;

async function translateChunk(text: string, target: string) {
  const url = `https://translate.google.com/translate_a/single?client=gtx&sl=uk&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0][0][0] || text;
  } catch {
    return text;
  }
}

export async function POST(req: NextRequest) {
  const { text, target } = await req.json();

  if (typeof text !== 'string' || !target) {
    return Response.json({ translatedText: text }, { status: 400 });
  }

  const safeTextTemp = text.replace(/.\n/g, ' @ ');
  const safeText = safeTextTemp.replace(/\./g, ' &');

  let translated = '';
  if (safeText.length <= CHUNK_SIZE) {
    translated = await translateChunk(safeText, target);
  } else {
    const lines = safeText.split('@');
    for (const line of lines) {
      translated += await translateChunk(line, target);
      translated += '@';
    }
  }

  const resultTemp = translated.replace(/ @ /g, '.\n');
  const result = resultTemp.replace(/ &/g, '\.');
  return Response.json({ translatedText: result });
}