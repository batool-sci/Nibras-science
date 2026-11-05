/* ===== نبراس العلوم: التنقل بين الصفوف والوحدات والدروس =====
   - كل خطوة تنقّل تُسجَّل في سجل المتصفح، فزر «رجوع» (في الصفحة أو في المتصفح)
     يعيد خطوة واحدة إلى الوراء وليس إلى صفحة الدخول.
   - الحالة تُحفظ في عنوان الصفحة (#/الصف/الفصل/الوحدة/الدرس) فتعود للمكان نفسه بعد المختبرات. */
'use strict';

(() => {
  const $ = id => document.getElementById(id);
  const GRADE_NAME = { 6: 'السادس', 7: 'السابع' };
  const TERM_NAME = { 1: 'الأول', 2: 'الثاني' };
  const NO_VIEW = { g: 0, t: 1, u: -1, l: -1 };

  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* تجاهل */ }
    },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) { /* تجاهل */ } }
  };

  const el = {
    login: $('loginPanel'), dash: $('dashboard'), form: $('studentForm'),
    grades: $('gradePicker'), curriculum: $('curriculum'), units: $('unitsGrid'),
    lesson: $('lessonPanel'), tabs: $('termTabs')
  };

  let student = null;
  let view = { ...NO_VIEW };

  /* ---------- أدوات المنهاج ---------- */
  const unitsOf = (g, t) => (NB_CURRICULUM[g] && NB_CURRICULUM[g][t]) || [];
  const lessonKey = (g, t, name) => `${g}|${t}|${name}`;
  const hasContent = (g, t, name) => typeof lessonContent !== 'undefined' && !!lessonContent[lessonKey(g, t, name)];

  /* ---------- الحالة والعنوان (hash) ---------- */
  function hashOf(v) {
    if (!v.g) return location.pathname + location.search;
    let h = `#/${v.g}/${v.t}`;
    if (v.u >= 0) { h += `/${v.u}`; if (v.l >= 0) h += `/${v.l}`; }
    return h;
  }

  function parseHash() {
    const m = location.hash.match(/^#\/([67])(?:\/([12])(?:\/(\d+)(?:\/(\d+))?)?)?$/);
    if (!m) return { ...NO_VIEW };
    return sanitize({ g: +m[1], t: m[2] ? +m[2] : 1, u: m[3] !== undefined ? +m[3] : -1, l: m[4] !== undefined ? +m[4] : -1 });
  }

  function sanitize(v) {
    const out = { ...NO_VIEW, ...v };
    if (!NB_CURRICULUM[out.g]) return { ...NO_VIEW };
    const units = unitsOf(out.g, out.t);
    if (out.u < 0 || out.u >= units.length) return { ...out, u: -1, l: -1 };
    if (out.l < 0 || out.l >= units[out.u].lessons.length) out.l = -1;
    return out;
  }

  function commit(mode) {
    const d = (history.state && history.state.d) || 0;
    const state = { nb: 1, d: mode === 'push' ? d + 1 : d, v: { ...view } };
    history[mode === 'push' ? 'pushState' : 'replaceState'](state, '', hashOf(view));
    store.set('nb_hash', location.hash);
  }

  function go(next, mode = 'push') {
    view = sanitize(next);
    commit(mode);
    render();
  }

  function parentOf(v) {
    if (v.l >= 0) return { ...v, l: -1 };
    return { ...NO_VIEW };
  }

  /* رجوع خطوة واحدة */
  function back() {
    if (history.state && history.state.nb && history.state.d > 0) history.back();
    else go(parentOf(view), 'replace');
  }

  window.addEventListener('popstate', e => {
    view = e.state && e.state.v ? sanitize(e.state.v) : parseHash();
    render();
    if (view.l >= 0) el.lesson.scrollIntoView({ block: 'start' });
  });

  /* ---------- الدخول ---------- */
  function saveStudent(s) { student = s; store.set('nb_student', JSON.stringify(s)); }
  function loadStudent() { try { return JSON.parse(store.get('nb_student')); } catch (e) { return null; } }

  el.form.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('studentName').value.trim();
    if (!name) return;
    nbSave(name);
    saveStudent({
      name,
      grade: $('studentGrade').selectedOptions[0].text,
      section: $('studentSection').selectedOptions[0].text
    });
    view = { ...NO_VIEW };
    commit('replace');
    render();
  });

  $('changeStudent').addEventListener('click', () => {
    student = null; store.del('nb_student');
    view = { ...NO_VIEW }; commit('replace'); render();
  });

  /* ---------- العرض ---------- */
  function render() {
    const loggedIn = !!student;
    el.login.classList.toggle('hidden', loggedIn);
    el.dash.classList.toggle('hidden', !loggedIn);
    if (!loggedIn) return;

    $('welcomeTitle').textContent = `أهلًا ${student.name}، رحلتك العلمية تبدأ هنا`;
    $('studentMeta').textContent = `${student.grade} • ${student.section}`;

    const inGrade = view.g > 0;
    el.grades.classList.toggle('hidden', inGrade);
    el.curriculum.classList.toggle('hidden', !inGrade);
    if (!inGrade) return;

    $('curriculumTitle').textContent = `الصف ${GRADE_NAME[view.g]} الأساسي`;
    el.tabs.classList.remove('hidden');
    el.tabs.querySelectorAll('.term-tab').forEach(b => {
      const on = Number(b.dataset.term) === view.t;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
    });
    renderUnits();
    renderLessonPanel();
  }

  function renderUnits() {
    el.units.innerHTML = '';
    unitsOf(view.g, view.t).forEach((unit, i) => {
      const card = document.createElement('article');
      card.className = 'unit-card';

      const ready = unit.lessons.filter(n => hasContent(view.g, view.t, n)).length;
      const toggle = document.createElement('button');
      toggle.className = 'unit-toggle'; toggle.type = 'button';
      toggle.setAttribute('aria-expanded', view.u === i);
      toggle.innerHTML =
        `<span class="unit-icon">${unit.icon}</span>` +
        `<span><span class="unit-name">الوحدة ${i + 1}: ${unit.name}</span>` +
        `<span class="unit-meta">${unit.lessons.length === 1 ? 'درس واحد' : unit.lessons.length + ' دروس'}` +
        `${ready ? ` • ${ready} جاهز` : ''}</span></span>` +
        `<span class="caret">${view.u === i ? '⌃' : '⌄'}</span>`;
      toggle.addEventListener('click', () => {
        view = { ...view, u: view.u === i ? -1 : i, l: -1 };
        commit('replace'); render();
      });
      card.appendChild(toggle);

      if (view.u === i) {
        const list = document.createElement('div');
        list.className = 'lesson-list';
        unit.lessons.forEach((lesson, j) => {
          const isReady = hasContent(view.g, view.t, lesson);
          const b = document.createElement('button');
          b.className = 'lesson-button' + (view.l === j ? ' current' : '');
          b.type = 'button';
          b.innerHTML =
            `<span class="lesson-number">${j + 1}</span><span class="lesson-name">${lesson}</span>` +
            `<span class="lesson-status ${isReady ? 'ready' : 'soon'}">${isReady ? 'جاهز ✓' : 'قريبًا'}</span>`;
          b.addEventListener('click', () => go({ ...view, u: i, l: j }, 'push'));
          list.appendChild(b);
        });
        card.appendChild(list);
      }
      el.units.appendChild(card);
    });
  }

  function renderLessonPanel() {
    const open = view.l >= 0;
    el.lesson.classList.toggle('hidden', !open);
    if (!open) return;

    const unit = unitsOf(view.g, view.t)[view.u];
    const name = unit.lessons[view.l];
    $('lessonTitle').textContent = name;
    $('lessonPath').textContent = `الصف ${GRADE_NAME[view.g]} الأساسي • الفصل ${TERM_NAME[view.t]} • ${unit.name}`;

    let hello = $('lessonHello');
    if (!hello) {
      hello = document.createElement('p');
      hello.id = 'lessonHello'; hello.className = 'lesson-hello';
      $('lessonTitle').before(hello);
    }
    hello.textContent = nbName() ? `مرحبًا ${nbName()} 👋 هيا نتعلّم معًا:` : '';

    renderLesson(getLesson(view.g, view.t, name), $('lessonBody'));
    el.lesson.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- الأزرار ---------- */
  document.querySelectorAll('[data-grade]').forEach(btn =>
    btn.addEventListener('click', () => go({ g: Number(btn.dataset.grade), t: 1, u: 0, l: -1 }, 'push')));
  $('backGrades').addEventListener('click', back);
  $('closeLesson').addEventListener('click', back);
  el.tabs.querySelectorAll('.term-tab').forEach(btn =>
    btn.addEventListener('click', () => {
      view = { g: view.g, t: Number(btn.dataset.term), u: 0, l: -1 };
      commit('replace'); render();
    }));

  /* ---------- الإقلاع ---------- */
  (() => {
    const i = $('studentName');
    if (i && nbName()) i.value = nbName();
  })();
  student = loadStudent();
  view = student ? parseHash() : { ...NO_VIEW };
  commit('replace');
  render();
})();
