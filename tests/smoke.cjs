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
  ['#/notes', '未完成'], ['#/notes/0', '若是一个人'],
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
assert.equal((main.innerHTML.split('</article></section>')[0].match(/<h3>/g) || []).length, 4, 'Biography has four stages');
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
assert.equal((main.innerHTML.match(/role="tab" /g) || []).length, 4);
assert.ok(/id="about-tab-intro"[^>]*aria-selected="true"/.test(main.innerHTML));
for (const id of ['experience', 'awards', 'publications']) {
  assert.ok(new RegExp(`id="about-panel-${id}"[^>]* hidden`).test(main.innerHTML));
}
const originalQuery = context.document.querySelectorAll;
const originalGet = context.document.getElementById;
const panels = Object.fromEntries(['intro', 'experience', 'awards', 'publications'].map(id => [id, {hidden:id !== 'intro'}]));
const buttons = Object.keys(panels).map(id => ({
  dataset: {aboutTab:id}, attributes:{}, tabIndex:0, focused:false,
  setAttribute(name,value) { this.attributes[name] = value; },
  focus() { this.focused = true; },
}));
context.document.querySelectorAll = selector => selector === '[data-about-tab]' ? buttons : [];
context.document.getElementById = id => id.startsWith('about-panel-') ? panels[id.slice(12)] : originalGet(id);
for (const selected of ['experience', 'awards', 'publications', 'intro']) {
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
assert.equal(essay.paragraphs.length, 10);
assert.equal(essay.paragraphs.at(-1), '这或许就是今天的我，从一个真实而矛盾的苏东坡身上得到的最大安慰。');
context.location.hash = '#/writing/' + essay.id;
vm.runInContext('route()', context);
for (const paragraph of essay.paragraphs) assert.ok(main.innerHTML.includes(paragraph));
assert.ok(!main.innerHTML.includes('示例文章'));
assert.ok(!main.innerHTML.includes('class="toc"'));
assert.equal(context.window.SAMPLE.articles.length, 4);
for (const removedId of ['a-place-for-thoughts', 'tools-and-attention', 'walking-without-a-goal']) {
  context.location.hash = '#/writing/' + removedId;
  vm.runInContext('route()', context);
  assert.ok(main.innerHTML.includes('404'));
}
console.log('PASS: four real articles have no sample notices; three removed sample routes return 404.');

const selfEssay = context.window.SAMPLE.articles.find(a => a.id === 'i-am-good-because-i-am-me');
assert.ok(selfEssay);
assert.equal(selfEssay.title, '我很好，因为我就是我');
assert.equal(selfEssay.category, '思考与记录');
assert.equal(selfEssay.date, '2026.10.09');
assert.equal(selfEssay.paragraphs.length, 6);
assert.equal(selfEssay.paragraphs.at(-1), '我们并不需要在所有方面都耀眼，才配得上喜欢自己。承认不足，然后继续生长；看见他人，也不遗失自己的步伐。所谓“我很好”，不是说我已经无可挑剔，而是说，即使此刻仍有缺憾、仍在前行，我也愿意尊重这个独一无二的自己。因为我不是任何标签的总和，我就是我。');
context.location.hash = '#/writing/' + selfEssay.id;
vm.runInContext('route()', context);
for (const paragraph of selfEssay.paragraphs) assert.ok(main.innerHTML.includes(paragraph));
assert.ok(!main.innerHTML.includes('示例文章'));
assert.ok(!main.innerHTML.includes('class="toc"'));
console.log('PASS: self-acceptance essay has 6 complete paragraphs and no sample notice.');

// Homepage never renders more than three articles, but makes extra content discoverable.
const articleData = context.window.SAMPLE.articles;
const temporaryArticles = [
  {id:'temporary-1',category:'测试',date:'2026.10.10',minutes:1,title:'临时文章一',intro:'仅用于首页容量测试。',sample:false,paragraphs:['一']},
  {id:'temporary-2',category:'测试',date:'2026.10.11',minutes:1,title:'临时文章二',intro:'仅用于首页容量测试。',sample:false,paragraphs:['二']},
];
articleData.push(...temporaryArticles);
const homeWithFive = vm.runInContext('home()', context);
assert.equal((homeWithFive.match(/class="writing-row"/g) || []).length, 3);
assert.ok(homeWithFive.includes('查看全部文章（共 6 篇）'));
assert.ok(!homeWithFive.includes('临时文章二'));
articleData.splice(-temporaryArticles.length, temporaryArticles.length);
const homeWithThree = vm.runInContext('home()', context);
assert.equal((homeWithThree.match(/class="writing-row"/g) || []).length, 3);
assert.ok(homeWithThree.includes('全部文章'));
assert.ok(homeWithThree.includes('查看全部文章（共 4 篇）'));
assert.equal((homeWithThree.match(/class="note"/g) || []).length, 2);
assert.ok(!homeWithThree.includes('文字持续更新，部分栏目暂保留示例内容。'));
assert.ok(!homeWithThree.includes('示例关注主题'));
const finalHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(finalHtml.includes('<p class="footer-title">很高兴，在这里遇见你。</p>'));
assert.ok(finalHtml.includes('关于我 ↗'));
assert.ok(!finalHtml.includes('关于这个小站'));
console.log('PASS: homepage caps articles at 3, notes at 2, and removes visible sample/footer-link copy.');


const latestCss = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
assert.ok(latestCss.includes('.full-notes{width:100%;max-width:none;'));
assert.ok(finalHtml.includes('styles.css?v=note-poem-1'));
console.log('PASS: notes list is fluid-width with a cache-busted stylesheet.');

const publications = context.window.PUBLICATIONS;
assert.equal(publications.length, 4);
const publicationMarkup = vm.runInContext('publicationsContent()', context);
assert.deepEqual(Array.from(publicationMarkup.matchAll(/datetime="(\d{4})"/g), m => m[1]), ['2026','2024','2023','2023']);
for (const paper of publications) {
  assert.ok(publicationMarkup.includes(paper.title));
  assert.ok(publicationMarkup.includes(paper.venue));
  assert.ok(fs.existsSync(path.join(root, paper.pdf)));
}
assert.ok(!publications.some(p => p.pdf.includes('Github_VLDB')));
console.log('PASS: 4 unique publications, descending years, PDF links and file existence.');

assert.ok(latestCss.includes("main{max-width:1120px;"));
assert.ok(!latestCss.includes("main:has(.full-notes)"));

assert.equal(context.window.SAMPLE.notes.find(n => n.tag === "AI与科研之外的生活").text, '尽管AI的出现和发展，使我对科研的兴趣寥寥，但不得不承认，AI的的确确将我从繁杂的科研任务中解放出来，使我在不影响科研工作进度的情况下，有更多的时间专注于自己感兴趣的事情——包括制作这个网站。');
assert.equal(context.window.SAMPLE.notes.find(n => n.tag === "AI与科研之外的生活").date, "10.09");
console.log("PASS: latest AI note preserves original text and date.");

assert.equal(context.window.SAMPLE.notes.find(n => n.tag === "明确自己的游戏").text, '尽可能努力明确自己要玩什么游戏。这件事情的重点在于，让你可以不受其他人的影响，因为你们玩的不是同一款游戏。就我而言，如果我要玩“高校老师”游戏，那我就不得不加入“卷论文”大军；但如果我玩的只是“博士毕业”游戏，我就可以更好安排自己的生活，而无需在乎其他人发了多少文章。');
assert.equal(context.window.SAMPLE.notes.find(n => n.tag === "明确自己的游戏").date, "10.10");
console.log("PASS: latest game note preserves original text and date.");

assert.equal(context.window.SAMPLE.notes.find(n => n.tag === "财富与生活的自主权").text, '财富带给你的最大幸福感是，极大地提升了你对自己生活的掌握度——每天早上醒来，都可以决定你要如何度过这一天。');
assert.equal(context.window.SAMPLE.notes.find(n => n.tag === "财富与生活的自主权").date, "10.10");
console.log("PASS: latest wealth note preserves original text and date.");

const readingNotes = [{"date": "10.13", "tag": "制度与人事", "text": "制度必须与人事相配合。辛亥革命前后，人人言变法，太重视了制度，好像只要建立制度，一切人事自会随制度转变。首先，要讲一代的制度，必先精熟一代的人事。若离开人事单来看制度，则制度只是一条条的条文，似乎枯燥乏味，无可讲。而且已经明日黄花，也不必讲。"}, {"date": "10.13", "tag": "中国的红色政权为什么能够存在？", "text": "中国白色政权的分裂和战争是持续不断的，则红色政权的发生、存在并且日益发展，便是无疑的了。————《中国的红色政权为什么能够存在？》"}, {"date": "10.13", "tag": "置身事内：担当与容错", "text": "但在尚未完成转型之前，习惯了旧有工作方式的地方官员在反腐高压之下难免变得瞻前顾后、畏首畏尾。2016年，中央开始强调“庸政懒政怠政也是一种腐败”，要破除“为官不为”。2018年，中国中央办公厅引发《关于进一步激励广大干部新时代新担当新作为的意见》，强调建立健全容错机制，宽容干部在改革创新中的失误错误，把干部在推进改革中因缺乏经验、先行先试的失误错误同明知故犯的违纪违法行为区分开来；把尚无明确限制的探索性实验中的失误错误，同明令禁止后依旧我行我素的违纪违法行为区分开来；把为推动发展的无意过失，同为谋取私利的违纪违法行为区分开来。这些措施如何落到实处，还有待观察。————《置身事内》"}];
for (const note of readingNotes) {
  const i = context.window.SAMPLE.notes.findIndex(n => n.tag === note.tag);
  assert.equal(context.window.SAMPLE.notes[i].text, note.text);
  assert.equal(context.window.SAMPLE.notes[i].date, note.date);
  context.location.hash = "#/notes/" + i;
  vm.runInContext("route()", context);
  assert.ok(main.innerHTML.includes(note.text));
}
console.log("PASS: three October 13 reading notes preserve original text, dates and render on detail routes.");

const movieEssay = context.window.SAMPLE.articles.find(a => a.id === "article-20");
assert.equal(movieEssay.title, "第二十条");
assert.equal(movieEssay.date, "2024.02.18");
const movieOriginal = ["看了《第二十条》，心情久久不能平静，沉默良久。", "具体来说，整个影片中透露出来的潜规则让我感到绝望，如“什么该说，什么不该说”，“都这么办的，我能怎么办？”，“不求有功，但求无过”等等。影片最后说到“法不能向不法让步”，“法律维护的是公平正义”，这着实值得深思。在我看来，法律维护的并不只是公平正义，更像是一种权衡利弊之后的妥协，或者说，执法部门的执法是政治性，经济性，公平正义等方面博弈之后的产物。", "同样的法规，相似的案件，为什么之前判故意伤害，之后就可以判正当防卫，问题在法律吗？韩明说他相信法律没错，那么谁错了呢？我认为错在执法者执法，执法者也是一个个的人，“不求有功，但求无过“的思想自然会影响到他们的执法办案，所以才会有”之前的怎么办的，之后就怎么办“的现实。而执法者的执法重点会放在哪里呢？事实上就是，上级机关看重哪里，执法重点就会放到哪里。", "影片最后的公平正义的实现，是来自于韩明振聋发聩的演讲，进而引起了执法者的共鸣吗？我觉得不是，更多的是郝秀萍跳楼升级了事件，引发了社会舆论的关注，进一步地，引起了最高检的关注，在最高检的主导下，案件才得以被定性为正当防卫。如果没有最高检的主导和支持，案件能得以改性吗？恐怕很难，剧中的田检、王检、人民督察员以及人大代表等其实并不认可定性为正当防卫。", "再说个例子吧，反腐倡廉是在2013年以后被逐渐提起的，难道2013年以前官员都是清廉的吗？恐怕不是，那为什么2013年以前不能反腐？难道他们没有违法乱纪吗？他们当然违法乱纪了，但2013年以前，上级机关更看重经济发展，更看重GDP，因此在所谓的法律性和经济性之间选择了经济性，因此并非他们不犯法，而是执法者的重点发生了偏移。", "法律判的不是一个个案子，而是一个个人的人生。话虽如此，但我们不能要求每一个执法者都能做到面面俱到，他们也只是生活中的普通人罢了。但执法机关的权力应该得到监督，受人民的监督。执法为民不应该是一句空话，同时，在面对不公的判罚时，人民应该有较小的代价来维护他们的合法权益，绝对不能“谁有钱，谁能耗，谁有理”，现在的多数情况都是，弱势的一方迫于经济成本，时间成本等被迫妥协。法律仍需进步，我们也仍需进步。"];
assert.equal(JSON.stringify(movieEssay.paragraphs), JSON.stringify(movieOriginal));
context.location.hash = "#/writing/article-20";
vm.runInContext("route()", context);
for (const p of movieOriginal) assert.ok(main.innerHTML.includes(p));
assert.ok(main.innerHTML.includes("2024.02.18"));
console.log("PASS: Article 20 preserves all six original paragraphs and specified date.");

const grassrootsOriginal = [{"year": 2024, "date": "11.05", "tag": "干群关系中的两种困境", "text": "多数情况下，干群关系的矛盾，主要有两种情况：一，干部不做调查研究，不详细了解情况，不知道群众的诉求，一拍脑袋就下了决定，会给群众的正常生活带来许多不便和烦恼，极大降低群众对干部的信任，甚至破坏党和政府的公信力。二，干部知道群众的诉求，但在自己的能力范围之内，没有办法解决具体的问题，这种情况虽比前一种情况好很多，但仍然会降低群众对于干部的信任，对后续工作开展不利。前者主要是干部为了自己所谓的“政绩观”，完全忽视群众的实际需求，进而导致干群关系破裂，责任在干部；后者更多则是基层工作的无奈，有的事情中央尚且都没有定论，基层怎么开这个头？有的事情，“公说公有理，婆说婆有理”，不好决策；有的事情呢，要涉及多个部门的沟通协调配合，又岂是一个基层干部就能决断？"}, {"year": 2024, "date": "11.05", "tag": "上面千根线，下面一根针", "text": "“上面千根线，下面一根针”，中央的决策能不能落实，取决于基层。基层工作，与高层工作是不一样的，主要是面向的对象是不一样的，高层领导主要面对其他政府工作人员，这和直接面对基层民众是不一样的。中央的政策，有些容易得到民众的支持，而有些则不然。容易得到支持的，自然不必多讲。但对于那些民众不支持的政策，上面要求你必须完成，这个时候，只讲政策和法规自然是无用的，但基层干部也不能逼着农众他们做吧？"}, {"year": 2024, "date": "11.05", "tag": "理解百姓不配合的缘由", "text": "“中国的老百姓是世界上最好的老百姓了”，在我看来，百姓是再简单不过的了。有许多人说，现在的百姓都是“刁民”，这不配合，那不配合。但在我看来，说这些的人，是“站着说话腰不疼”，即使有些政策百姓不配合，但其背后有没有缘由呢？绝大多数情况下都是有的。很多时候，农村很多百姓，他们不求大富大贵，只求个吃穿不愁，这已然是很朴素的愿望了。有的时候，百姓不配合，因为他们没底气，比如，改种作物。这种事情断然很难推行下去。一是，农户不懂该农作物的种植技术，怕颗粒无收；二是，农户不了解销售行情，又怕血本无归；三是，类似吃亏的事情多了，农户的信任自然大打折扣。这种情况下，我们能抱怨百姓不配合吗？有的同志讲，实验嘛，总有成功有失败，但当失败的代价是你自己全家人一年甚至几年都吃不饱饭，这时候你还会积极配合吗？所以，推行这种事情，一则靠政府兜底，确保农户不亏；二则靠同乡带动，小范围试点成功，再大范围推广。"}, {"year": 2024, "date": "11.05", "tag": "信任从何而来", "text": "面对基层群众，只讲政策和法规绝大多数情况下是没用的。什么有用呢？信任。信任是基层社会的运转底层逻辑，因此，基层工作进入基层的第一件事，就应该是获取民众的信任。信任又从何而来呢？无它，解决问题和以心换心两点罢了。"}, {"year": 2024, "date": "11.05", "tag": "基层的规则与道德观", "text": "中国自古就有“皇权不下县”的说法，这并非说皇权管不到县级以下的地区，而是说在县以下的区域内（姑且称之为基层），自有一套独立于县级以上区域的政治法则以及行事准则。基层的治理在绝大多数情况下，都不是靠法律，制度等固定的规则，更多情况下，是依靠着一种这片土地上历经数千年逐步形成的一种不同于法律、制度的道德观。"}, {"year": 2024, "date": "11.05", "tag": "熟人社会中的信任", "text": "举个例子，城市中绝大情况下，“信任”是需要官方机构来保证的，比如租房子要签合同，借贷款要签合同，合同背后的保证完全来自于政府执法机关，就是说，即使你和对方全然不熟悉，依然有政府机关替你规避了风险。当然，法治国家依法治国，这并没有什么问题。但在基层并非完全是这样运转，基层的信任主要来自于日久接触，这是不依赖于任何官方机构的。这就意味着，基层是一个熟人社会，很多事情要靠人情来支撑，而不仅仅是法律法规。这有没有风险呢？有的，但是这就是基层的规则和逻辑。话说回来，难道依靠法律就没有风险吗？其实也是有的。"}];
const allNotes = context.window.SAMPLE.notes;
assert.equal(allNotes.filter(n => n.year === 2024).length, 6);
for (const [offset, expected] of grassrootsOriginal.entries()) {
  const index = allNotes.length - 6 + offset;
  assert.equal(JSON.stringify(allNotes[index]), JSON.stringify(expected));
  context.location.hash = "#/notes/" + index;
  vm.runInContext("route()", context);
  assert.ok(main.innerHTML.includes(expected.text));
  assert.ok(main.innerHTML.includes("2024.11.05"));
  assert.ok(!main.innerHTML.includes("2026.11.05"));
}
assert.ok(vm.runInContext("noteCard(notes.at(-1),notes.length-1)",context).includes("2024.11.05"));
console.log("PASS: six historical notes preserve original paragraphs, order and 2024.11.05 dates.");

for (let i=0;i<allNotes.length;i++) {
  const expectedDate = `${allNotes[i].year || 2026}.${allNotes[i].date}`;
  assert.match(expectedDate, /^\d{4}\.\d{2}\.\d{2}$/);
  assert.ok(vm.runInContext(`noteCard(notes[${i}],${i})`,context).includes(`class="note-date">${expectedDate}</span>`));
  context.location.hash = "#/notes/" + i;
  vm.runInContext("route()",context);
  assert.ok(main.innerHTML.includes(expectedDate));
}
console.log("PASS: every note card and detail uses YYYY.MM.DD dates.");

const revolutionEssay = context.window.SAMPLE.articles.find(a => a.id === "china-revolution-leadership");
assert.equal(revolutionEssay.title, "为什么说只有中国共产党才能领导中国取得革命胜利？");
assert.equal(revolutionEssay.date,"2024.12.14");
const revolutionOriginal = ["一个考研政治近代史纲要部分中经常出现的问题，我听到的最多的一个答案是，自近代以来，无数先烈试图救亡中国，例如洋务运动、戊戌变法、辛亥革命等，但他们均以失败告终。只有中国共产党领导下的革命战争取得了胜利，因此说只有中国共产党才能领导中国取得革命胜利。虽然我考研政治的答卷上也写了类似的答案，但一直以来有一个问题在困扰我，即如果说是历史结果证明了，只有中国共产党才能领导中国取得革命胜利，那么当初的投身于共产主义事业的先辈们，又是靠着什么坚信只有中国共产党才能领导中国，只有社会主义才能救中国这一理想信念，并愿意为之付出生命的代价呢？他们并没有看到未来，甚至在那个时候，中国共产党领导的工农红军在反动势力面前显得如此不堪一击。这背后一定有更深层的原因，也正是基于这样深层次的原因，才让他们坚信，只有中国共产党能。", "近代的中国，半殖民地半封建社会，总的来看有三座大山：帝国主义、封建主义和官僚资本主义。自一九二四年开始的革命战争直到一九四五年抗日战争的结束，中华民族的主要敌人，是帝国主义和封建主义；而自一九四五年开始至一九四九年新中国成立，中国革命战争的主要敌人，是官僚资本主义。在前一个阶段，首先可以排除的封建势力和帝国主义来领导中国的革命战争；中国资产阶级，是在一定程度上参与了中国革命战争，也是我们要团结的对象之一，因为我们的主要敌人是帝国主义和封建主义。但他们能不能当领导者呢？不能的，因为它的自私自利性和政治上经济上的缺乏独立性，不愿意也不能领导中国革命战争走上彻底胜利的道路。中国农民群众和城市小资产阶级群众？他们可以说是，愿意积极参加革命战争，因为帝国主义和封建主义对他们的生活造成了极大的破坏，他们是革命的主力军，但是他们的小生产的特点，使他们的政治眼光受到限制（一部分失业群众则具有无政府思想），所以他们不能成为战争的正确的领导者。因此，在无产阶级已经走上政治舞台的时代，中国革命战争的领导责任，就不得不落到中国共产党的肩上。在这种时候，任何的革命战争如果没有或违背无产阶级和共产党的领导，那个战争是一定要失败的。因为半殖民地的中国的社会各阶层和各种政治集团中，只有无产阶级和共产党，才最没有狭隘性和自私自利性，最有远大的政治眼光和最有组织性，而且也最能虚心地接受世界上先进的无产阶级及其政党的经验而用之于自己的事业。因此，只有无产阶级和共产党能够领导农民、城市小资产阶级和资产阶级，克服农民和小资产阶级的狭隘性，克服失业者群的破坏性，并且还能够克服资产阶级的动摇和不彻底性（如果共产党的政策不犯错误的话），而使革命和战争走上胜利的道路。"];
assert.equal(JSON.stringify(revolutionEssay.paragraphs),JSON.stringify(revolutionOriginal));
context.location.hash = "#/writing/china-revolution-leadership";
vm.runInContext("route()",context);
for (const p of revolutionOriginal) assert.ok(main.innerHTML.includes(p));
assert.ok(main.innerHTML.includes("2024.12.14"));
assert.deepEqual(Array.from(context.window.SAMPLE.articles,a=>a.date),["2026.10.09","2026.10.09","2024.12.14","2024.02.18"]);
console.log("PASS: revolution essay preserves original text, specified date and article date order.");

const poemOriginal = "终身浪漫的开始，\n\n对我而言，\n\n也许不是心有所属，两情相悦，\n\n这固然令人羡慕，\n\n但爱自己，爱生活，\n\n如此便是一个人，亦是良辰美景，\n\n爱自己才是终身浪漫的开始。";
assert.equal(allNotes[0].tag,"若是一个人");
assert.equal(allNotes[0].text,poemOriginal);
assert.equal(vm.runInContext("noteDate(notes[0])",context),"2026.10.13");
assert.equal(allNotes[0].text.split("\n\n").length,7);
context.location.hash = "#/notes/0";
vm.runInContext("route()",context);
assert.ok(main.innerHTML.includes(poemOriginal));
assert.ok(main.innerHTML.includes('<blockquote class="note-text">'));
assert.ok(latestCss.includes(".note-text{white-space:pre-wrap}"));
console.log("PASS: poem preserves seven lines, paragraph breaks and 2026.10.13 date.");
