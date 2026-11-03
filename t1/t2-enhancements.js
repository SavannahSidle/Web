(() => {
  // Keep the legacy mailto handler from taking over this online form. This capture
  // listener stops that handler but leaves the browser's native POST untouched.
  document.querySelector('[data-online-form]')?.addEventListener('submit', (event) => event.stopImmediatePropagation(), true);
  document.querySelectorAll('[data-study-filters]').forEach((group) => {
    const cards = Array.from(document.querySelectorAll('[data-study-archive] [data-category]'));
    const buttons = Array.from(group.querySelectorAll('[data-study-filter]'));
    const status = document.querySelector('[data-study-filter-status]');
    if (!cards.length || !buttons.length) return;
    const apply = (filter) => {
      let visible = 0;
      cards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.studyFilter === filter)));
      if (status) status.textContent = filter === 'all' ? `Showing all ${visible} studies.` : `Showing ${visible} ${buttons.find((button) => button.dataset.studyFilter === filter)?.textContent.toLowerCase() || 'matching'} studies.`;
    };
    buttons.forEach((button) => button.addEventListener('click', () => apply(button.dataset.studyFilter)));
  });

  const notice = document.querySelector('.t2-form-notice');
  if (notice && new URLSearchParams(location.search).has('submitted')) {
    notice.classList.add('show');
    notice.textContent = 'Thanks—your project inquiry was submitted. You can also email projects@micadigital.ca if you need to add anything.';
    document.querySelector('[data-online-form]')?.querySelectorAll('label,button').forEach((field) => { field.hidden = true; });
  }

  const gallery = document.querySelector('.design-studies');
  if (gallery) {
    gallery.querySelectorAll('.study:not([data-study-draft])').forEach((card) => {
      const caption = card.querySelector(':scope > p');
      if (!caption || card.querySelector('.t2-card-label')) return;
      const label = document.createElement('span');
      label.className = 't2-card-label';
      label.textContent = card.classList.contains('study-dinosaur') ? 'Interactive concept · 3D viewer' : 'Interface study · concept, not client work';
      caption.before(label);
    });
  }
})();
