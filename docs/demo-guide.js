// A guide to the existing scripted story. It never advances the demo for the visitor.
(() => {
  const guide = document.createElement('aside');
  guide.className = 'demo-guide';
  guide.setAttribute('aria-label', 'Demo guide');
  guide.innerHTML = '<svg class="demo-guide-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V4M6 10l6-6 6 6"/></svg><p id="demo-guide-description" role="status" aria-live="polite"></p>';
  const toggle = document.createElement('button');
  toggle.className = 'demo-guide-toggle';
  toggle.type = 'button';
  toggle.innerHTML = '<img src="dave.png" alt="" width="60" height="60"><span class="dave-tooltip"></span>';
  document.body.append(guide, toggle);

  let dismissed = false;
  let finished = false;
  let prioritiesSeen = location.hash === '#/inbox-summary';
  let currentTarget = null;
  let currentKey = '';
  let pending = false;

  function clearTarget() {
    if (!currentTarget) return;
    currentTarget.classList.remove('demo-guide-target');
    const ids = (currentTarget.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== 'demo-guide-description');
    if (ids.length) currentTarget.setAttribute('aria-describedby', ids.join(' '));
    else currentTarget.removeAttribute('aria-describedby');
    currentTarget = null;
  }

  function nextStep() {
    const select = selector => document.querySelector(selector);
    if (modal.open) {
      const back = select('[data-guide="return-to-dashboard"]');
      return back ? { key: 'return', target: back, text: 'Back to what matters' } : null;
    }
    if (select('.slack-banner-body')) return { key: 'slack', target: select('.slack-banner-body'), text: 'Read Caroline’s message' };
    if (select('.incoming-call')) return { key: 'call', target: select('.incoming-call .native-decline'), text: select('.call-connected') ? 'End the call' : 'Decline the call' };
    if (select('.messages-notification')) return { key: 'reply', target: select('.messages-notification .notification-action'), text: 'Reply to Theresa' };
    if (padelAccepted) {
      const review = select('[data-action="review-findings"]');
      return review ? { key: 'review', target: review, text: 'Review the findings' } : { key: 'dashboard', target: select('[data-session="activation-dashboard"]'), text: 'Open the dashboard' };
    }
    if (invitationShown) return { key: 'message-wait', text: 'Theresa is typing…' };
    const dashboard = findDashboardSession();
    if (dashboard) {
      if (active === 'architecture-draft' || distractionTimer) return { key: 'call-wait', text: 'A call is coming…' };
      return { key: 'detour', target: select('[data-session="architecture-draft"]'), text: 'Try a detour' };
    }
    if (active === 'build-w') return { key: 'slack-wait', text: 'A message is coming…' };
    if (prioritiesSeen || active) return { key: 'yesterday', target: select('[data-session="build-w"]'), text: 'Open yesterday’s work' };
    return { key: 'start', target: select('[data-action="priorities"]'), text: 'Start here' };
  }

  function positionGuide() {
    if (guide.hidden || guide.classList.contains('demo-guide-inline')) return;
    const margin = 16;
    const gap = 28;
    const width = guide.offsetWidth;
    const height = guide.offsetHeight;
    let left;
    let top;
    if (currentTarget) {
      const rect = currentTarget.getBoundingClientRect();
      const center = Math.max(margin, Math.min(innerWidth - margin, rect.left + rect.width / 2));
      left = Math.max(margin, Math.min(innerWidth - width - margin, center - width / 2));
      const below = rect.bottom + gap + height <= innerHeight - margin;
      top = below ? rect.bottom + gap : rect.top - gap - height;
      // On a short viewport, sit beside the target when neither vertical side fits.
      if (top < margin && rect.right + gap + width < innerWidth - margin) {
        left = rect.right + gap;
        top = Math.max(margin, Math.min(innerHeight - height - margin, rect.top));
        guide.dataset.side = 'right';
        guide.style.setProperty('--arrow-top', Math.min(height - 24, Math.max(24, rect.top + rect.height / 2 - top)) + 'px');
      } else {
        guide.dataset.side = below ? 'below' : 'above';
        guide.style.setProperty('--arrow-left', Math.max(24, Math.min(width - 24, center - left)) + 'px');
      }
    } else {
      left = Math.max(margin, innerWidth - width - margin);
      top = 112;
      guide.dataset.side = 'none';
    }
    guide.style.left = left + 'px';
    guide.style.top = Math.max(margin, Math.min(innerHeight - height - margin, top)) + 'px';
  }

  function updateGuide() {
    pending = false;
    const toggleLabel = finished ? 'Replay demo' : dismissed ? 'Show hints' : 'Hide hints';
    toggle.setAttribute('aria-label', 'Dave · ' + toggleLabel);
    toggle.querySelector('.dave-tooltip').textContent = toggleLabel;
    if (finished) toggle.removeAttribute('aria-pressed');
    else toggle.setAttribute('aria-pressed', String(!dismissed));
    if (dismissed || finished) {
      clearTarget();
      guide.hidden = true;
      return;
    }
    let step = nextStep();
    if (!step) { clearTarget(); guide.hidden = true; return; }
    // The sidebar is offscreen on phones and can also be collapsed on desktop.
    if (step.target?.closest('.sidebar')) {
      const sidebar = document.querySelector('.sidebar').getBoundingClientRect();
      if (sidebar.right <= 0) step = { key: 'open-sidebar-' + step.key, target: document.querySelector('header [data-action="sidebar"]'), text: 'Open Recents' };
    }
    const inline = !!step.target?.closest('dialog');
    if (inline && guide.parentElement !== step.target.parentElement) step.target.before(guide);
    else if (!inline && guide.parentElement !== document.body) document.body.append(guide);
    guide.classList.toggle('demo-guide-inline', inline);
    guide.hidden = false;
    if (currentKey !== step.key || guide.querySelector('p').textContent !== step.text) {
      guide.querySelector('p').textContent = step.text;
      currentKey = step.key;
    }
    if (currentTarget !== step.target) {
      clearTarget();
      currentTarget = step.target || null;
      if (currentTarget) {
        currentTarget.classList.add('demo-guide-target');
        currentTarget.setAttribute('aria-describedby', [currentTarget.getAttribute('aria-describedby'), 'demo-guide-description'].filter(Boolean).join(' '));
        currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      }
    }
    positionGuide();
  }

  function scheduleUpdate() {
    if (!pending) { pending = true; requestAnimationFrame(updateGuide); }
  }
  toggle.onclick = () => {
    if (finished) { location.href = location.pathname; return; }
    dismissed = !dismissed;
    updateGuide();
  };
  document.addEventListener('click', event => {
    if (event.target.closest('[data-action="priorities"]')) prioritiesSeen = true;
    if (event.target.closest('[data-action="review-findings"]')) finished = true;
    scheduleUpdate();
  });
  modal.addEventListener('close', scheduleUpdate);
  window.addEventListener('popstate', scheduleUpdate);
  window.addEventListener('resize', scheduleUpdate);
  document.addEventListener('scroll', positionGuide, true);
  new MutationObserver(records => {
    if (records.some(record => !guide.contains(record.target) && !toggle.contains(record.target))) scheduleUpdate();
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'open', 'class', 'aria-busy'] });
  updateGuide();
})();
