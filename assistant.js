/* ===== مساعد نبراس (زر عائم) =====
   ضعي رابط المساعد في url بين علامتي التنصيص.
   mode: "link"  = يفتح المساعد في تبويب جديد (الأضمن، يناسب أغلب المنصات)
         "embed" = يعرضه داخل نافذة في الموقع (يعمل فقط إن كانت منصة المساعد تسمح بالتضمين)
*/
const NIBRAS_ASSISTANT = { url: "https://gemini.google.com/gem/1Fbq95XY2FA5H3JdDsnmWqwN279ZZmVLr?usp=sharing", mode: "link" };

(function () {
  const css = `
  .nb-fab{position:fixed;left:14px;right:auto;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:9999;display:flex;align-items:center;gap:10px;padding:6px 16px 6px 8px;border-radius:20px;border:2px solid #ffd43a;border-bottom-width:5px;background:linear-gradient(180deg,#05325b,#043158);color:#fff;cursor:pointer;box-shadow:0 8px 22px #142d7366;font-family:Cairo,Tahoma,sans-serif;direction:rtl;text-align:right;transition:transform .15s}
  .nb-fab:hover{transform:translateY(-2px)}
  .nb-fab img{width:58px;height:58px;object-fit:contain;flex-shrink:0;filter:drop-shadow(0 2px 4px #0000004d)}
  .nb-fab .nb-txt{display:flex;flex-direction:column;line-height:1.25}
  .nb-fab .nb-txt b{font-size:1.05rem}.nb-fab .nb-txt small{font-size:.75rem;opacity:.95;color:#ffd43a}
  .nb-panel{position:fixed;left:16px;right:auto;bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:9999;width:min(380px,calc(100vw - 32px));height:min(540px,calc(100vh - 130px));background:#fff;border-radius:18px;border:2px solid #09a5ae;box-shadow:0 18px 50px #142d7355;display:none;flex-direction:column;overflow:hidden;font-family:Cairo,Tahoma,sans-serif;direction:rtl}
  .nb-panel.open{display:flex}
  .nb-head{background:linear-gradient(180deg,#05325b,#043158);color:#fff;padding:10px 14px;display:flex;align-items:center;gap:10px;border-bottom:4px solid #ffd43a}
  .nb-head img{width:38px;height:38px}.nb-head b{flex:1;font-size:1rem}
  .nb-x{background:#ffffff26;border:0;color:#fff;width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer}
  .nb-body{flex:1;overflow:auto;display:flex;flex-direction:column}
  .nb-body iframe{flex:1;width:100%;border:0}
  .nb-msg{padding:22px 18px;text-align:center;color:#1c2f5e;line-height:1.9}
  .nb-msg .big{font-size:2.6rem;display:block}
  .nb-go{display:inline-block;margin-top:10px;background:#0788c6;color:#fff;text-decoration:none;font-weight:700;padding:11px 20px;border-radius:12px;border-bottom:4px solid #ffd43a}
  .nb-go:hover{background:#14b8b0}
  @media print{.nb-fab,.nb-panel{display:none!important}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  let name = ''; try { name = localStorage.getItem('nb_name') || ''; } catch (e) {}
  const A = NIBRAS_ASSISTANT, has = !!(A.url && A.url.trim());

  const fab = document.createElement('button');
  fab.className = 'nb-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'افتح المساعد نبراس');
  fab.innerHTML = '<img src="logo.png" alt=""><span class="nb-txt"><b>اسألني</b><small>مساعدك نبراس</small></span>';

  const panel = document.createElement('div');
  panel.className = 'nb-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'المساعد نبراس');
  panel.innerHTML = '<div class="nb-head"><img src="favicon.png" alt=""><b>نبراس — مساعدك العلمي</b><button class="nb-x" type="button" aria-label="إغلاق">×</button></div><div class="nb-body"></div>';
  const body = panel.querySelector('.nb-body');

  function build() {
    if (body.dataset.ready) return; body.dataset.ready = 1;
    const hi = name ? `أهلًا ${name}! ` : 'أهلًا بك! ';
    if (has && A.mode === 'embed') {
      const f = document.createElement('iframe');
      f.src = A.url; f.title = 'المساعد نبراس'; f.allow = 'clipboard-write; microphone'; body.appendChild(f);
    } else if (has) {
      body.innerHTML = `<div class="nb-msg"><span class="big">💡</span><b>${hi}أنا نبراس 👋</b><br>اسألني عن أي شيء في درس العلوم وسأساعدك خطوة بخطوة.<br><a class="nb-go" href="${A.url}" target="_blank" rel="noopener">ابدأ المحادثة مع نبراس ←</a></div>`;
    } else {
      body.innerHTML = `<div class="nb-msg"><span class="big">💡</span><b>${hi}أنا نبراس 👋</b><br>مساعدك العلمي قيد التجهيز، وسيكون جاهزًا للإجابة عن أسئلتك قريبًا.</div>`;
    }
  }
  const toggle = () => { build(); panel.classList.toggle('open'); };
  fab.onclick = toggle; panel.querySelector('.nb-x').onclick = () => panel.classList.remove('open');
  document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.classList.remove('open'); });
  const mount = () => { document.body.appendChild(panel); document.body.appendChild(fab); };
  document.body ? mount() : document.addEventListener('DOMContentLoaded', mount);
})();
