/* V45.8.0 two-level navigation, V45.8.1 mobile pattern adoption, V45.8.2 unified across all screen
   sizes. One semantic model (ProjectNavigationModel.view()), rendered into three places, at every
   viewport width — there is no desktop-specific topic row or dropdown panel anymore; the hamburger +
   slide-in drawer is the one navigation surface everywhere:
     - #stepper (nav.topicbar, position:sticky): the current topic's Level 2 destinations as an
       always-visible sticky chip row on narrow screens only (components.project-navigation.css scopes
       this to mobile widths — there is no reason to also dock a chip row under the header on a wide
       desktop screen when the drawer already covers the same ground).
     - #projectNavBottomBar: the fixed bottom icon tab bar for the 5 Level 1 topics, likewise scoped
       to narrow screens in CSS — a bottom tab bar is not a desktop convention.
     - #projectNavDrawer / #projectNavDrawerBackdrop: the hamburger-triggered slide-in drawer showing
       the full topic + destination tree in one scrollable list — visible and usable at EVERY screen
       size now, mirroring core/advisor.js's pnOpen/pnClose + its backdrop/focus-trap shape under new
       class names so it never collides with the advisor drawer's
       `.pn-drawer`/`.pn-backdrop`/`advisor-open`.
   render() populates all three unconditionally on every call; which of the first two are actually
   visible at the current width is a pure CSS media-query decision, not a JS branch.

   This module does NOT attach its own document click/keydown listeners: the app already has one
   delegated click handler (core/events.js's `actions` table, dispatched by data-act) and one global
   keydown handler. Routing data-project-nav-step / data-project-nav-anchor /
   data-project-nav-drawer-toggle through those (see core/events.js) avoids a second, competing
   listener. The drawer's own Tab focus-trap is exposed as handleDrawerKeydown() for events.js's
   existing keydown handler to call, for the same reason — mirroring how every other modal/drawer in
   this codebase (reset dialog, photo examples, advisor) keeps its Tab-trap in that one handler rather
   than attaching a second keydown listener of its own.

   drawerOpen / drawerReturnFocusElement are the only state this module owns, and are intentionally
   never persisted and never read as product/progress meaning — see core/navigation-model.js's header
   comment for why every destination here is tied to a real, confirmed id rather than a guess. The
   drawer always closes on navigation (the conventional drawer behavior) — there is no "keep open"/pin
   concept anymore; it existed only for the old desktop dropdown panel, which this version retired. */
