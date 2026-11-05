function nbName(){try{return localStorage.getItem('nb_name')||''}catch(e){return ''}}
function nbSave(n){try{localStorage.setItem('nb_name',n)}catch(e){}}
function nbHi(t){const n=nbName();return n?`${n}، ${t}`:t}
const loginPanel = document.getElementById('loginPanel');
const dashboard = document.getElementById('dashboard');
const studentForm = document.getElementById('studentForm');
const curriculumEl = document.getElementById('curriculum');
const gradePicker = document.getElementById('gradePicker');
const unitsGrid = document.getElementById('unitsGrid');
const lessonPanel = document.getElementById('lessonPanel');
let currentGrade = 6, currentTerm = 1, openedUnit = -1;
studentForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('studentName').value.trim();
  if (!name) return;
  nbSave(name);
  document.getElementById('welcomeTitle').textContent = `أهلًا ${name}، رحلتك العلمية تبدأ هنا`;
  document.getElementById('studentMeta').textContent = `${document.getElementById('studentGrade').selectedOptions[0].text} • ${document.getElementById('studentSection').selectedOptions[0].text}`;
  loginPanel.classList.add('hidden');
  dashboard.classList.remove('hidden');
});
(()=>{const i=document.getElementById('studentName');if(i&&nbName())i.value=nbName()})();
document.getElementById('changeStudent').addEventListener('click', () => {
  dashboard.classList.add('hidden'); loginPanel.classList.remove('hidden');
});
document.querySelectorAll('[data-grade]').forEach(btn => btn.addEventListener('click', () => openGrade(Number(btn.dataset.grade))));
function openGrade(grade) {
  currentGrade = grade; currentTerm = 1; openedUnit = 0;
  gradePicker.classList.add('hidden'); curriculumEl.classList.remove('hidden');
  document.getElementById('curriculumTitle').textContent = `الصف ${grade===6?'السادس':'السابع'} الأساسي • الفصل الأول`;
  document.querySelectorAll('.term-tab').forEach(b=>b.classList.toggle('active', Number(b.dataset.term)===1));
  lessonPanel.classList.add('hidden'); renderUnits();
}
document.getElementById('backGrades').addEventListener('click', () => {
  curriculumEl.classList.add('hidden'); gradePicker.classList.remove('hidden');
});
document.querySelectorAll('.term-tab').forEach(btn => btn.addEventListener('click', () => {
  currentTerm = Number(btn.dataset.term); openedUnit = -1;
  document.querySelectorAll('.term-tab').forEach(b=>b.classList.toggle('active', b===btn));
  lessonPanel.classList.add('hidden'); renderUnits();
}));
function renderUnits() {
  unitsGrid.innerHTML = '';
  const units = curriculum[currentGrade][currentTerm].filter(u => u.lessons.some(l => l.ready));
  units.forEach((unit, i) => {
    const ls = unit.lessons.filter(l => l.ready);
    const card = document.createElement('article'); card.className = 'unit-card';
    const toggle = document.createElement('button'); toggle.className = 'unit-toggle'; toggle.type='button';
    toggle.innerHTML = `<span class="unit-icon">${unit.icon}</span><span><span class="unit-name">${unit.name}</span><span class="unit-meta">${ls.length===1?'درس واحد':ls.length+' دروس'}</span></span><span class="caret">${openedUnit===i?'⌃':'⌄'}</span>`;
    toggle.addEventListener('click', () => { openedUnit = openedUnit===i ? -1 : i; renderUnits(); });
    card.appendChild(toggle);
    if (openedUnit===i) {
      const list = document.createElement('div'); list.className='lesson-list';
      ls.forEach((lesson,j) => {
        const b = document.createElement('button'); b.className='lesson-button'; b.type='button';
        b.innerHTML = `<span class="lesson-number">${j+1}</span><span>${lesson.t}</span>`;
        b.addEventListener('click', () => showLesson(unit.name, lesson.t, currentTerm));
        list.appendChild(b);
      });
      card.appendChild(list);
    }
    unitsGrid.appendChild(card);
  });
}
function showLesson(unit, lesson, term) {
  document.getElementById('lessonTitle').textContent = lesson;
  document.getElementById('lessonPath').textContent = `الصف ${currentGrade===6?'السادس':'السابع'} الأساسي • الفصل ${term===1?'الأول':'الثاني'} • ${unit}`;
  lessonPanel.classList.remove('hidden');
  let hello=document.getElementById('lessonHello');
  if(!hello){hello=document.createElement('p');hello.id='lessonHello';hello.className='lesson-hello';document.getElementById('lessonTitle').before(hello)}
  hello.textContent=nbName()?`مرحبًا ${nbName()} 👋 هيا نتعلّم معًا:`:'';
  const rich = typeof lessonContent!=='undefined' && lessonContent[`${currentGrade}|${term}|${lesson}`];
  document.getElementById('lessonDefault').classList.toggle('hidden', !!rich);
  const body = document.getElementById('lessonBody'); body.classList.toggle('hidden', !rich);
  if (rich) renderLesson(rich, body);
  document.getElementById('quizFeedback').textContent='';
  document.querySelectorAll('input[name="quiz"]').forEach(r=>r.checked=false);
  lessonPanel.scrollIntoView({behavior:'smooth',block:'start'});
}
document.getElementById('closeLesson').addEventListener('click',()=>lessonPanel.classList.add('hidden'));
document.getElementById('checkQuiz').addEventListener('click',()=>{
  const answer = document.querySelector('input[name="quiz"]:checked');
  const feedback = document.getElementById('quizFeedback');
  if (!answer) { feedback.textContent=nbHi('اختر إجابة أولًا.'); feedback.style.color='#98651c'; return; }
  if (answer.value==='correct') {feedback.textContent=nbHi('أحسنت! إجابة صحيحة 🌟'); feedback.style.color='#18744b';}
  else {feedback.textContent=nbHi('حاول مرة أخرى؛ الفهم والتطبيق أفضل من حفظ العنوان فقط.'); feedback.style.color='#a44d32';}
});
