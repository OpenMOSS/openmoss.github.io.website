(function () {
  const routes = {
    home: renderHome,
    research: renderResearch,
    people: renderPeople,
    alumni: renderAlumni,
    resources: renderResources,
    positions: renderPositions,
    webmaster: renderWebmaster
  };

  let currentLang = 'zh';

  // 翻译辅助函数
  function t(key) {
    return window.t ? window.t(key, currentLang) : key;
  }

  function init() {
    if (!window.SPA_DATA) {
      console.error('SPA_DATA 未加载');
      return;
    }
    // 从 localStorage 读取语言设置
    currentLang = localStorage.getItem('language') || 'zh';
    window.currentLang = currentLang;
    renderShell();
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  function renderShell() {
    const root = document.getElementById('app');

    const navItems = [
      { id: 'home', key: 'nav.home' },
      { id: 'research', key: 'nav.research' },
      { id: 'people', key: 'nav.people' },
      { id: 'alumni', key: 'nav.alumni' },
      { id: 'resources', key: 'nav.resources' },
      { id: 'positions', key: 'nav.positions' }
    ];

    root.innerHTML = `
      <nav class="navbar">
        <div class="container nav-container">
          <a class="brand" href="#home">
            <img class="brand-logo" src="assets/img/openmoss-logo.png" alt="OpenMOSS Team logo">
            <span class="brand-name">${SPA_DATA.brand.name}</span>
          </a>
          <button class="nav-toggle" aria-expanded="false">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <ul class="nav-links" id="primary-navigation">
            ${navItems.map(item => `<li><a href="#${item.id}" data-route="${item.id}">${t(item.key)}</a></li>`).join('')}
            <li>
              <button class="lang-btn" id="lang-toggle" aria-label="切换语言">
                <span class="lang-text ${currentLang === 'zh' ? 'active' : ''}">中</span>
                <span class="lang-separator">|</span>
                <span class="lang-text ${currentLang === 'en' ? 'active' : ''}">EN</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <main id="spa-view"></main>
      ${renderFooter()}
    `;

    const toggle = root.querySelector('.nav-toggle');
    const nav = root.querySelector('#primary-navigation');
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });

    // 语言切换功能
    const langBtn = root.querySelector('#lang-toggle');
    langBtn.addEventListener('click', () => {
      currentLang = currentLang === 'zh' ? 'en' : 'zh';
      localStorage.setItem('language', currentLang);
      window.currentLang = currentLang;
      // 重新渲染整个应用
      renderShell();
      handleRoute();
    });
  }

  function renderFooter() {
    const year = new Date().getFullYear();
    
    // 地址列表，支持内嵌链接
    const addresses = currentLang === 'zh' ? [
      '杨浦区淞沪路2005号 <a href="https://www.fudan.edu.cn/" target="_blank" class="footer-inline-link">复旦大学</a> 二号交叉学科楼',
      '徐汇区华发路699弄3号 <a href="https://www.sii.edu.cn/" target="_blank" class="footer-inline-link">上海创智学院</a>',
      '中国 上海'
    ] : [
      'Building X2, No. 2005 Songhu Road, <a href="https://www.fudan.edu.cn/" target="_blank" class="footer-inline-link">Fudan University</a>, Yangpu District',
      '3 Lane 699, Huafa Road, <a href="https://www.sii.edu.cn/" target="_blank" class="footer-inline-link">Shanghai Innovation Institute</a>, Xuhui District',
      'Shanghai, China'
    ];
    
    const partners = [
      { label: t('footer.fudan'), url: 'https://ai.fudan.edu.cn/' },
      { label: t('footer.teai'), url: 'https://teai.fudan.edu.cn/' },
      { label: t('footer.nlp'), url: 'https://nlp.fudan.edu.cn/main.htm' }
    ];
    
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <h4>${t('footer.contact')}</h4>
              <ul>
                ${SPA_DATA.footer.contactLinks.map(link => `
                  <li><a href="${link.url}" ${link.url.startsWith('http') ? 'target="_blank"' : ''}><i class="${link.icon}"></i> ${link.label}</a></li>
                `).join('')}
              </ul>
            </div>
            <div>
              <h4>${t('footer.address')}</h4>
              <ul>
                ${addresses.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div>
              <h4>${t('footer.partners')}</h4>
              <ul>
                ${partners.map(item => `<li><a href="${item.url}" target="_blank">${item.label}</a></li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="footer-note">
            <p>&copy; ${year} OpenMOSS Team</p>
          </div>
        </div>
      </footer>
    `;
  }

  function handleRoute() {
    const { route, params } = parseHash();
    const view = document.getElementById('spa-view');
    const renderFn = routes[route] || routes.home;
    view.innerHTML = renderFn(params);
    updateNav(route);

    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 处理特定页面的锚点跳转
    if (route === 'positions' && params.section) {
      setTimeout(() => {
        const target = document.getElementById(params.section);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  function parseHash() {
    const raw = window.location.hash.replace('#', '');
    if (!raw) return { route: 'home', params: {} };
    const [route, query] = raw.split('?');
    const params = new URLSearchParams(query || '');
    const paramObj = {};
    params.forEach((value, key) => { paramObj[key] = value; });
    return { route: route || 'home', params: paramObj };
  }

  function updateNav(active) {
    document.querySelectorAll('.nav-links a').forEach(link => {
      const isActive = link.dataset.route === active || (!active && link.dataset.route === 'home');
      link.classList.toggle('active', isActive);
    });
  }

  function renderHero() {
    const paragraphs = [
      t('hero.p1'),
      t('hero.p2'),
      t('hero.p3')
    ];

    return `
      <section class="page-hero">
        <div class="container">
          <div class="page-hero-content">
            <div class="page-hero-copy">
              <h1>${t('hero.title')}</h1>
              ${paragraphs.map(p => `<p class="lead">${p}</p>`).join('')}
              <div class="page-hero-actions">
                <a class="btn btn-primary" href="https://openmoss.sii.edu.cn/en/" target="_blank" rel="noopener">${t('hero.btn.highlights')}</a>
                <a class="btn btn-outline" href="#positions">${t('hero.btn.join')}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderHome() {
    const pillars = [
      { key: 'infra', titleKey: 'pillar.infra.title', descKey: 'pillar.infra.desc' },
      { key: 'multimodal', titleKey: 'pillar.multimodal.title', descKey: 'pillar.multimodal.desc' },
      { key: 'reasoning', titleKey: 'pillar.reasoning.title', descKey: 'pillar.reasoning.desc' },
      { key: 'embodied', titleKey: 'pillar.embodied.title', descKey: 'pillar.embodied.desc' },
      { key: 'safety', titleKey: 'pillar.safety.title', descKey: 'pillar.safety.desc' },
      { key: 'arch', titleKey: 'pillar.arch.title', descKey: 'pillar.arch.desc' }
    ];

    return `
      ${renderHero()}
      <section class="container sec">
        <h2>${t('research.title')}</h2>
        <div class="pillars-grid">
          ${pillars.map(p => `
            <article class="pillar-card pillar-card-clickable" onclick="window.location.hash = 'research'; setTimeout(() => { const el = document.getElementById('pub-${p.key}'); if(el) { const offset = 100; const bodyRect = document.body.getBoundingClientRect().top; const elementRect = el.getBoundingClientRect().top; const elementPosition = elementRect - bodyRect; const offsetPosition = elementPosition - offset; window.scrollTo({ top: offsetPosition, behavior: 'smooth' }); } }, 100);">
              <h3>${t(p.titleKey)}</h3>
              <p>${t(p.descKey)}</p>
            </article>
          `).join('')}
        </div>
      </section>
      <section class="container sec">
        <h2>${t('people.title')}</h2>
        
        <h3 class="section-subtitle" style="margin-top: 0;">${t('people.subtitle.faculty')}</h3>
        <div class="team-members">
          ${renderTeamGrid(teamData.coreMembers || [])}
        </div>

        <div class="people-sections">
          <article class="people-card">
            <h3>${t('people.card.students.title')}</h3>
            <p>${t('people.card.students.desc')}</p>
            <a class="btn btn-outline" href="#people">${t('people.card.students.link')}</a>
          </article>
          <article class="people-card">
            <h3>${t('people.card.alumni.title')}</h3>
            <p>${t('people.card.alumni.desc')}</p>
            <a class="btn btn-outline" href="#alumni">${t('people.card.alumni.link')}</a>
          </article>
        </div>
      </section>
      <section class="container sec">
        <h2>${t('resources.title')}</h2>
        <div class="people-sections">
          <article class="people-card">
            <h3>${t('resources.highlight.tools.title')}</h3>
            <p>${t('resources.highlight.tools.desc')}</p>
            <div class="hero-actions" style="margin-top: auto; width: 100%;">
              <a class="btn btn-outline" href="https://github.com/OpenMOSS" target="_blank">${t('resources.highlight.tools.btn1')}</a>
              <a class="btn btn-outline" href="#resources">${t('resources.highlight.tools.btn2')}</a>
            </div>
          </article>
          <article class="people-card">
            <h3>${t('resources.highlight.courses.title')}</h3>
            <p>${t('resources.highlight.courses.desc')}</p>
            <div class="hero-actions" style="margin-top: auto; width: 100%;">
              <a class="btn btn-outline" href="#resources">${t('resources.highlight.courses.btn')}</a>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  function renderPeople() {
    const sections = [
      { id: 'faculty', titleKey: 'people.subtitle.faculty', key: 'coreMembers' },
      { id: 'postdocs', titleKey: 'people.subtitle.postdocs', key: 'postdocs' },
      { id: 'phd', titleKey: 'people.subtitle.phd', key: 'phdStudents' },
      { id: 'master', titleKey: 'people.subtitle.master', key: 'masterStudents' },
      { id: 'undergrad', titleKey: 'people.subtitle.undergrad', key: 'undergraduates' },
      { id: 'visiting', titleKey: 'people.subtitle.visiting', key: 'visitingStudents' }
    ];

    const tocLinks = sections.map(sec =>
      `<a href="javascript:void(0)" onclick="const el = document.getElementById('${sec.id}'); if(el) { const offset = 100; const bodyRect = document.body.getBoundingClientRect().top; const elementRect = el.getBoundingClientRect().top; const elementPosition = elementRect - bodyRect; const offsetPosition = elementPosition - offset; window.scrollTo({ top: offsetPosition, behavior: 'smooth' }); } return false;">${t(sec.titleKey)}</a>`
    ).join('');

    return `
      <section class="container sec" id="people-main">
        <div class="page-hero-copy" style="margin-bottom:40px;">
          <h1>${t('people.title')}</h1>
          <p>${t('people.desc')}</p>
        </div>

        <aside class="toc-sidebar">
            <h3>${t('people.toc')}</h3>
            <div class="toc-links">
                ${tocLinks}
            </div>
            <button class="back-to-top" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" style="margin-top: 16px;">${t('people.backToTop')}</button>
        </aside>

        <div class="people-content">
            ${sections.map(section => `
              <div id="${section.id}" class="people-dir">
                  <h2 class="section-subtitle">${t(section.titleKey)}</h2>
                  <div class="team-members">
                    ${renderTeamGrid(teamData[section.key] || [], section.id !== 'postdocs')}
                  </div>
              </div>
            `).join('')}
        </div>
      </section>
    `;
  }

  function renderTeamGrid(list, showTitle = true) {
    if (!list.length) return `<p>${t('people.updating')}</p>`;
    return list.map(member => `
      <div class="member-card">
        ${member.photo ? `<img src="${member.photo}" alt="${member.name[currentLang] || member.name.zh || member.name}" class="member-photo">` : ''}
        <h4 class="member-name">${member.name?.[currentLang] || member.name?.zh || member.name}</h4>
        ${showTitle && member.title ? `<p class="member-title">${member.title[currentLang] || member.title.zh || member.title}</p>` : ''}
      </div>
    `).join('');
  }

  function renderAlumni() {
    const categories = [
      { id: 'postdocs', titleKey: 'people.subtitle.postdocs' },
      { id: 'phd', titleKey: 'people.subtitle.phd' },
      { id: 'masters', titleKey: 'people.subtitle.master' },
      { id: 'undergrad', titleKey: 'people.subtitle.undergrad' },
      { id: 'visiting', titleKey: 'people.subtitle.visiting' }
    ];

    const tocLinks = categories.map(cat =>
      `<a href="javascript:void(0)" onclick="const el = document.getElementById('${cat.id}'); if(el) { const offset = 100; const bodyRect = document.body.getBoundingClientRect().top; const elementRect = el.getBoundingClientRect().top; const elementPosition = elementRect - bodyRect; const offsetPosition = elementPosition - offset; window.scrollTo({ top: offsetPosition, behavior: 'smooth' }); } return false;">${t(cat.titleKey)}</a>`
    ).join('');

    return `
      <section class="container sec" id="alumni-main">
        <div class="page-hero-copy" style="margin-bottom:40px;">
          <h1>${t('alumni.title')}</h1>
          <p>${t('alumni.desc')}</p>
        </div>

        <aside class="toc-sidebar">
            <h3>${t('alumni.toc')}</h3>
            <div class="toc-links">
                ${tocLinks}
            </div>
            <button class="back-to-top" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" style="margin-top: 16px;">${t('alumni.backToTop')}</button>
        </aside>

        <div class="alumni-content">
            ${categories.map(cat => `
              <div id="${cat.id}" class="alumni-dir">
                  <h2 class="section-subtitle">${t(cat.titleKey)}</h2>
                  <div class="alumni-list">
                    ${renderAlumniList(alumniData[cat.id] || [])}
                  </div>
              </div>
            `).join('')}
        </div>
      </section>
    `;
  }

  function renderAlumniList(list) {
    if (!list.length) return `<p>${t('alumni.updating')}</p>`;
    return list.map(item => `
      <div class="alumni-row">
        <span class="name">
          ${item.homepage ? `<a class="alumni-name-link" href="${item.homepage}" target="_blank">${item.name[currentLang] || item.name.zh || item.name}</a>` : (item.name[currentLang] || item.name.zh || item.name)}
        </span>
        <span class="destination">${item.destination?.[currentLang] || item.destination?.zh || item.destination || ''}</span>
      </div>
    `).join('');
  }

  function renderResearch() {
    const pillars = [
      { key: 'infra', titleKey: 'pillar.infra.title', descKey: 'pillar.infra.desc' },
      { key: 'multimodal', titleKey: 'pillar.multimodal.title', descKey: 'pillar.multimodal.desc' },
      { key: 'reasoning', titleKey: 'pillar.reasoning.title', descKey: 'pillar.reasoning.desc' },
      { key: 'embodied', titleKey: 'pillar.embodied.title', descKey: 'pillar.embodied.desc' },
      { key: 'safety', titleKey: 'pillar.safety.title', descKey: 'pillar.safety.desc' },
      { key: 'arch', titleKey: 'pillar.arch.title', descKey: 'pillar.arch.desc' }
    ];
    
    // 示例高亮内容
    const highlights = [
      { title: 'MOSS: 开源对话语言模型', desc: '首个国内开源的对话式大语言模型，支持插件系统。', date: '2023.04' },
      { title: 'AnyGPT: 多模态统一建模', desc: '实现语音、图像、文本的统一离散序列建模。', date: '2024.02' },
      { title: 'SpeechGPT: 端到端语音对话', desc: 'GPT-4o 级别的实时语音交互系统。', date: '2024.06' }
    ];
    
    return `
      <section class="container sec" id="research-main">
        <div class="page-hero-copy" style="margin-bottom: 40px;">
          <h1>${t('research.title')}</h1>
          <p class="lead">${t('research.intro')}</p>
        </div>
        <div class="pillars-grid">
          ${pillars.map(p => `
            <article class="pillar-card pillar-card-clickable" onclick="const el = document.getElementById('pub-${p.key}'); if(el) { const offset = 100; const bodyRect = document.body.getBoundingClientRect().top; const elementRect = el.getBoundingClientRect().top; const elementPosition = elementRect - bodyRect; const offsetPosition = elementPosition - offset; window.scrollTo({ top: offsetPosition, behavior: 'smooth' }); }">
              <h3>${t(p.titleKey)}</h3>
              <p>${t(p.descKey)}</p>
            </article>
          `).join('')}
        </div>
      </section>
      
      <section class="container sec">
        <h2>${t('research.highlights.title')}</h2>
        <div class="highlights-list">
          ${highlights.map(h => `
            <article class="highlight-item">
              <div class="highlight-date">${h.date}</div>
              <div class="highlight-content">
                <h3>${h.title}</h3>
                <p>${h.desc}</p>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
      
      <section class="container sec">
        <h2>${t('research.publications.title')}</h2>
        ${pillars.map(p => `
          <div id="pub-${p.key}" class="publication-section">
            <h3 class="publication-category">${t(p.titleKey)}</h3>
            <div class="publication-list">
              <p style="color: var(--text-light); font-style: italic;">代表工作持续更新中...</p>
            </div>
          </div>
        `).join('')}
      </section>
    `;
  }

  function renderResources() {
    const courses = [
      { title: t('resources.course.prml'), desc: t('resources.course.prml.desc'), url: 'https://mooc1.chaoxing.com/course/224348208.html', label: t('resources.btn.course') },
      { title: t('resources.course.exercises'), desc: t('resources.course.exercises.desc'), url: 'https://fudan-nlp.feishu.cn/wiki/WFifwXxfQiI3PKkn9FEcy0wKnjh', label: t('resources.btn.exercise') },
      { title: t('resources.course.community'), desc: t('resources.course.community.desc'), url: 'https://github.com/WillQvQ/SummerQuest-2025', label: t('resources.btn.summer') }
    ];

    const projects = [
      { name: 'MOSS', desc: t('resources.project.moss'), stars: '12k+ ⭐', stack: 'Python', url: 'https://github.com/OpenMOSS/MOSS' },
      { name: 'AnyGPT', desc: t('resources.project.anygpt'), stars: '500+ ⭐', stack: 'Python', url: 'https://github.com/OpenMOSS/AnyGPT' },
      { name: 'TTSD', desc: t('resources.project.ttsd'), stars: '200+ ⭐', stack: 'Python', url: 'https://github.com/OpenMOSS/TTSD' },
      { name: 'SpeechGPT', desc: t('resources.project.speechgpt'), stars: '300+ ⭐', stack: 'Python', url: 'https://github.com/OpenMOSS/SpeechGPT' },
      { name: 'Speech-to-Speech LLM', desc: t('resources.project.speech'), stars: '100+ ⭐', stack: 'Python', url: 'https://github.com/OpenMOSS/Speech-to-Speech-LLM' },
      { name: 'SAEs', desc: t('resources.project.saes'), stars: '50+ ⭐', stack: 'Python', url: 'https://github.com/OpenMOSS/SAEs' }
    ];

    return `
      <section class="container sec">
        <div class="page-hero-copy" style="margin-bottom: 40px;">
          <h1>${t('resources.title')}</h1>
          <p>${t('resources.desc')}</p>
        </div>

        <h2 class="section-subtitle">${t('resources.courses.title')}</h2>
        <p class="lead" style="margin-bottom: 24px;">${t('resources.courses.intro')}</p>
        <div class="highlight-grid highlight-grid-3">
          ${courses.map(card => `
            <article class="highlight-card">
              <h3>${card.title}</h3>
              <p>${card.desc}</p>
              <a href="${card.url}" target="_blank">${card.label}</a>
            </article>
          `).join('')}
        </div>

        <h2 class="section-subtitle" style="margin-top: 48px;">${t('resources.projects.title')}</h2>
        <div class="resource-grid">
          ${projects.map(project => `
            <article class="resource-card">
              <h3>${project.name}</h3>
              <p>${project.desc}</p>
              <div>
                <span style="display:inline-block;padding:4px 8px;background-color:var(--mist);border-radius:4px;font-size:12px;margin-right:8px;">${project.stars}</span>
                <span style="display:inline-block;padding:4px 8px;background-color:var(--mist);border-radius:4px;font-size:12px;">${project.stack}</span>
              </div>
              <a class="btn btn-inline" href="${project.url}" target="_blank">${t('resources.btn.visit')}</a>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderPositions() {
    const cards = [
      { id: 'phd', title: t('positions.card.phd'), desc: t('positions.card.phd.desc') },
      { id: 'master', title: t('positions.card.master'), desc: t('positions.card.master.desc') },
      { id: 'intern', title: t('positions.card.intern'), desc: t('positions.card.intern.desc') },
      { id: 'postdoc', title: t('positions.card.postdoc'), desc: t('positions.card.postdoc.desc') },
      { id: 'visiting', title: t('positions.card.visiting'), desc: t('positions.card.visiting.desc') },
      { id: 'engineer', title: t('positions.card.engineer'), desc: t('positions.card.engineer.desc') }
    ];

    const whyUs = [
      { icon: '✨', title: t('positions.why.research'), desc: t('positions.why.research.desc') },
      { icon: '🚀', title: t('positions.why.resources'), desc: t('positions.why.resources.desc') },
      { icon: '👥', title: t('positions.why.team'), desc: t('positions.why.team.desc') },
      { icon: '💡', title: t('positions.why.opensource'), desc: t('positions.why.opensource.desc') },
      { icon: '🌏', title: t('positions.why.collaboration'), desc: t('positions.why.collaboration.desc') },
      { icon: '📈', title: t('positions.why.career'), desc: t('positions.why.career.desc') }
    ];

    return `
      <section class="container sec">
        <div class="page-hero-copy">
          <h1>${t('positions.title')}</h1>
          <p class="lead">${t('positions.intro')}</p>
        </div>
        <div class="resource-grid" style="margin-top:30px;">
          ${cards.map(card => `
            <article class="resource-card">
              <h3>${card.title}</h3>
              <p>${card.desc}</p>
              <a class="btn btn-inline" href="#positions?section=${card.id}">${t('positions.detail.link')}</a>
            </article>
          `).join('')}
        </div>
      </section>
      <section class="container sec">
        <h2>${t('positions.why.title')}</h2>
        <div class="why-join-grid">
          ${whyUs.map(item => `
            <div class="why-join-card">
              <div class="why-join-icon">${item.icon}</div>
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
          `).join('')}
        </div>
      </section>
      <section class="container sec">
        <h2>${t('positions.apply.title')}</h2>
        <div style="background-color:var(--white);padding:32px;border-radius:12px;border:1px solid var(--border);">
          <p style="margin:0;font-weight:600;color:var(--text);">${t('positions.apply.desc')}
            <a href="${SPA_DATA.positions.applyUrl}" target="_blank" style="color:var(--fudan-blue);text-decoration:underline;">${t('positions.apply.link')}</a>
          </p>
        </div>
      </section>
      <section class="container sec" id="positions-detail">
        <h2>${t('positions.detail.title')}</h2>
        ${SPA_DATA.positions.details.map(detail => `
          <article class="detail-section" id="${detail.id}">
            <h3>${detail.title[currentLang] || detail.title.zh}</h3>
            <div class="detail-content">
              ${detail.blocks.map(block => `
                <h3>${block.subtitle[currentLang] || block.subtitle.zh}</h3>
                ${(block.paragraphs[currentLang] || block.paragraphs.zh).map(p => `<p>${p}</p>`).join('')}
              `).join('')}
            </div>
          </article>
        `).join('')}
        <div style="margin-top:40px;text-align:center;">
          <a class="btn btn-primary" href="${SPA_DATA.positions.applyUrl}" target="_blank">${t('positions.apply.btn')}</a>
        </div>
      </section>
    `;
  }

  function renderWebmaster() {
    return `
      <section class="container sec">
        <div class="page-hero-copy">
          <h1>${t('webmaster.title')}</h1>
          <p>${t('webmaster.intro')}</p>
        </div>
        <div class="alumni-list">
          ${SPA_DATA.webmaster.members.map(member => `
            <div class="alumni-row">
              <span class="name">${member.name}</span>
              <span class="destination">${member.role}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
