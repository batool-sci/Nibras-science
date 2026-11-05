/* ===== أدوات مشتركة بين الصفحة الرئيسية والمختبرات ===== */
'use strict';

const NB_CREDIT = 'إعداد المعلمة بتول عصام';

/* اسم الطالب (يُحفظ في المتصفح فقط) */
function nbName() { try { return localStorage.getItem('nb_name') || ''; } catch (e) { return ''; } }
function nbSave(n) { try { localStorage.setItem('nb_name', n); } catch (e) { /* التخزين غير متاح */ } }
function nbHi(t) { const n = nbName(); return n ? `${n}، ${t}` : t; }

/* زر «رجوع» في المختبرات: يعود إلى الصفحة السابقة (الدرس) وليس إلى صفحة الدخول */
function nbBack() {
  let sameSite = false;
  try { sameSite = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) { /* تجاهل */ }
  if (sameSite && history.length > 1) { history.back(); return; }
  let h = '';
  try { h = sessionStorage.getItem('nb_hash') || ''; } catch (e) { /* تجاهل */ }
  location.href = 'index.html' + h;
}

/* تدوين «إعداد المعلمة» أسفل كل محاكاة */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.hasAttribute('data-nb-lab')) return;
  const st = document.createElement('style');
  st.textContent = '.nb-credit{max-width:860px;margin:6px auto 90px;padding:12px 16px;text-align:center;font-weight:700;color:#05325b;border-top:2px dashed #ffd43a}.nb-credit small{display:block;font-weight:500;color:#52708f}@media print{.nb-credit{margin-bottom:0}}';
  document.head.appendChild(st);
  const f = document.createElement('footer');
  f.className = 'nb-credit';
  f.innerHTML = `✍️ ${NB_CREDIT}<small>نبراس العلوم</small>`;
  document.body.appendChild(f);
});
