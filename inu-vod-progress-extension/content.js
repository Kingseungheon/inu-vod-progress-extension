(function () {
  'use strict';

  const PANEL_ID = 'inuProgressPanel';
  const PROGRESS_URL = 'https://cyber.inu.ac.kr/report/ubcompletion/progress.php?id=';

  function cleanCourseName(name) {
    return name
      .replace(/\s+/g, ' ')
      .replace(/^\s*(학습지원|수강강좌|수강 강좌|비교과 과정|비교과|자율강좌|교과 과정|자율 강좌)\s*/, '')
      .trim();
  }

  function findCourses() {
    const coursesById = new Map();

    document.querySelectorAll('a').forEach((link) => {
      let url;
      try {
        url = new URL(link.href);
      } catch (error) {
        return;
      }

      if (url.origin !== location.origin || !url.pathname.endsWith('/course/view.php')) return;

      const id = url.searchParams.get('id');
      const name = cleanCourseName(link.textContent || '');
      if (!id || !name) return;

      const previousName = coursesById.get(id);
      if (!previousName || previousName.length < name.length) {
        coursesById.set(id, name);
      }
    });

    return [...coursesById.entries()].map(([id, name]) => ({ id, name }));
  }

  async function fetchProgress(courseId) {
    try {
      const response = await fetch(PROGRESS_URL + encodeURIComponent(courseId), {
        credentials: 'include'
      });
      if (!response.ok) return { error: true };

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      let completed = 0;
      let total = 0;

      doc.querySelectorAll('tr').forEach((row) => {
        const cells = [...row.querySelectorAll('td, th')]
          .map((cell) => cell.textContent.trim());
        const statuses = cells.filter((value) => value === 'O' || value === 'X');

        if (!statuses.length) return;
        total += 1;
        if (statuses[0] === 'O') completed += 1;
      });

      if (total === 0) return { unavailable: true };
      return { percent: Math.round((completed / total) * 100) };
    } catch (error) {
      console.warn('[INU 진도율] 출석부 조회 실패:', courseId, error);
      return { error: true };
    }
  }

  async function runPool(items, concurrency, task) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function worker() {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        results[currentIndex] = await task(items[currentIndex]);
      }
    }

    const workerCount = Math.min(concurrency, items.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return results;
  }

  function colorFor(percent) {
    if (percent >= 100) return '#009b63';
    if (percent >= 50) return '#d88a00';
    return '#c62828';
  }

  function createPanel(courseCount) {
    const panel = document.createElement('section');
    panel.id = PANEL_ID;
    Object.assign(panel.style, {
      position: 'fixed',
      top: '70px',
      right: '20px',
      zIndex: '999999',
      width: '320px',
      maxHeight: '78vh',
      overflowY: 'auto',
      background: '#ffffff',
      border: '1px solid #dddddd',
      borderRadius: '12px',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.18)',
      color: '#222222',
      font: '13px system-ui, sans-serif'
    });

    const header = document.createElement('div');
    Object.assign(header.style, {
      position: 'sticky',
      top: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 14px',
      background: '#ffffff',
      borderBottom: '1px solid #eeeeee',
      borderRadius: '12px 12px 0 0'
    });

    const title = document.createElement('strong');
    title.textContent = '강좌별 진도율';

    const buttons = document.createElement('div');
    const refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.textContent = '새로고침';
    refresh.title = '진도율 다시 조회';
    Object.assign(refresh.style, {
      border: '0',
      borderRadius: '6px',
      padding: '5px 8px',
      background: '#eef2ff',
      color: '#243b72',
      cursor: 'pointer',
      fontSize: '12px'
    });
    refresh.addEventListener('click', () => {
      panel.remove();
      showProgressPanel();
    });

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '닫기';
    close.title = '진도율 창 닫기';
    Object.assign(close.style, {
      marginLeft: '6px',
      border: '0',
      borderRadius: '6px',
      padding: '5px 8px',
      background: '#fff0f0',
      color: '#9f2525',
      cursor: 'pointer',
      fontSize: '12px'
    });
    close.addEventListener('click', () => panel.remove());

    buttons.append(refresh, close);
    header.append(title, buttons);

    const status = document.createElement('div');
    status.dataset.role = 'status';
    status.textContent = `진도율 확인 중... (0/${courseCount})`;
    Object.assign(status.style, {
      padding: '10px 14px',
      color: '#666666'
    });

    const list = document.createElement('div');
    list.dataset.role = 'list';

    panel.append(header, status, list);
    document.body.appendChild(panel);
    return panel;
  }

  function renderResults(panel, results) {
    const status = panel.querySelector('[data-role="status"]');
    const list = panel.querySelector('[data-role="list"]');
    status.textContent = `${results.length}개 강좌`;
    list.textContent = '';

    results
      .sort((a, b) => {
        if (a.percent === null && b.percent !== null) return 1;
        if (a.percent !== null && b.percent === null) return -1;
        return (a.percent ?? 101) - (b.percent ?? 101);
      })
      .forEach((course) => {
        const item = document.createElement('div');
        Object.assign(item.style, {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '11px 14px',
          borderTop: '1px solid #f0f0f0'
        });

        const link = document.createElement('a');
        link.href = `https://cyber.inu.ac.kr/course/view.php?id=${encodeURIComponent(course.id)}`;
        link.textContent = course.name;
        Object.assign(link.style, {
          flex: '1',
          color: '#1d2b45',
          fontWeight: '600',
          lineHeight: '1.35',
          textDecoration: 'none'
        });

        const percent = document.createElement('strong');
        percent.textContent = course.percent === null ? '확인 불가' : `${course.percent}%`;
        Object.assign(percent.style, {
          flex: '0 0 auto',
          color: course.percent === null ? '#888888' : colorFor(course.percent),
          fontSize: '15px'
        });

        item.append(link, percent);
        list.appendChild(item);
      });
  }

  async function showProgressPanel() {
    if (document.getElementById(PANEL_ID)) return;

    const courses = findCourses();
    if (!courses.length) return;

    const panel = createPanel(courses.length);
    let loaded = 0;

    const progressResults = await runPool(courses, 5, async (course) => {
      const progress = await fetchProgress(course.id);
      loaded += 1;

      const status = panel.querySelector('[data-role="status"]');
      if (status) status.textContent = `진도율 확인 중... (${loaded}/${courses.length})`;

      return {
        ...course,
        percent: typeof progress.percent === 'number' ? progress.percent : null
      };
    });

    if (panel.isConnected) renderResults(panel, progressResults);
  }

  if (findCourses().length) {
    showProgressPanel();
    return;
  }

  const observer = new MutationObserver(() => {
    if (!findCourses().length) return;
    observer.disconnect();
    showProgressPanel();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20000);
})();