(function (root) {
  'use strict';

  var sectionObserver = null;
  var headerObserver = null;
  var headerOffsetWired = false;
  var drawerOpen = false;
  var drawerReturnFocusElement = null;

  /* nav.topicbar is sticky (components.project-navigation.css) so the mega menu stays reachable
     while a long screen (Review & confirm, Your guidance) scrolls underneath it. The offset is
     measured, never hardcoded: header.app's rendered height isn't fixed in CSS (it changes with the
     "restored answers" banner, responsive wrapping, etc.), so a guessed px value would drift out of
     sync the same way the removed left-nav-pane selectors drifted from their real targets. */
  function measureHeaderOffset() {
    var header = root.document.querySelector('header.app');
    var rect = header && typeof header.getBoundingClientRect === 'function'
      ? header.getBoundingClientRect()
      : null;
    var offset = rect && rect.bottom > 0 ? rect.bottom : 0;

    root.document.documentElement.style.setProperty(
      '--project-nav-header-offset',
      offset + 'px'
    );
  }

  function wireHeaderOffsetTracking() {
    if (headerOffsetWired) {
      return;
    }

    headerOffsetWired = true;
    root.addEventListener('resize', measureHeaderOffset);

    var header = root.document.querySelector('header.app');

    if (header && typeof root.ResizeObserver === 'function') {
      headerObserver = new root.ResizeObserver(measureHeaderOffset);
      headerObserver.observe(header);
    }
  }

  function e(value) {
    if (typeof root.esc === 'function') {
      return root.esc(String(value == null ? '' : value));
    }

    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function reducedMotion() {
    return Boolean(
      root.matchMedia &&
      root.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function currentModel() {
    return root.ProjectNavigationModel.view({
      currentStep:
        root.S && typeof root.S.step === 'number'
          ? root.S.step
          : 0,
      documentRoot: root.document,
      isStepReachable:
        typeof root.isStepReachable === 'function'
          ? root.isStepReachable
          : function (step) {
              return Boolean(root.S && step === root.S.step);
            }
    });
  }

  function stateLabel(topic) {
    if (topic.current) {
      return 'Now';
    }

    if (topic.reachable) {
      return 'Review';
    }

    return 'Later';
  }

  /* One icon per Level 1 topic, used by the mobile bottom tab bar and the drawer's topic rows.
     icon() is a global from core/icons.js, which loads before this file in build.js's JS array. */
  var TOPIC_ICONS = {
    project: 'home',
    details: 'file-text',
    review: 'circle-check',
    prepare: 'hard-hat',
    guidance: 'compass'
  };

  function topicIcon(topicId, size) {
    var name = TOPIC_ICONS[topicId];

    if (!name || typeof root.icon !== 'function') {
      return '';
    }

    return root.icon(name, size || 20);
  }

  /* Walks group children into one flat, one-level list — used only by the mobile sticky Level 2 bar,
     where a nested disclosure would be awkward in a horizontally-scrolling strip. The desktop panel
     and the mobile drawer both keep the real nested/grouped structure. */
  function flattenDestinations(destinations) {
    var out = [];

    (destinations || []).forEach(function (destination) {
      if (destination.type === 'group') {
        out = out.concat(flattenDestinations(destination.children));
      } else {
        out.push(destination);
      }
    });

    return out;
  }

  function renderAnchor(destination, nested) {
    if (!destination || !destination.targetId) {
      return '';
    }

    var itemClass = 'project-nav__destination-item';

    if (nested) {
      itemClass += ' project-nav__destination-item--nested';
    }

    return (
      '<li class="' + itemClass + '">' +
        '<a' +
          ' class="project-nav__destination"' +
          ' href="#' + e(destination.targetId) + '"' +
          ' data-act="project-nav-anchor"' +
          ' data-project-nav-anchor="' + e(destination.id) + '"' +
          ' data-project-nav-target="' + e(destination.targetId) + '"' +
        '>' +
          e(destination.label) +
        '</a>' +
      '</li>'
    );
  }

  /* A 'screen' destination (no mid-page anchor, just "go to this step") renders as a step-jump
     button rather than an in-page anchor link. core/navigation-model.js's current TOPICS data does
     not use this type — steps 0/1 have no real in-page sections to point to — but resolveDestination
     supports it generically, so the renderer handles it correctly rather than silently dropping it. */
  function renderScreenDestination(destination, nested) {
    if (!destination || !destination.available) {
      return '';
    }

    var itemClass = 'project-nav__destination-item';

    if (nested) {
      itemClass += ' project-nav__destination-item--nested';
    }

    return (
      '<li class="' + itemClass + '">' +
        '<button' +
          ' type="button"' +
          ' class="project-nav__destination project-nav__destination--screen"' +
          ' data-act="project-nav-step"' +
          ' data-project-nav-step="' + e(destination.step) + '"' +
        '>' +
          e(destination.label) +
        '</button>' +
      '</li>'
    );
  }

  function renderGroup(group) {
    return (
      '<li class="project-nav__group">' +
        '<h3 class="project-nav__group-heading">' +
          e(group.label) +
        '</h3>' +
        '<ul class="project-nav__nested-list">' +
          (group.children || [])
            .map(function (child) {
              return renderDestination(child, true);
            })
            .join('') +
        '</ul>' +
      '</li>'
    );
  }

  function renderDestination(destination, nested) {
    if (destination.type === 'group') {
      return renderGroup(destination);
    }

    if (destination.type === 'screen') {
      return renderScreenDestination(destination, nested);
    }

    return renderAnchor(destination, nested);
  }

  /* Mobile sticky Level 2 bar: the current topic's destinations, flattened, as an always-visible
     horizontally-scrolling chip row riding nav.topicbar's existing sticky positioning. No open/close
     state — it's just part of the page chrome whenever the current topic has destinations, so there
     is nothing to tap to reveal it. Renders '' (nothing) when there are none, same rule as the
     desktop panel. Reuses renderAnchor's exact markup/attributes so the scrollspy
     (observeSections/setCurrentDestination) keeps working unchanged. */
  function renderStickyDestinations(topic) {
    var flat = flattenDestinations(topic.destinations);

    if (!flat.length) {
      return '';
    }

    return (
      '<div class="project-nav__sticky" aria-label="' + e(topic.label) + ' sections on this page">' +
        '<ul class="project-nav__sticky-list">' +
          flat
            .map(function (destination) {
              return renderAnchor(destination, false);
            })
            .join('') +
        '</ul>' +
      '</div>'
    );
  }

  /* Mobile fixed bottom tab bar: one icon + topic.shortLabel button per Level 1 topic, replacing the
     old "Current topic ▾" toggle as the primary way to switch topics on mobile. Reuses the existing
     project-nav-step action — no new routing logic. */
  function renderBottomBar(model) {
    return (
      '<nav class="project-nav__bottombar-inner" aria-label="Project Navigator planning topics">' +
        model
          .map(function (topic) {
            return (
              '<button' +
                ' type="button"' +
                ' class="project-nav__bottombar-item' + (topic.current ? ' is-current' : '') + '"' +
                ' data-act="project-nav-step"' +
                ' data-project-nav-step="' + e(topic.step) + '"' +
                ' aria-current="' + (topic.current ? 'true' : 'false') + '"' +
                (topic.reachable ? '' : ' disabled aria-disabled="true"') +
              '>' +
                '<span class="project-nav__bottombar-icon" aria-hidden="true">' + topicIcon(topic.id, 20) + '</span>' +
                '<span class="project-nav__bottombar-label">' + e(topic.shortLabel || topic.label) + '</span>' +
              '</button>'
            );
          })
          .join('') +
      '</nav>'
    );
  }

  /* One row per topic inside the drawer's full site map. Unlike the old inline mobile tree, the
     current topic's destinations are always shown nested beneath it (not a separate expand/collapse
     toggle) — the drawer is already a dedicated, scrollable overlay, so there is no density reason to
     hide them. Non-current topics never have resolved destinations (core/navigation-model.js only
     resolves them for the current topic), so this falls out naturally with no extra branching. */
  function renderDrawerTopic(topic) {
    var destinations = Array.isArray(topic.destinations)
      ? topic.destinations
      : [];

    var trigger = topic.current
      ? (
          '<span class="project-nav__drawer-topic-trigger is-current" aria-current="true">' +
            '<span class="project-nav__drawer-topic-icon" aria-hidden="true">' + topicIcon(topic.id, 20) + '</span>' +
            '<span>' + e(topic.label) + '</span>' +
          '</span>'
        )
      : (
          '<button' +
            ' type="button"' +
            ' class="project-nav__drawer-topic-trigger"' +
            ' data-act="project-nav-step"' +
            ' data-project-nav-step="' + e(topic.step) + '"' +
            (topic.reachable ? '' : ' disabled aria-disabled="true"') +
          '>' +
            '<span class="project-nav__drawer-topic-icon" aria-hidden="true">' + topicIcon(topic.id, 20) + '</span>' +
            '<span>' + e(topic.label) + '</span>' +
            '<span class="project-nav__drawer-topic-state">' + e(stateLabel(topic)) + '</span>' +
          '</button>'
        );

    return (
      '<li class="project-nav__drawer-topic">' +
        trigger +
        (destinations.length
          ? (
              '<ul class="project-nav__destination-list">' +
                destinations
                  .map(function (destination) {
                    return renderDestination(destination, false);
                  })
                  .join('') +
              '</ul>'
            )
          : '') +
      '</li>'
    );
  }

  function renderDrawerContent(model) {
    return (
      '<div class="project-nav__drawer-head">' +
        '<h2 id="projectNavDrawerTitle">Project Navigator menu</h2>' +
        '<button type="button" class="iconbtn" data-act="project-nav-drawer-toggle" aria-label="Close navigation menu">&times;</button>' +
      '</div>' +
      '<ul class="project-nav__drawer-list">' +
        model
          .map(function (topic) {
            return renderDrawerTopic(topic);
          })
          .join('') +
      '</ul>'
    );
  }

  function renderNavigationMarkup(model) {
    model = Array.isArray(model) ? model : [];

    var currentTopic = model.filter(function (topic) {
      return topic.current;
    })[0];

    if (!currentTopic) {
      currentTopic = model[0] || {
        id: '',
        label: 'Project Navigator',
        purpose: '',
        destinations: []
      };
    }

    return (
      '<div class="project-nav" data-project-navigation>' +
        renderStickyDestinations(currentTopic) +
      '</div>'
    );
  }

  function updateLiveRegion(model) {
    var topic = root.document.getElementById('topic');
    var current = model.filter(function (item) {
      return item.current;
    })[0];

    if (!topic || !current) {
      return;
    }

    topic.textContent =
      'Current planning topic: ' +
      current.label +
      '. ' +
      current.purpose +
      '.';
  }

  function render(options) {
    options = options || {};

    var mount = options.mount || root.document.getElementById('stepper');

    if (!mount || !root.ProjectNavigationModel) {
      return false;
    }

    var model = currentModel();

    mount.innerHTML = renderNavigationMarkup(model);
    updateLiveRegion(model);
    observeSections();
    measureHeaderOffset();

    var bottomBar = root.document.getElementById('projectNavBottomBar');

    if (bottomBar) {
      bottomBar.innerHTML = renderBottomBar(model);
      bottomBar.hidden = false;
    }

    var drawer = root.document.getElementById('projectNavDrawer');

    if (drawer) {
      drawer.innerHTML = renderDrawerContent(model);
    }

    return true;
  }

  /* Hamburger drawer, at every screen width now. Mirrors core/advisor.js's pnOpen/pnClose shape
     (toggle an `open` class on the drawer + backdrop, lock body scroll) under new class names so it
     never collides with the advisor drawer's `.pn-drawer`/`.pn-backdrop`/`advisor-open`. Always
     closes on navigation (the conventional drawer behavior) — there is no pin concept here. */
  function isDrawerOpen() {
    return drawerOpen;
  }

  function openDrawer(trigger) {
    var drawer = root.document.getElementById('projectNavDrawer');
    var backdrop = root.document.getElementById('projectNavDrawerBackdrop');
    var toggle = root.document.getElementById('projectNavDrawerToggle');

    if (!drawer || !backdrop) {
      return;
    }

    drawerOpen = true;
    drawerReturnFocusElement = trigger || toggle || null;
    drawer.classList.add('open');
    backdrop.classList.add('open');
    root.document.body.classList.add('project-nav-drawer-open');

    if (toggle) {
      toggle.setAttribute('aria-expanded', 'true');
    }

    var firstFocusable = drawer.querySelector(
      'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );

    if (firstFocusable) {
      try {
        firstFocusable.focus();
      } catch (error) {
        /* Focus is best effort. */
      }
    }
  }

  function closeDrawer(options) {
    options = options || {};

    var drawer = root.document.getElementById('projectNavDrawer');
    var backdrop = root.document.getElementById('projectNavDrawerBackdrop');
    var toggle = root.document.getElementById('projectNavDrawerToggle');

    drawerOpen = false;

    if (drawer) {
      drawer.classList.remove('open');
    }

    if (backdrop) {
      backdrop.classList.remove('open');
    }

    root.document.body.classList.remove('project-nav-drawer-open');

    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
    }

    if (options.restoreFocus !== false) {
      var target = drawerReturnFocusElement || toggle;

      drawerReturnFocusElement = null;

      if (target) {
        try {
          target.focus();
        } catch (error) {
          /* Focus restoration is best effort. */
        }
      }
    } else {
      drawerReturnFocusElement = null;
    }
  }

  function toggleDrawer(trigger) {
    if (drawerOpen) {
      closeDrawer();
      return;
    }

    openDrawer(trigger);
  }

  /* Called from core/events.js's single global keydown handler (never a second listener — same
     pattern as the reset dialog / photo examples / advisor's own Tab-traps in that same handler).
     Returns true when it handled the key, so the caller knows not to also fall through to other
     handling for the same keystroke. */
  function handleDrawerKeydown(e) {
    if (!drawerOpen) {
      return false;
    }

    if (e.key === 'Escape') {
      closeDrawer();
      return true;
    }

    if (e.key === 'Tab') {
      var drawer = root.document.getElementById('projectNavDrawer');
      var focusable = drawer
        ? drawer.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')
        : [];

      if (!focusable.length) {
        e.preventDefault();
        if (drawer) drawer.focus();
        return true;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && root.document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && root.document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }

      return true;
    }

    return false;
  }

  /* Does not mutate S.step directly — delegates to the app's own canonical step-change function
     (state.js's navigateToStep), which already owns reachability checks, forward/back direction,
     and re-rendering. */
  function navigateStep(step) {
    if (
      typeof root.isStepReachable === 'function' &&
      !root.isStepReachable(step)
    ) {
      return;
    }

    if (drawerOpen) {
      closeDrawer({ restoreFocus: false });
    }

    if (typeof root.navigateToStep === 'function') {
      if (typeof root._pnRenderIntent !== 'undefined') root._pnRenderIntent = 'navigation';
      root.navigateToStep(step);
      return;
    }

    throw new Error(
      'Project navigation is missing the canonical step-change function (navigateToStep).'
    );
  }

  function targetForId(targetId) {
    return targetId
      ? root.document.getElementById(targetId)
      : null;
  }

  function focusTarget(target) {
    if (!target) {
      return;
    }

    var heading = target.matches('h1, h2, h3')
      ? target
      : target.querySelector('h1, h2, h3');

    var focusTargetElement = heading || target;

    if (!focusTargetElement.hasAttribute('tabindex')) {
      focusTargetElement.setAttribute('tabindex', '-1');
      focusTargetElement.setAttribute(
        'data-project-nav-temporary-tabindex',
        'true'
      );
    }

    try {
      focusTargetElement.focus({ preventScroll: true });
    } catch (error) {
      focusTargetElement.focus();
    }

    target.scrollIntoView({
      block: 'start',
      behavior: reducedMotion() ? 'auto' : 'smooth'
    });
  }

  function navigateAnchor(targetId) {
    var target = targetForId(targetId);

    if (!target) {
      return;
    }

    if (drawerOpen) {
      closeDrawer({ restoreFocus: false });
    }

    focusTarget(target);

    if (
      root.history &&
      typeof root.history.replaceState === 'function'
    ) {
      try {
        root.history.replaceState(
          root.history.state,
          '',
          '#' + targetId
        );
      } catch (error) {
        /* Hash update is optional. */
      }
    }
  }

  function setCurrentDestination(destinationId) {
    Array.prototype.forEach.call(
      root.document.querySelectorAll(
        '[data-project-nav-anchor]'
      ),
      function (link) {
        if (
          link.getAttribute('data-project-nav-anchor') ===
          destinationId
        ) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    );
  }

  function observeSections() {
    if (sectionObserver) {
      sectionObserver.disconnect();
      sectionObserver = null;
    }

    if (typeof root.IntersectionObserver !== 'function') {
      return;
    }

    var links = Array.prototype.slice.call(
      root.document.querySelectorAll(
        '[data-project-nav-anchor][data-project-nav-target]'
      )
    );

    var targets = links
      .map(function (link) {
        return {
          destinationId: link.getAttribute(
            'data-project-nav-anchor'
          ),
          target: targetForId(
            link.getAttribute('data-project-nav-target')
          )
        };
      })
      .filter(function (record) {
        return Boolean(record.target);
      });

    if (!targets.length) {
      return;
    }

    sectionObserver = new root.IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          });

        if (!visible.length) {
          return;
        }

        var targetId = visible[0].target.id;
        var record = targets.filter(function (item) {
          return item.target.id === targetId;
        })[0];

        if (record) {
          setCurrentDestination(record.destinationId);
        }
      },
      {
        root: null,
        rootMargin: '-25% 0px -60% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75]
      }
    );

    targets.forEach(function (record) {
      sectionObserver.observe(record.target);
    });
  }

  function initialize() {
    if (root.__projectNavigationInitialized) {
      render();
      return;
    }

    root.__projectNavigationInitialized = true;
    wireHeaderOffsetTracking();
    render();
  }

  root.ProjectNavigation = {
    initialize: initialize,
    render: render,
    isDrawerOpen: isDrawerOpen,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    toggleDrawer: toggleDrawer,
    handleDrawerKeydown: handleDrawerKeydown,
    navigateStep: navigateStep,
    navigateAnchor: navigateAnchor,
    setCurrentDestination: setCurrentDestination
  };
})(typeof window !== 'undefined' ? window : this);
