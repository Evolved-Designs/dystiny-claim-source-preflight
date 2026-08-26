export const lensQuestions = Object.freeze({
  define: 'What does the claim mean, which terms and source versions control it, and what does the wording not establish?',
  compare: 'Which primary sources should be compared, where do they align or differ, and does either source update the other?',
  applicability: 'Which verified facts determine whether this rule, standard, or guidance applies, and which facts remain unknown?',
  evidence: 'What evidence would support, weaken, or falsify the claim, and which primary sources should be inspected first?'
});

export function buildQuestion(lens = 'define', claim = '') {
  const base = lensQuestions[lens] ?? lensQuestions.define;
  const clean = String(claim).trim().replace(/\s+/g, ' ').slice(0, 220);
  return clean ? `${base} Claim to examine: ${clean}.` : base;
}

export function buildDystinyUrl(lens = 'define', claim = '') {
  const valid = Object.hasOwn(lensQuestions, lens) ? lens : 'define';
  const url = new URL('https://dystiny.com/answer/');
  url.searchParams.set('q', buildQuestion(valid, claim));
  url.searchParams.set('utm_source', 'github_pages');
  url.searchParams.set('utm_medium', 'owned_research');
  url.searchParams.set('utm_campaign', 'claim_source_preflight');
  url.searchParams.set('utm_content', `lens_${valid}`);
  return url.toString();
}

export function preparedQuestionText(lens = 'define', claim = '') {
  return `Dystiny claim-to-source review\n\n${buildQuestion(lens, claim)}\n\nInspect primary sources before consequential decisions; this file is not a conformance certification.`;
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function init() {
  const form = document.querySelector('[data-builder]');
  if (!form) return;
  const claim = document.querySelector('#claim');
  const radios = [...form.querySelectorAll('input[name="lens"]')];
  const question = document.querySelector('[data-question]');
  const open = document.querySelector('[data-open]');
  const copy = document.querySelector('[data-copy]');
  const download = document.querySelector('[data-download]');
  const lens = () => radios.find((radio) => radio.checked)?.value ?? 'define';

  function render() {
    question.textContent = buildQuestion(lens(), claim.value);
    open.href = buildDystinyUrl(lens(), claim.value);
  }

  async function copyQuestion() {
    await navigator.clipboard.writeText(question.textContent);
    copy.textContent = 'Question copied';
    window.setTimeout(() => { copy.textContent = 'Copy question'; }, 1800);
  }

  radios.forEach((radio) => radio.addEventListener('change', render));
  claim.addEventListener('input', render);
  copy.addEventListener('click', () => copyQuestion().catch(() => { copy.textContent = 'Copy unavailable'; }));
  download.addEventListener('click', () => {
    downloadTextFile('dystiny-claim-to-source-review.txt', preparedQuestionText(lens(), claim.value));
    download.textContent = 'Review downloaded';
    window.setTimeout(() => { download.textContent = 'Download claim review'; }, 1800);
  });
  render();
}

if (typeof document !== 'undefined') init();
