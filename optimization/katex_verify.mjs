import katex from 'katex';
import { readFileSync } from 'fs';
const src = readFileSync(new URL('./OptimizationExplainer.jsx', import.meta.url), 'utf8');
const MACROS = {
  '\\obj': '\\textcolor{##6ee7b7}{#1}', '\\dir': '\\textcolor{##a5b4fc}{#1}',
  '\\con': '\\textcolor{##fbbf24}{#1}', '\\inf': '\\textcolor{##fb7185}{#1}',
  '\\dual': '\\textcolor{##c4b5fd}{#1}', '\\an': '\\textcolor{##f0abfc}{#1}',
};
const grab = (tag) => {
  const re = new RegExp('<' + tag + '>\\{([\\s\\S]*?)\\}<\\/' + tag + '>', 'g');
  const out = []; let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
};
const raws = [...grab('Eq'), ...grab('Block')];
let ok = 0, fails = [];
for (const raw of raws) {
  let tex;
  try { tex = Function('return (' + raw + ')')(); } catch (e) { fails.push({ raw: raw.slice(0, 60), err: 'JS-eval: ' + e.message }); continue; }
  try { katex.renderToString(String(tex), { displayMode: true, throwOnError: true, strict: 'ignore', macros: MACROS }); ok++; }
  catch (e) { fails.push({ tex: String(tex).slice(0, 70), err: e.message.slice(0, 90) }); }
}
console.log(`Rendered ${ok}/${raws.length} equations. Failures: ${fails.length}`);
fails.forEach(f => console.log('  ✗', JSON.stringify(f)));
