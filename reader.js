/* Progressive enhancement: articles and notes remain in the DOM.
   No pagination state is encoded in public content URLs. */
(()=>{
  let cleanup=()=>{}, currentJump=()=>false;
  window.QiReader={mount,jump:id=>currentJump(id)};
  function mount(){
    cleanup();currentJump=()=>false;
    const main=document.getElementById('content');
    main.classList.remove('notes-reading-page');
    const notesList=main.querySelector('.full-notes');
    const isNotes=Boolean(notesList);
    const header=main.querySelector('.article-header');
    const layout=main.querySelector('.article-layout');
    if(!isNotes&&(!header||!layout))return;
    const prose=layout?.querySelector('article.prose');
    if(!isNotes&&!prose)return;
    if(isNotes)main.classList.add('notes-reading-page');
    const contentLabel=isNotes?'随想列表':'文章正文';
    const preferenceKey=isNotes?'qi-notes-reading-mode':'qi-reading-mode';
    const reader=document.createElement('section');
    reader.className='reader reader-scroll'+(isNotes?' notes-reader full-notes':'');reader.setAttribute('aria-label',isNotes?'随想阅读区':'文章阅读区');
    reader.innerHTML=`<div class="reader-toolbar">${isNotes?'<span class="notes-reader-label">NOTES / 随想</span>':'<a href="#/writing" class="back">← 返回文章</a>'}<span class="reader-label">认真生活 · 慢慢思考</span><button type="button" class="reader-directory-toggle" aria-expanded="false" aria-controls="reader-directory">目录</button><button type="button" class="reader-mode" aria-pressed="false">切换为翻页</button></div><div id="reader-directory" class="reader-directory" hidden></div><div class="reader-flow" tabindex="0" aria-label="文章正文；翻页模式可用左右方向键"></div><div class="reader-controls"><button type="button" class="reader-prev" aria-label="上一页">← 上一页</button><span class="reader-pages-status" role="status" aria-live="polite"></span><button type="button" class="reader-next" aria-label="下一页">下一页 →</button></div>`;
    main.insertBefore(reader,isNotes?notesList:header);
    const flow=reader.querySelector('.reader-flow');
    if(isNotes){
      flow.append(...notesList.childNodes);
      flow.querySelectorAll('.note').forEach(note=>{
        const parts=[...note.querySelectorAll('.reading-kind,.note-book')];
        if(parts.length){const meta=document.createElement('div');meta.className='notes-reader-meta';parts[0].before(meta);meta.append(...parts)}
      });
    }else flow.append(header,prose);
    const toc=layout?.querySelector('.toc');
    const directory=reader.querySelector('.reader-directory');
    const directoryButton=reader.querySelector('.reader-directory-toggle');
    if(isNotes){
      directoryButton.hidden=true;notesList.remove();
    }else{
      if(toc)toc.querySelectorAll('a').forEach(a=>directory.append(a.cloneNode(true)));
      else directoryButton.hidden=true;
      layout.remove();
    }
    const modeButton=reader.querySelector('.reader-mode');
    const prev=reader.querySelector('.reader-prev');const next=reader.querySelector('.reader-next');
    const status=reader.querySelector('.reader-pages-status');
    const media=window.matchMedia('(min-width: 761px)');
    let preference='book';try{preference=localStorage.getItem(preferenceKey)||'book'}catch{}
    let page=0,count=1,stride=0,book=false,disposed=false,frame=0;
    function update(){
      page=Math.max(0,Math.min(page,count-1));
      flow.scrollLeft=book?page*stride:0;
      prev.disabled=page===0;next.disabled=page===count-1;
      status.textContent=`${page+1} / ${count}`;
    }
    function measure(){
      if(disposed)return;
      flow.querySelector('.reader-blank')?.remove();
      if(!book){flow.scrollLeft=0;return}
      const gap=parseFloat(getComputedStyle(flow).columnGap)||0;
      const width=flow.clientWidth;stride=width+gap;
      const column=(width-gap)/2;
      let columns=Math.max(2,Math.round((flow.scrollWidth+gap)/(column+gap)));
      if(columns%2){const blank=document.createElement('div');blank.className='reader-blank';blank.setAttribute('aria-hidden','true');flow.append(blank);columns++}
      count=Math.max(1,columns/2);update();
    }
    function applyMode(){
      book=media.matches&&preference==='book';
      reader.classList.toggle('reader-book',book);reader.classList.toggle('reader-scroll',!book);
      modeButton.textContent=book?'切换为滚动':'切换为翻页';
      modeButton.setAttribute('aria-pressed',String(book));
      flow.setAttribute('aria-label',contentLabel+(book?'；可用左右方向键翻页':''));
      measure();
    }
    function move(delta){page+=delta;update()}
    prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
    flow.addEventListener('keydown',e=>{
      if(!book||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.closest('a,button,input,textarea'))return;
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}
      if(e.key==='Home'||e.key==='End'){e.preventDefault();page=e.key==='Home'?0:count-1;update()}
    });
    flow.addEventListener('scroll',()=>{
      if(book&&stride){const visible=Math.round(flow.scrollLeft/stride);if(visible!==page){page=visible;status.textContent=`${page+1} / ${count}`;prev.disabled=page===0;next.disabled=page===count-1}}
    });
    modeButton.addEventListener('click',()=>{
      preference=book?'scroll':'book';page=0;applyMode();
      try{localStorage.setItem(preferenceKey,preference)}catch{}
    });
    directoryButton.addEventListener('click',()=>{
      directory.hidden=!directory.hidden;directoryButton.setAttribute('aria-expanded',String(!directory.hidden));
    });
    currentJump=id=>{
      const target=document.getElementById(id);if(!target||!flow.contains(target))return false;
      directory.hidden=true;directoryButton.setAttribute('aria-expanded','false');
      // Sections use display:contents so their first heading supplies the fragment geometry.
      const heading=target.querySelector('h2')||target;
      if(!book){heading.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return true}
      const x=heading.getBoundingClientRect().left-flow.getBoundingClientRect().left+flow.scrollLeft;
      page=Math.floor((x+1)/stride);update();flow.focus({preventScroll:true});return true;
    };
    const observer=new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure)});
    observer.observe(flow);
    media.addEventListener('change',applyMode);
    applyMode();
    document.fonts?.ready.then(()=>{if(!disposed)measure()});
    cleanup=()=>{disposed=true;observer.disconnect();cancelAnimationFrame(frame);media.removeEventListener('change',applyMode)};
  }
})();
