const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const main = { innerHTML: '', focus() {} };
const theme = { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; }, addEventListener() {} };
const context = {
  window: { addEventListener() {}, scrollTo() {} },
  document: {
    getElementById(id) { return id === 'content' ? main : theme; },
    querySelectorAll() { return []; },
    addEventListener() {},
    body: { classList: { toggle() {} } },
  },
  location: { hash: '#/' },
  localStorage: { getItem() { return null; } },
};
vm.createContext(context);
for (const name of ['content.js', 'app.js']) vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), context);
const cases = [
  ['#/', '认真生活'], ['#/writing', '把想法'],
  ['#/notes', '未完成'], ['#/notes/0', '不必等到'],
  ['#/projects', '动手试试'], ['#/about', '自我介绍'],
  ...context.window.SAMPLE.articles.map(a => ['#/writing/' + a.id, a.title]),
  ...context.window.SAMPLE.projects.map(p => ['#/projects/' + p.id, p.title]),
  ['#/missing', '404'], ['#/notes/no', '404'],
  ['#/notes/-1', '404'], ['#/writing/missing', '404'], ['#/projects/missing', '404'],
];
for (const [hash, expected] of cases) {
  context.location.hash = hash;
  vm.runInContext('route()', context);
  assert.ok(main.innerHTML.includes(expected), hash);
  assert.ok(!main.innerHTML.includes('undefined'), hash + ': unexpected undefined');
}
assert.equal(vm.runInContext("esc('<script>')", context), '&lt;script&gt;');
context.location.hash = '#/about';
vm.runInContext('route()', context);
assert.equal(context.document.title, '关于 · Qi');
for (const text of [
  '你好，我是梁琪。',
  '目前在上海交通大学攻读计算机专业博士学位。',
  '科研不该是我生活的全部，也不该成为每一位博士生活的全部。放在人生的尺度上，它只是其中的一小部分。',
  '谨以此站，记录我的故事、我的探索，以及生命沿途的点滴。',
  '中国地质大学（武汉）',
  '成绩排名专业第 14',
  '具体分数已经记不太清',
  '广州大学',
  '党支部副书记',
  'SIGMOD 2024',
  'VLDB 2024',
  '四次雅思考试',
  '该论文创新不足，工作量较低，不足以支撑硕士毕业。',
  '半年多的空档期',
  '26 岁',
  '未完待续……',
]) assert.ok(main.innerHTML.includes(text), 'About biography: ' + text);
for (const text of ['这里将放置你的故事', 'about-card', '不必一次介绍完整', '你会在这里读到什么', '此页面为介绍文案的占位样本', '你的名字']) {
  assert.ok(!main.innerHTML.includes(text), 'Removed about text: ' + text);
}
assert.equal((main.innerHTML.match(/<h3>/g) || []).length, 4, 'Biography has four stages');
assert.ok(main.innerHTML.includes('更像是一个审核者和搬运者'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(html.includes('© 2026 Qi'));
assert.ok(html.includes('一个用来记录生命，也慢慢认识自己的地方。'));
assert.ok(!html.includes('设计预览 · 全部内容为示例'));
assert.ok(!html.includes('你的名字'));
assert.ok(html.includes('class="theme-moon"'));
assert.ok(html.includes('class="theme-sun"'));
assert.ok(!html.includes('◐'));
assert.ok(html.includes('<span class="brand-mark" aria-hidden="true"><svg')); 
assert.ok(html.includes('href="assets/favicon.svg"'));
for (const asset of ['qi-seal.svg', 'favicon.svg']) {
  const svg = fs.readFileSync(path.join(root, 'assets', asset), 'utf8');
  assert.ok(svg.includes('<path '));
  assert.ok(!svg.includes('<text'), 'Logo must not depend on client fonts');
}
assert.ok(!html.includes('>自</span>'));
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
assert.ok(css.includes("--serif:'Songti SC','STSong','SimSun'"));
assert.ok(/body\{[^}]*font-family:var\(--serif\)/.test(css));
assert.ok(!css.includes('font-family:monospace'));
for (const [dark, label] of [[true, '切换到浅色模式'], [false, '切换到深色模式']]) {
  vm.runInContext(`setTheme(${dark})`, context);
  assert.equal(theme.attributes['aria-label'], label);
  assert.equal(theme.title, label);
}
console.log(`PASS: ${cases.length} route cases, HTML escaping, personal biography and footer assertions (DOM stub; not a browser test).`);

// About tab markup defaults to the original biography on each route render.
context.location.hash = '#/about';
vm.runInContext('route()', context);
assert.equal((main.innerHTML.match(/role="tab" /g) || []).length, 3);
assert.ok(/id="about-tab-intro"[^>]*aria-selected="true"/.test(main.innerHTML));
for (const id of ['experience', 'awards']) {
  assert.ok(new RegExp(`id="about-panel-${id}"[^>]* hidden`).test(main.innerHTML));
}
const originalQuery = context.document.querySelectorAll;
const originalGet = context.document.getElementById;
const panels = Object.fromEntries(['intro', 'experience', 'awards'].map(id => [id, {hidden:id !== 'intro'}]));
const buttons = Object.keys(panels).map(id => ({
  dataset: {aboutTab:id}, attributes:{}, tabIndex:0, focused:false,
  setAttribute(name,value) { this.attributes[name] = value; },
  focus() { this.focused = true; },
}));
context.document.querySelectorAll = selector => selector === '[data-about-tab]' ? buttons : [];
context.document.getElementById = id => id.startsWith('about-panel-') ? panels[id.slice(12)] : originalGet(id);
for (const selected of ['experience', 'awards', 'intro']) {
  vm.runInContext(`selectAboutTab('${selected}', true)`, context);
  for (const button of buttons) {
    const active = button.dataset.aboutTab === selected;
    assert.equal(button.attributes['aria-selected'], String(active));
    assert.equal(button.tabIndex, active ? 0 : -1);
    assert.equal(panels[button.dataset.aboutTab].hidden, !active);
    if (active) assert.ok(button.focused);
  }
}
vm.runInContext("selectAboutTab('invalid')", context);
assert.equal(panels.intro.hidden, false);
context.document.querySelectorAll = originalQuery;
context.document.getElementById = originalGet;
console.log('PASS: About tab defaults, switching, focus and invalid selection (DOM stub).');

const profile = context.window.PROFILE;
assert.equal(profile.education.length, 4);
assert.equal(profile.activities.length, 6);
assert.equal(profile.awards.length, 11);
for (const title of [
  '广州大学网络空间先进技术研究院善学奖',
  '中国地质大学（武汉）“辩协杯”最佳辩手',
  '湖北省关爱留守儿童彩虹行动“先锋志愿队”称号',
  '中国地质大学（武汉）优秀共青团干部',
]) assert.equal(profile.awards.filter(award => award.title === title).length, 1);
assert.ok(!profile.awards.some(award => award.title.includes('网络空间安全法律基础') || award.title.includes('论文写作指导')));
assert.equal(profile.education[0].start, '2014.09');
assert.equal(profile.education[3].start, '2025.04');
assert.equal(profile.education[3].end, null);
assert.equal(profile.education[3].school, '上海交通大学');
const experienceMarkup = vm.runInContext('experienceContent()', context);
const awardsMarkup = vm.runInContext('awardsContent()', context);
for (const item of profile.education) {
  assert.ok(experienceMarkup.includes(item.school));
  assert.ok(experienceMarkup.includes(item.start));
  if (item.end) assert.ok(experienceMarkup.includes(item.end));
}
for (const activity of profile.activities) assert.ok(experienceMarkup.includes(activity));
for (const award of profile.awards) assert.ok(awardsMarkup.includes(award.title));
assert.equal((awardsMarkup.match(/团队荣誉/g) || []).length, 2);
assert.deepEqual(Array.from(awardsMarkup.matchAll(/datetime="(\d{4})"/g), m => m[1]), ['2024','2021','2020','2019','2018']);
assert.ok(experienceMarkup.includes('至今'));
assert.ok(!main.innerHTML.includes('这部分内容将在之后补充'));
console.log('PASS: 4 education records, 6 activities, 11 awards, updated titles, 2 team honors and year ordering.');

const essay = context.window.SAMPLE.articles.find(a => a.id === 'sudongpo-finding-peace-in-contradictions');
assert.ok(essay);
assert.equal(essay.title, '在矛盾中安顿自己——读郭宝平《苏东坡》有感');
assert.equal(essay.category, '读书随笔');
assert.equal(essay.date, '2026.10.09');
assert.equal(essay.sample, false);
assert.equal(essay.paragraphs.length, 10);
assert.equal(essay.paragraphs.at(-1), '这或许就是今天的我，从一个真实而矛盾的苏东坡身上得到的最大安慰。');
context.location.hash = '#/writing/' + essay.id;
vm.runInContext('route()', context);
for (const paragraph of essay.paragraphs) assert.ok(main.innerHTML.includes(paragraph));
assert.ok(!main.innerHTML.includes('示例文章'));
assert.ok(!main.innerHTML.includes('class="toc"'));
context.location.hash = '#/writing/a-place-for-thoughts';
vm.runInContext('route()', context);
assert.ok(main.innerHTML.includes('示例文章'));
assert.ok(main.innerHTML.includes('class="toc"'));
console.log('PASS: real essay has 10 complete paragraphs and no sample notice; sample articles retain notices and TOC.');

const selfEssay = context.window.SAMPLE.articles.find(a => a.id === 'i-am-good-because-i-am-me');
assert.ok(selfEssay);
assert.equal(selfEssay.title, '我很好，因为我就是我');
assert.equal(selfEssay.category, '思考与记录');
assert.equal(selfEssay.date, '2026.10.09');
assert.equal(selfEssay.sample, false);
assert.equal(selfEssay.paragraphs.length, 6);
assert.equal(selfEssay.paragraphs.at(-1), '我们并不需要在所有方面都耀眼，才配得上喜欢自己。承认不足，然后继续生长；看见他人，也不遗失自己的步伐。所谓“我很好”，不是说我已经无可挑剔，而是说，即使此刻仍有缺憾、仍在前行，我也愿意尊重这个独一无二的自己。因为我不是任何标签的总和，我就是我。');
context.location.hash = '#/writing/' + selfEssay.id;
vm.runInContext('route()', context);
for (const paragraph of selfEssay.paragraphs) assert.ok(main.innerHTML.includes(paragraph));
assert.ok(!main.innerHTML.includes('示例文章'));
assert.ok(!main.innerHTML.includes('class="toc"'));
console.log('PASS: self-acceptance essay has 6 complete paragraphs and no sample notice.');
