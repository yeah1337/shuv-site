/* ==========================================================================
   Shuv site behaviour, shared by index.html, privacy.html and terms.html.
   Plain JavaScript, no dependencies, loaded with `defer` in each <head>.

   1. Sticky header offset      5. Phone menu (hamburger)
   2. Scrolling to sections     6. "Jello" press effect
   3. Link handling + fades     7. Contact form
   4. Landing on #section from another page
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var header = document.querySelector('.site-header');

  /* 1. Sticky header offset --------------------------------------------------
     Every element with an id uses scroll-margin-top: var(--header-h) (see
     css). The header's height changes with the logo size, so measure it. */
  function syncHeaderHeight() {
    if (header) root.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeaderHeight);

  /* 2. Scrolling to sections -------------------------------------------------- */
  function scrollToId(id, smooth) {
    var target = id && id !== 'top' ? document.getElementById(id) : null;
    var y = 0;
    if (target) {
      var margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      y = target.getBoundingClientRect().top + window.pageYOffset - margin;
    }
    window.scrollTo({ top: Math.max(0, y), behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
  }

  // "/", "/index.html" and "/index" are the same page; so are "/privacy" and "/privacy.html"
  function samePath(a, b) {
    function norm(p) { return p.replace(/\.html$/, '').replace(/\/index$/, '/'); }
    return norm(a) === norm(b);
  }

  /* 3. Link handling + page fades ---------------------------------------------
     - "#section" links and links to the current page: smooth scroll, no reload.
     - Links to another page of this site: fade out, then navigate. The next
       page fades itself in with CSS (body animation "page-in").
     - href="#" is a no-op. Nothing uses one now that the social icons
       point at real profiles, but a bare # reaching the code below would
       fade the page out and 'navigate' to the URL it is already on.
     - External links, mailto: and new-tab clicks are left to the browser. */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest && e.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

    if (link.getAttribute('href') === '#') { e.preventDefault(); return; }

    var url = new URL(link.href, location.href);
    if (url.protocol !== location.protocol || url.host !== location.host) return;

    if (samePath(url.pathname, location.pathname)) {
      e.preventDefault();
      var id = url.hash.length > 1 ? decodeURIComponent(url.hash.slice(1)) : 'top';
      scrollToId(id, true);
      if (history.replaceState) {
        history.replaceState(null, '', id === 'top' ? location.pathname + location.search : '#' + id);
      }
      return;
    }

    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(function () { location.href = url.href; }, reduceMotion ? 0 : 300);
  });

  // The back/forward cache can restore a page mid fade-out: undo the fade.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) document.body.classList.remove('is-leaving');
  });

  /* 4. Landing on "index.html#tutorial" from another page -----------------------
     The browser jumps to the anchor itself. Images have width/height set so
     they don't shift the page, but the web font can, so re-align once fonts
     and images are in, unless the visitor has already started scrolling. */
  if (location.hash.length > 1) {
    var moved = false;
    var markMoved = function () { moved = true; };
    ['wheel', 'touchstart', 'keydown'].forEach(function (type) {
      window.addEventListener(type, markMoved, { once: true, passive: true });
    });
    var realign = function () {
      if (!moved) scrollToId(decodeURIComponent(location.hash.slice(1)), false);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(realign);
    window.addEventListener('load', realign);
  }

  /* 5. Phone menu (hamburger) ---------------------------------------------------
     Under 900px only; css hides it on desktop. Closes on: a link, the close
     button, a tap outside (invisible backdrop), Esc, or resizing to desktop. */
  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('.menu-btn');
  var backdrop = document.querySelector('.menu-backdrop');

  function setMenu(open, restoreFocus) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    if (backdrop) backdrop.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) menu.focus({ preventScroll: true });
    else if (restoreFocus && menuBtn) menuBtn.focus({ preventScroll: true });
  }

  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(true); });
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-menu-close]')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('is-open')) setMenu(false, true);
  });
  var desktopQuery = window.matchMedia('(min-width: 900px)');
  var onBreakpoint = function (mq) { if (mq.matches) setMenu(false); };
  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', onBreakpoint);
  else if (desktopQuery.addListener) desktopQuery.addListener(onBreakpoint);

  /* 6. "Jello" press -------------------------------------------------------------
     Anything with class="jello" (nav links, menu links, buttons) wobbles
     when pressed. The keyframes are in css ("shuv-jello"). */
  document.addEventListener('pointerdown', function (e) {
    if (reduceMotion) return;
    var el = e.target.closest && e.target.closest('.jello');
    if (!el) return;
    el.classList.remove('is-jello');
    void el.offsetWidth; // restart the animation if it is already running
    el.classList.add('is-jello');
  });
  document.addEventListener('animationend', function (e) {
    if (e.animationName === 'shuv-jello') e.target.classList.remove('is-jello');
  });

  /* 7. Contact form ----------------------------------------------------------------
     IT USED TO BE A mailto:. Which looks like it works, and silently does
     nothing for the large number of visitors — most people on a desktop —
     with no mail client configured. They type a message, press send, and
     nothing happens, and you never find out they tried.

     It posts to the contact Edge Function now, which bounds every field,
     rate limits per IP in SQL, and drops the result into a table only the
     dashboard can read. */
  var form = document.getElementById('contact-form');
  if (form) {
    var ENDPOINT_CONTACT = 'https://vcyamzufnzrfrnkkqihu.supabase.co/functions/v1/contact';
    var statusEl = document.getElementById('contact-status');
    var sendBtn = document.getElementById('contact-send');

    var say = function (msg, bad) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = 'contact-form__status' + (bad ? ' is-bad' : ' is-good');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* novalidate is on the form so the browser does not interrupt with
         its own bubbles, but the constraints are still declared on the
         inputs — so ask for them explicitly and report the first miss. */
      if (!form.checkValidity()) {
        say('Please fill in every field, with a real email address.', true);
        return;
      }

      var data = new FormData(form);
      if (sendBtn) { sendBtn.disabled = true; }
      say('Sending…', false);

      fetch(ENDPOINT_CONTACT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') || ''),
          email: String(data.get('email') || ''),
          message: String(data.get('message') || ''),
          website: String(data.get('website') || ''),
        }),
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (body) {
          if (body && body.ok) {
            form.reset();
            say('Thanks — that reached us. We read everything.', false);
          } else {
            say((body && body.error) || 'That did not send. Try again in a moment.', true);
          }
        })
        .catch(function () {
          /* A failed fetch leaves them with nowhere to go, so give them
             the address rather than a dead end. */
          say('That did not send. Email support@shuvskate.com instead.', true);
        })
        .then(function () { if (sendBtn) { sendBtn.disabled = false; } });
    });
  }

  /* 8. Unsubscribe page -------------------------------------------------------------
     Only runs on unsubscribe.html, which is the only page with #unsub-status.

     The token in the query string is the whole authorisation — see the
     comment at the top of that page for why it has to work without a
     sign-in, and why that means the token can only ever do this one thing.

     Fired on load rather than behind a button ON PURPOSE. Someone who
     clicked "unsubscribe" has already said what they want; making them
     click again is the pattern that gets companies fined. The endpoint is
     idempotent, so a prefetching email client just does it twice. */
  var unsubStatus = document.getElementById('unsub-status');
  if (unsubStatus) {
    var ENDPOINT = 'https://vcyamzufnzrfrnkkqihu.supabase.co/functions/v1/unsubscribe';
    var ok = document.getElementById('unsub-ok');
    var bad = document.getElementById('unsub-bad');

    var show = function (good) {
      unsubStatus.hidden = true;
      if (good && ok) ok.hidden = false;
      if (!good && bad) bad.hidden = false;
    };

    var token = '';
    try {
      token = new URLSearchParams(location.search).get('t') || '';
    } catch (e) {
      token = '';
    }

    if (!token) {
      show(false);
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }),
      })
        .then(function (r) { return r.json(); })
        .then(function (body) { show(!!(body && body.ok)); })
        /* A network failure is not a refusal, but from the reader's side
           it is the same outcome: they are not unsubscribed. Saying so is
           better than a page that sits on "Checking…" forever. */
        .catch(function () { show(false); });
    }
  }
})();
