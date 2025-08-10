// assets/js/gemini-parser.js
// Gemini 응답을 안정적으로 JSON으로 파싱/정규화하는 유틸 모듈 (ESM)
// 사용처: survey-result.html 등에서 `import { parseGeminiSolution } from "/assets/js/gemini-parser.js"`

/** 우리가 기대하는 스키마 키 */
export const SOLUTION_KEYS = ["quick_wins", "plan_30d", "plan_90d", "risks", "kpis"];

/** ```json ... ``` 또는 텍스트에서 JSON 후보만 추출 */
function extractJsonCandidate(text) {
  if (!text) return "";
  // 1) 코드펜스 우선
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  // 2) 가장 바깥 중괄호 범위
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1).trim();
  }
  return text.trim();
}

/** 흔한 JSON 오류 자동 보정 */
function repairJsonString(s) {
  if (!s) return s;
  return s
    // 스마트 쿼트 -> 일반 쿼트
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // 주석 제거
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    // 트레일링 콤마 제거
    .replace(/,\s*([}\]])/g, "$1");
}

/** JSON.parse를 단계적으로 시도 */
function safeParseJson(raw) {
  const candidate = extractJsonCandidate(raw);
  const tries = [candidate, repairJsonString(candidate)];
  for (const s of tries) {
    try { return { ok: true, data: JSON.parse(s), raw: s }; } catch {}
  }
  return { ok: false, data: null, raw: candidate };
}

/** 스키마 정규화 및 검증: 각 키는 문자열 배열(최대 6개) */
function normalizeSolution(obj) {
  const out = {};
  for (const k of SOLUTION_KEYS) {
    let arr = Array.isArray(obj?.[k]) ? obj[k] : [];
    arr = arr
      .map(v => (typeof v === "string" ? v : JSON.stringify(v)))
      .map(s => (s || "").trim())
      .filter(Boolean);
    if (arr.length > 6) arr = arr.slice(0, 6);
    out[k] = arr;
  }
  const hasAny = SOLUTION_KEYS.some(k => (out[k]?.length || 0) > 0);
  return { ok: hasAny, data: out };
}

/** 공개 API: Gemini 원문 -> { ok, data, jsonText, warning } */
export function parseGeminiSolution(rawText) {
  const p = safeParseJson(rawText);
  if (!p.ok) {
    return { ok: false, data: null, jsonText: p.raw, warning: "JSON 파싱 실패" };
  }
  const n = normalizeSolution(p.data);
  if (!n.ok) {
    return { ok: false, data: p.data, jsonText: p.raw, warning: "스키마 검증 실패(콘텐츠 없음)" };
  }
  return { ok: true, data: n.data, jsonText: JSON.stringify(n.data, null, 2), warning: "" };
}

// (옵션) 디버그 노출
export const __internal = { extractJsonCandidate, repairJsonString, safeParseJson, normalizeSolution };
