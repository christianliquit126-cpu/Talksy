export async function detectLanguage(text) {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&dt=ld&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[8]?.[0]?.[0] || 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function translateText(text, targetLang = 'en') {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0].map((item) => item[0]).join('');
  } catch {
    throw new Error('Translation failed');
  }
}

export function getBrowserLanguage() {
  return navigator.language?.split('-')[0] || 'en';
}
