const {articles,notes,projects}=window.SAMPLE;
const main=document.getElementById('content');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sectionTitle=(n,title,en,link,label)=>`<div class="section-heading"><div class="section-title"><span class="number">${n}</span><h2>${title}</h2><span class="english">${en}</span></div>${link?`<a class="all-link" href="${link}">${label} ↗</a>`:''}</div>`;
const articleRow=a=>`<a class="writing-row" href="#/writing/${a.id}"><time class="row-date">${a.date}</time><div class="row-body"><h3>${esc(a.title)}</h3><p>${esc(a.intro)}</p><div class="meta"><span class="category">${esc(a.category)}</span><span>·</span><span>约 ${a.minutes} 分钟</span></div></div><span class="row-arrow" aria-hidden="true">↗</span></a>`;
const noteCard=(n,i)=>`<div class="note"><span class="note-date">${n.date}</span><div><p>${esc(n.text)}</p><a href="#/notes/${i}" class="tag">${esc(n.tag)} · 示例随想 ↗</a></div></div>`;
const projectCard=p=>`<a class="project-card" href="#/projects/${p.id}"><span class="eyebrow">${esc(p.type)}</span><span class="arrow">↗</span><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><div class="chips">${p.tags.map(t=>`<span class="chip">${esc(t)}</span>`).join('')}</div></a>`;
const intro=(en,title,desc)=>`<div class="page-intro"><div class="eyebrow">${en}</div><h1>${title}</h1>${desc?`<p>${desc}</p>`:''}</div>`;
function home(){return `<section class="hero"><div><div class="eyebrow">THOUGHTS, NOTES & EVERYDAY LIFE</div><p class="hello"><span class="dot"></span>你好，欢迎来到我的小站</p><h1>认真生活，<br><em>慢慢思考。</em></h1><p class="hero-description">关于那些值得多想一会儿的问题，<br>和日常里不想轻易忘记的片刻。<br>这里是我的文字、实践，与尚未完成的想法。</p><div class="hero-actions"><a class="button" href="#/writing">读一些文字 <span>↗</span></a><a class="text-link" href="#/about">更多关于我 ↗</a></div></div><aside><div class="journal"><div class="journal-top"><span>THE OPEN NOTEBOOK</span><span>NO. 001</span></div><div class="journal-center"><p>不急于给出答案，<br>先把<span>好的问题</span><br>留下来。</p></div><div class="journal-bottom"><span>保持好奇，持续记录。</span><span>一页未完的笔记 ↙</span></div></div><p class="sample-small">＊ 这是一个样本网站，文字与身份信息均可替换。</p></aside></section><section class="section">${sectionTitle('01','写下来的思考','SELECTED WRITING','#/writing','全部文章')}<div>${articles.map(articleRow).join('')}</div></section><section class="section split"><div>${sectionTitle('02','最近的随想','FIELD NOTES','#/notes','更多随想')}${notes.slice(0,2).map(noteCard).join('')}</div><aside class="now"><div class="now-title"><span>此刻，正在关注</span><span class="dot"></span></div><p>留一个位置，记录当下的好奇心。</p><ul><li>写作与个人知识整理</li><li>技术如何融入日常生活</li><li>那些缓慢发生的变化</li></ul><small>示例关注主题 · 可自由替换</small></aside></section><section class="section">${sectionTitle('03','一些小小的实践','SELECTED EXPLORATIONS','#/projects','查看全部')}<div class="project-grid">${projects.map(projectCard).join('')}</div></section>`}
function writing(){return intro('WRITING / 文章','把想法，慢慢写清楚。','一些关于工具、生活与个人成长的记录。不追求每篇都有答案，只希望每次多理解一点。')+`<div class="filters" role="group" aria-label="按主题筛选文章">${['全部',...new Set(articles.map(a=>a.category))].map((t,i)=>`<button class="filter ${i===0?'active':''}" aria-pressed="${i===0}" data-filter="${esc(t)}">${esc(t)}</button>`).join('')}</div><div class="listing" id="article-list">${articles.map(articleRow).join('')}</div>`}
function article(a){return `<div class="article-header"><a class="back" href="#/writing">← 返回文章</a><h1>${esc(a.title)}</h1><div class="meta"><span class="category">${esc(a.category)}</span><span>${a.date}</span><span>约 ${a.minutes} 分钟</span></div><p class="article-deck">${esc(a.intro)}</p><div class="notice">示例文章 · 本文仅用于展示阅读体验，不代表网站所有者的真实观点或经历。</div></div><div class="article-layout"><article class="prose">${a.sections.map((s,i)=>`<section id="section-${i}"><h2>${esc(s[0])}</h2>${s.slice(1).map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')}<div class="article-end"><span>感谢读到这里。</span><a href="#/writing">继续阅读 ↗</a></div></article><aside class="toc"><span class="eyebrow">ON THIS PAGE</span>${a.sections.map((s,i)=>`<a href="#section-${i}" data-section="section-${i}">${String(i+1).padStart(2,'0')}　${esc(s[0])}</a>`).join('')}</aside></div>`}
function experienceContent(){
  const profile=window.PROFILE;
  return `<div class="profile-section"><h2 class="profile-heading">教育经历</h2><ol class="education-timeline">${profile.education.map(item=>`<li class="education-item"><div class="education-period"><time datetime="${esc(item.start.replace('.','-'))}">${esc(item.start)}</time><span aria-hidden="true"> — </span>${item.end?`<time datetime="${esc(item.end.replace('.','-'))}">${esc(item.end)}</time>`:'<span>至今</span>'}</div><div class="education-school">${esc(item.school)}${!item.end?'<span class="profile-badge">在读</span>':''}</div></li>`).join('')}</ol></div><div class="profile-section"><h2 class="profile-heading">学生工作与志愿服务</h2><ul class="service-list">${profile.activities.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></div>`;
}
function awardsContent(){
  const awards=window.PROFILE.awards;
  const years=[...new Set(awards.map(item=>item.year))].sort((a,b)=>b-a);
  return `<div class="profile-section"><h2 class="profile-heading">奖项与荣誉</h2><div class="awards-years">${years.map(year=>`<section class="award-year" aria-label="${year} 年奖项与荣誉"><div class="award-year-label"><time datetime="${year}">${year}</time></div><ul class="award-list">${awards.filter(item=>item.year===year).map(item=>`<li><span>${esc(item.title)}</span>${item.team?'<span class="profile-badge">团队荣誉</span>':''}</li>`).join('')}</ul></section>`).join('')}</div></div>`;
}
const aboutTabItems = [
  {id:'intro', label:'自我介绍'},
  {id:'experience', label:'经历'},
  {id:'awards', label:'奖项'},
];
function about(){return intro('ABOUT / 关于','一份慢慢写下的自我介绍。','')+`<div class="about-tabs" role="tablist" aria-label="关于我的不同方面">${aboutTabItems.map((tab,i)=>`<button type="button" role="tab" id="about-tab-${tab.id}" class="about-tab" data-about-tab="${tab.id}" aria-controls="about-panel-${tab.id}" aria-selected="${i===0}" tabindex="${i===0?'0':'-1'}">${tab.label}</button>`).join('')}</div><div class="about-content"><section id="about-panel-intro" role="tabpanel" aria-labelledby="about-tab-intro" tabindex="0"><article class="prose">
<h2>你好，我是梁琪。</h2>
<p>目前在上海交通大学攻读计算机专业博士学位。</p>
<h3>本科：热闹的生活，未定的方向</h3>
<p>本科就读于中国地质大学（武汉）时，我还没有走上研究之路。那时的我，更多地穿梭于不同的学生组织之间：辩论队、棋协、书香社、治保部、明德风·爱心助学团，参与或组织着一场又一场学生活动。与此同时，我的学业也保持在不错的水平，成绩排名专业第 14。</p>
<p>但这些丰富的经历，并没有让我找到属于自己的方向。</p>
<p>大三末，我决定考研，最终却未能考上第一志愿。回头看，自己的复习确实不够扎实，尤其是在数学一上，很多时候只是得过且过，没有真正掌握。最后的成绩大约是 75 分——具体分数已经记不太清，但印象中相差不多。或许正因为有数学专业的背景，我反而多了一份自满，觉得高数不过如此，真正考试时才发现并非如此。其余三科，因为心里没底，反倒认真准备，最后取得了较为理想的成绩。</p>
<p>考研失利后，摆在我面前的有两条路：找工作，或者调剂。我同时做了两手准备，也都得到了一些结果：在技术积累并不丰富的情况下，收到了两份工作 offer，也收到了广州大学的录取通知。</p>
<p>当时我的想法很直接：以现在的技术水平，已经能找到两份还算不错的工作；如果再用三年读研、精进技术，毕业后难道不会有更好的机会吗？带着这样的期待，我选择了继续求学。</p>
<h3>硕士：走进科研，也重新认识选择</h3>
<p>硕士期间，我开始了自己的研究，减少了许多学生工作。不过，这方面的经历也有了新的延续：我担任了党支部副书记。这份工作让我对党内事务有了初步认识，也加深了对党的理论知识的理解。</p>
<p>我的第一项科研工作，起步算得上顺利。阅读文献不久，我便发现了一个较为新颖的思路。但由于自己的懈怠，代码实现一拖再拖，直到研二下学期才完成论文定稿，并首次尝试投稿 SIGMOD 2024。第一次投稿，许多地方都不够完善，最终遭到了拒稿。</p>
<p>尽管如此，我仍然感谢其中两位审稿人提出的宝贵意见。一位审稿人甚至用长达四页 A4 纸的篇幅，给出了细致的语法修改建议。此后，我修改论文，转投 VLDB，在经历一轮 Revision 后，最终被 VLDB 2024 接受。</p>
<p>或许是第一项研究工作的相对顺利，让我萌生了读博的想法，甚至开始憧憬博士毕业后的美好生活。那时，我确实很坚定，但这份坚定并不来自对科研的热爱，也不来自对自己的深刻了解。坦率地说，那不是一个深思熟虑后的决定，而是在对未来生活的想象中，过于草率地做出的选择。因此，我没有投入精力求职，而是专心准备继续读博。</p>
<p>后来，有两件事对我产生了较大的影响。</p>
<p>第一件，是在参加四次雅思考试后，我的成绩仍未达到出国留学的语言要求。我开始考虑放弃出国，转而在国内攻读博士。</p>
<p>第二件，是硕士毕业论文的盲审。其中一份盲审意见较差，给出的结论是：“该论文创新不足，工作量较低，不足以支撑硕士毕业。”但论文的核心部分，此前已经被国际数据库领域的顶级会议接受；与此同时，另外两位审稿专家的评价却还不错。这让我第一次对国内的科研环境有了更深刻的认知——审稿人的主观意见，却可以决定一位学生的未来。</p>
<p>坦率地说，那时我已经萌生退意，准备放弃读博。但三年过去，就业市场早已不同于当初，科研经历也没有成为我求职时的优势；再去准备考公、考编，对当时的我而言也为时已晚。经历半年多的空档期，面对并不顺利的求职，我最终还是选择了攻读博士。</p>
<h3>博士：科研之外，我想要怎样的生活</h3>
<p>在上海交通大学的日子里，我对科研的兴趣寥寥，对更好生活的向往却与日俱增。</p>
<p>随着 AI 的发展，我也越来越难从自己正在做的研究中找到意义。很多时候，我的科研过程变成了与 AI 对话：由 AI 提出想法，再由 AI 实现想法，而我更像是一个审核者和搬运者。这是我对自身处境的真实感受。</p>
<p>写到这里，我想承认：自己已经失去了对科研的兴趣。科研不该是我生活的全部，也不该成为每一位博士生活的全部。放在人生的尺度上，它只是其中的一小部分。</p>
<p>但我似乎仍然没有找到属于自己的路——一条即使荆棘密布，我也心向往之的路。26 岁的我，似乎一直被推着往前走，却很少认真问过自己：为什么要这样走？这真的是我想要的吗？</p>
<h3>此刻：从记录和实践开始</h3>
<p>现在，我想多记录一些自己，也开始真正动手尝试，在实践中慢慢找到属于自己的方向。</p>
<p>谨以此站，记录我的故事、我的探索，以及生命沿途的点滴。</p>
<p>未完待续……</p>
</article></section>
<section id="about-panel-experience" role="tabpanel" aria-labelledby="about-tab-experience" tabindex="0" hidden>${experienceContent()}</section>
<section id="about-panel-awards" role="tabpanel" aria-labelledby="about-tab-awards" tabindex="0" hidden>${awardsContent()}</section>
</div>`}
function selectAboutTab(id, moveFocus=false) {
  if (!aboutTabItems.some(tab=>tab.id===id)) return;
  document.querySelectorAll('[data-about-tab]').forEach(button=>{
    const selected=button.dataset.aboutTab===id;
    button.setAttribute('aria-selected',String(selected));
    button.tabIndex=selected?0:-1;
    const panel=document.getElementById('about-panel-'+button.dataset.aboutTab);
    if(panel) panel.hidden=!selected;
    if(selected && moveFocus) button.focus();
  });
}
document.addEventListener('keydown',event=>{
  const button=event.target.closest('[data-about-tab]');
  if(!button || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const current=aboutTabItems.findIndex(tab=>tab.id===button.dataset.aboutTab);
  let next=current;
  if(event.key==='ArrowRight') next=(current+1)%aboutTabItems.length;
  if(event.key==='ArrowLeft') next=(current-1+aboutTabItems.length)%aboutTabItems.length;
  if(event.key==='Home') next=0;
  if(event.key==='End') next=aboutTabItems.length-1;
  selectAboutTab(aboutTabItems[next].id,true);
});
function project(p){return intro('EXPLORATION / 示例实践',esc(p.title),esc(p.description))+`<div class="article-layout"><article class="prose"><div class="notice">这是项目展示结构的示例，不是已经完成的真实项目。</div><h2>从一个问题出发</h2><p>在这里介绍你想解决的问题，以及为什么觉得它值得投入时间。相比工具清单，具体的背景更容易让读者理解你的选择。</p><h2>尝试与取舍</h2><p>描述你采取的方法、试过的方向和做出的取舍。可以配上截图、过程记录或链接，让读者看到实践是怎样发生的。</p><h2>结果与新的问题</h2><p>写下实际观察到的结果，以及还有哪些地方值得继续改进。不必为了展示而夸大成果。</p><div class="article-end"><a href="#/projects">← 返回实践</a><span>示例项目</span></div></article></div>`}
function route(){let path=location.hash.replace(/^#\/?/,'').split('/');const page=path[0]||'home';let output,title; if(page==='home'){output=home();title='思考与日常'}else if(page==='writing'&&path[1]){let a=articles.find(a=>a.id===path[1]);if(a){output=article(a);title=a.title}}else if(page==='writing'){output=writing();title='文章'}else if(page==='notes'&&path[1]!==undefined){const n=/^\d+$/.test(path[1])?notes[Number(path[1])]:null;if(n){output=intro('FIELD NOTE / 示例随想',esc(n.tag),'2026.'+n.date)+`<article class="prose"><blockquote>${esc(n.text)}</blockquote><div class="notice">示例内容，仅用于展示。</div><div class="article-end"><a href="#/notes">← 全部随想</a></div></article>`;title=n.tag}}else if(page==='notes'){output=intro('FIELD NOTES / 随想','留住，还没变成文章的想法。','几句话，一个观察，或一个暂时没有答案的问题。这里允许思考保持未完成的样子。')+`<div class="full-notes">${notes.map(noteCard).join('')}</div>`;title='随想'}else if(page==='projects'&&path[1]){const p=projects.find(p=>p.id===path[1]);if(p){output=project(p);title=p.title}}else if(page==='projects'){output=intro('EXPLORATIONS / 实践','想过以后，也动手试试。','一些小规模的探索。比起列出做过什么，更希望记下为什么开始，以及从中学到了什么。')+`<div class="project-grid listing">${projects.map(projectCard).join('')}</div>`;title='实践'}else if(page==='about'){output=about();title='关于'}if(!output){output=intro('404','这一页还没有写下。','链接可能不完整，你可以回到首页继续阅读。')+'<p><a class="button" href="#/">返回首页 ↗</a></p>';title='页面未找到'}main.innerHTML=output;document.title=title+' · Qi';document.querySelectorAll('[data-nav]').forEach(a=>{const active=a.dataset.nav===page;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});window.scrollTo(0,0);main.focus({preventScroll:true})}
document.addEventListener('click',e=>{const aboutTab=e.target.closest('[data-about-tab]');if(aboutTab){selectAboutTab(aboutTab.dataset.aboutTab);return}if(e.target.closest('.skip')){e.preventDefault();main.focus();main.scrollIntoView();return}const filter=e.target.closest('[data-filter]');if(filter){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===filter);b.setAttribute('aria-pressed',String(b===filter))});document.getElementById('article-list').innerHTML=articles.filter(a=>filter.dataset.filter==='全部'||a.category===filter.dataset.filter).map(articleRow).join('')}const section=e.target.closest('[data-section]');if(section){e.preventDefault();document.getElementById(section.dataset.section)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}});
function setTheme(dark){document.body.classList.toggle('dark',dark);document.getElementById('theme').setAttribute('aria-label',dark?'切换到浅色模式':'切换到深色模式');document.getElementById('theme').title=dark?'切换到浅色模式':'切换到深色模式'}
try{setTheme(localStorage.getItem('journal-theme')==='dark')}catch{setTheme(false)}
document.getElementById('theme').addEventListener('click',()=>{const dark=!document.body.classList.contains('dark');setTheme(dark);try{localStorage.setItem('journal-theme',dark?'dark':'light')}catch{}});window.addEventListener('hashchange',route);route();
