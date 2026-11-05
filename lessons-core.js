/* ==========================================================
   lessons-core.js — محرّك الدروس (الألعاب وعرض البطاقات)
   لا حاجة لتعديله عند إضافة درس جديد.
   كل درس له ملف خاص به اسمه يبدأ بـ lesson-
   ========================================================== */
const lessonContent = {};   // تُسجَّل فيه الدروس من الملفات lesson-*.js
const WIDGETS = {};         // الألعاب والاختبارات المرتبطة بالدروس
const M=(q,o,a,w)=>({q,o,a,w});
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
function mcq(box,qs){let i=0,s=0;const R=()=>{box.innerHTML='';if(i>=qs.length){box.innerHTML=`<p class="mq-q">نتيجتك${nbName()?' يا '+nbName():''}: ${s.toLocaleString('ar')} من ${qs.length.toLocaleString('ar')} ${s===qs.length?'🌟':'👏'}</p><button class="primary" type="button">أعد المحاولة</button>`;box.querySelector('button').onclick=()=>{i=0;s=0;R()};return}
  const q=qs[i];box.innerHTML=`<p class="mq-prog">السؤال ${(i+1).toLocaleString('ar')} من ${qs.length.toLocaleString('ar')}</p><p class="mq-q">${q.q}</p><div class="mq-opts"></div><p class="mq-why" aria-live="polite"></p>`;
  const bs=q.o.map((t,j)=>{const x=document.createElement('button');x.type='button';x.className='mq-opt';x.textContent=t;x.onclick=()=>{bs.forEach((y,k)=>{y.disabled=true;if(k===q.a)y.classList.add('ok')});if(j===q.a)s++;else x.classList.add('no');box.querySelector('.mq-why').textContent=nbHi((j===q.a?'أحسنت! ':'ليست الإجابة الصحيحة. ')+q.w);const nx=document.createElement('button');nx.type='button';nx.className='primary';nx.textContent=i+1<qs.length?'التالي':'النتيجة';nx.onclick=()=>{i++;R()};box.appendChild(nx)};box.querySelector('.mq-opts').appendChild(x);return x})};R()}
const TABS=[['learn','📘','شرح الدرس وتلخيصه','أفكار الدرس بأسلوب مبسّط'],['video','🎬','فيديو الدرس','شاهد شرح الدرس'],['ws','📄','ورقة عمل','أسئلة للحل والطباعة'],['games','🎮','ألعاب تفاعلية','تدرّب والعب وتحدَّ نفسك']];
function videoHTML(u){u=(u||'').trim();if(!u)return '<p class="muted">🎬 سيُضاف فيديو هذا الدرس قريبًا.</p>';
 const m=u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
 if(/\.(mp4|webm)(\?.*)?$/i.test(u))return `<video controls playsinline preload="metadata" style="width:100%;border-radius:12px;background:#000"><source src="${u}"></video>`;
 const src=m?`https://www.youtube.com/embed/${m[1]}`:u;
 const v=/shorts\//.test(u);return `<div style="position:relative;${v?'max-width:340px;margin:0 auto;padding-top:min(604px,177.78%)':'padding-top:56.25%'};border-radius:12px;overflow:hidden;background:#000"><iframe src="${src}" title="فيديو الدرس" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="accelerometer;encrypted-media;picture-in-picture;fullscreen" allowfullscreen loading="lazy"></iframe></div>`}
function renderLesson(c,root){
 root.innerHTML=`<div class="lcards">${(L=>`<a class="lcard" href="${L.href}"><span>${L.icon}</span><b>${L.title}</b><small>${L.sub}</small></a>`)(c.lab||{href:'lab.html',icon:'🔬',title:'مختبر نبراس التفاعلي',sub:'ابنِ الجزيئات بنفسك'})}${TABS.map(t=>`<button class="lcard" type="button" data-t="${t[0]}"><span>${t[1]}</span><b>${t[2]}</b><small>${t[3]}</small></button>`).join('')}</div><div class="lpane"></div>`;
 const pane=root.querySelector('.lpane'),bs=root.querySelectorAll('button.lcard');
 const open=k=>{bs.forEach(b=>b.classList.toggle('on',b.dataset.t===k));pane.innerHTML='';c.sections.filter(x=>x.tab===k).forEach(x=>{const s=document.createElement('section');s.className='lc'+(x.print?' printable':'');s.innerHTML=`<h3>${x.icon} ${x.t}</h3>`;const d=document.createElement('div');if(x.html)d.innerHTML=x.html;if(x.video!==undefined)d.innerHTML=videoHTML(x.video);if(x.img)d.innerHTML=`<a href="${x.img}" target="_blank" rel="noopener"><img src="${x.img}" alt="${x.alt}" loading="lazy" style="width:100%;border-radius:12px;border:1px solid #dce7ef"></a><p class="muted">اضغط على الصورة لفتحها وتكبيرها.</p><a class="secondary small" href="${x.img}" download style="display:inline-block;text-decoration:none">⬇️ تحميل الصورة</a>`;s.appendChild(d);if(x.print){const p=document.createElement('button');p.className='primary noprint';p.type='button';p.textContent='🖨️ طباعة ورقة العمل';p.onclick=()=>window.print();s.appendChild(p)}pane.appendChild(s);if(x.widget)WIDGETS[x.widget](d)})};
 pane.innerHTML='<p class="muted" style="text-align:center">👆 اضغط على إحدى البطاقات لعرض محتواها.</p>';
 bs.forEach(b=>b.onclick=()=>{if(b.classList.contains('on')){b.classList.remove('on');pane.innerHTML='<p class="muted" style="text-align:center">👆 اضغط على إحدى البطاقات لعرض محتواها.</p>';return}open(b.dataset.t);pane.scrollIntoView({behavior:'smooth',block:'start'})})}

/* لعبة مشتركة بين درسين (تركيب الذرة + مركّبات مهمة في حياتنا) */
Object.assign(WIDGETS,{
 atomclassify:b=>mcq(b,[['Al',0,'ألمنيوم: عنصر يتكوّن من نوع واحد من الذرّات.'],['CO₂',1,'يتكوّن من اتحاد الكربون والأكسجين.'],['S',0,'كبريت: عنصر.'],['NaCl',1,'يتكوّن من اتحاد الصوديوم والكلور.'],['H₂O',1,'يتكوّن من اتحاد الهيدروجين والأكسجين.'],['Fe',0,'حديد: عنصر.']].map(x=>M(`ما تصنيف: ${x[0]}؟`,['عنصر','مركّب'],x[1],x[2]))),
});
