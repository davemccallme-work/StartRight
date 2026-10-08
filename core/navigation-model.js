/* V45.8.0 two-level navigation: one authoritative navigation model (data + pure view selector),
   rendered into both the desktop mega-menu panel and the mobile drawer/accordion by
   components/project-navigation.js.

   Every anchor selector below was confirmed against the actual rendered markup, not guessed:
     - "review" (step 2) destinations reuse the exact ids screens/screen-understanding.js's own
       UNDERSTANDING_SECTION_ITEMS already exposes via its in-page "On this page" nav.
     - "prepare" (step 3) uses the one real heading id in screens/screen-decisions.js that isn't
       simply the page's own h1 (which the Level 1 topic button already navigates to).
     - "guidance" (step 4) destinations use the real section ids from screens/screen-summary.js
       (s-next-h, s-project-h, s-known-h, s-interp-h, s-confirm-h, s-may-h, cost-timeline-answer-h,
       cost-uncertainty-h, timing-owner-heading, s-whatnext-h, living-guide-heading, where-fits-h,
       preparation-end-h). s-interp-h only renders when I.projectLabel is set — resolveDestination's
       firstRenderedTarget check correctly drops it as unavailable on renders where it's absent,
       rather than requiring a second code path.
     - "project" (step 0) has no in-page sections to point to — a one-question screen — so it
       intentionally has zero Level 2 destinations.
     - "details" (step 1) is mostly a sequential question flow with nothing to jump to, EXCEPT during
       the Fast Facts results sub-phase (components/fast-facts-workspace.js), whose sections vary by
       project type and are not enumerable as a fixed list. Rather than hand-maintain a second,
       drift-prone copy of that structure (the same mistake found in components/guidance-workspace.js,
       which referenced two heading ids — #prototype-end-h, #s-timing-h — that have never existed in
       screens/screen-summary.js), discoverFastFactsDestinations() below reads the real rendered
       `.ff-section`/`.insight-section` elements directly, so it can never list a link to a section
       that isn't actually on the page. */
(function (root) {
  'use strict';

  var TOPICS = [
    {
      id: 'project',
      step: 0,
      label: 'Your project',
      shortLabel: 'Your project',
      purpose: 'Choose the project that best matches your plans',
      destinations: []
    },
    {
      id: 'details',
      step: 1,
      label: 'Project details',
      shortLabel: 'Details',
      purpose: 'Add the property, service, panel, and load details that shape the guidance',
      destinations: []
    },
    {
      id: 'review',
      step: 2,
      label: 'Review & confirm',
      shortLabel: 'Review',
      purpose: 'Review interpretations and anything that remains uncertain',
      destinations: [
        {id: 'recommended-action', label: 'Next action', type: 'anchor', selectors: ['#recommended-action']},
        {id: 'you-told-us', label: 'You told us', type: 'anchor', selectors: ['#u-known-h']},
        {id: 'needs-confirmation', label: 'Needs confirmation', type: 'anchor', selectors: ['#u-confirm-h']},
        {id: 'may-be-needed', label: 'May be needed', type: 'anchor', selectors: ['#u-may-h']},
        {id: 'timing', label: 'Timing', type: 'anchor', selectors: ['#u-timing-h']},
        {id: 'questions', label: 'Questions', type: 'anchor', selectors: ['#u-ask-h']}
      ]
    },
    {
      id: 'prepare',
      step: 3,
      label: 'Prepare to begin',
      shortLabel: 'Prepare',
      purpose: 'Organize questions and information before contacting the right people',
      destinations: [
        {id: 'conversation-topics', label: 'Your conversation topics', type: 'anchor', selectors: ['#conversation-topics-heading']}
      ]
    },
    {
      id: 'guidance',
      step: 4,
      label: 'Your guidance',
      shortLabel: 'Guidance',
      purpose: 'Use your personalized preparation guide and recommended next action',
      destinations: [
        {id: 'guidance-next-action', label: 'Recommended next action', type: 'anchor', selectors: ['#s-next-h']},
        {
          id: 'project-and-answers',
          label: 'Your project and answers',
          type: 'group',
          children: [
            {id: 'your-project', label: 'Your project', type: 'anchor', selectors: ['#s-project-h']},
            {id: 'guidance-you-told-us', label: 'You told us', type: 'anchor', selectors: ['#s-known-h']},
            {id: 'our-interpretation', label: 'Our interpretation', type: 'anchor', selectors: ['#s-interp-h']}
          ]
        },
        {id: 'guidance-needs-confirmation', label: 'Needs confirmation', type: 'anchor', selectors: ['#s-confirm-h']},
        {id: 'what-may-be-needed', label: 'May be needed', type: 'anchor', selectors: ['#s-may-h']},
        {id: 'pge-involvement', label: 'PG&E involvement', type: 'anchor', selectors: ['#s-utility-h']},
        {id: 'what-happens-next', label: 'What happens next', type: 'anchor', selectors: ['#s-whatnext-h']},
        {
          id: 'cost-and-timeline',
          label: 'Cost and timeline',
          type: 'group',
          children: [
            {id: 'cost-timeline-details', label: 'Cost and timeline details', type: 'anchor', selectors: ['#cost-timeline-answer-h']},
            {id: 'why-projects-vary', label: 'Why similar projects can vary', type: 'anchor', selectors: ['#cost-uncertainty-h']},
            {id: 'panel-cost-evidence', label: 'What PG&E-regulated evidence shows', type: 'anchor', selectors: ['#cost-tier1-h']}
          ]
        },
        {id: 'who-may-be-involved', label: 'Who may be involved', type: 'anchor', selectors: ['#timing-owner-heading']},
        {id: 'living-preparation-plan', label: 'Your living preparation plan', type: 'anchor', selectors: ['#living-guide-heading']},
        {id: 'decision-impact', label: 'How your answers may shape what to prepare', type: 'anchor', selectors: ['#decision-impact-h']},
        {id: 'where-navigator-fits', label: 'Where Project Navigator fits', type: 'anchor', selectors: ['#where-fits-h']},
        {id: 'before-you-apply', label: 'Finish your recommended next action first', type: 'anchor', selectors: ['#s-beforeyouapply-h']},
        {id: 'guide-end', label: 'Finish', type: 'anchor', selectors: ['#preparation-end-h']}
      ]
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function topicForStep(step) {
    for (var i = 0; i < TOPICS.length; i += 1) {
      if (TOPICS[i].step === step) {
        return TOPICS[i];
      }
    }

    return TOPICS[0];
  }

  function topicById(id) {
    for (var i = 0; i < TOPICS.length; i += 1) {
      if (TOPICS[i].id === id) {
        return TOPICS[i];
      }
    }

    return null;
  }

  function firstRenderedTarget(selectors, documentRoot) {
    var doc = documentRoot || root.document;

    if (!doc || !Array.isArray(selectors)) {
      return null;
    }

    for (var i = 0; i < selectors.length; i += 1) {
      try {
        var match = doc.querySelector(selectors[i]);

        if (match) {
          return match;
        }
      } catch (error) {
        /* A selector was invalid in this environment. Continue safely. */
      }
    }

    return null;
  }

  function resolveDestination(destination, context) {
    var item = clone(destination);
    var doc = context.documentRoot || root.document;

    if (item.type === 'screen') {
      item.available =
        typeof context.isStepReachable === 'function'
          ? context.isStepReachable(item.step)
          : item.step === context.currentStep;

      item.current = item.step === context.currentStep;
      return item;
    }

    if (item.type === 'anchor') {
      var target = firstRenderedTarget(item.selectors, doc);

      item.available = Boolean(target && target.id);
      item.targetId = target && target.id ? target.id : '';
      return item;
    }

    if (item.type === 'group') {
      item.children = (item.children || [])
        .map(function (child) {
          return resolveDestination(child, context);
        })
        .filter(function (child) {
          return child.available;
        });

      item.available = item.children.length > 0;
      return item;
    }

    item.available = false;
    return item;
  }

  /* Reads the Fast Facts results sub-phase's own rendered outline directly from the DOM (real
     content, not a maintained copy), scoped to .ff-section elements inside the Fast Facts workspace.
     Returns [] whenever those elements aren't present (no results sub-phase rendered this frame, or
     this environment's documentRoot stub doesn't support querySelectorAll) — same "fail closed, no
     broken layout" posture as the rest of this feature and of components/fast-facts-workspace.js.

     Skips any section core/v45.7.5.9.4-scenario-guide-runtime.js's suppressInlineGuide() has marked
     `hidden` (the inline "Scenario guide" section is deliberately suppressed there — its content is
     already reachable via the separate launcher/drawer) — a hidden section is, for navigation
     purposes, exactly as "not in the current rendered DOM" as a missing id, so it must be filtered
     out the same way firstRenderedTarget() already filters out an absent one. */
  function discoverFastFactsDestinations(documentRoot) {
    var doc = documentRoot || root.document;

    if (!doc || typeof doc.querySelectorAll !== 'function') {
      return [];
    }

    var out = [];
    var recommended = typeof doc.getElementById === 'function' ? doc.getElementById('insight-next') : null;

    if (recommended && !recommended.hidden) {
      out.push({id: 'ff-recommended', label: 'Recommended next action', type: 'anchor', available: true, targetId: 'insight-next'});
    }

    var sections = doc.querySelectorAll('.ff-section[id]');

    Array.prototype.forEach.call(sections, function (section) {
      if (section.hidden) {
        return;
      }

      var titleEl = section.querySelector('.ff-section__title');
      var label = titleEl ? String(titleEl.textContent || '').trim() : '';

      if (!label) {
        return;
      }

      var childEls = section.querySelectorAll('.insight-section[id]');
      var children = [];

      Array.prototype.forEach.call(childEls, function (child) {
        var childTitleEl = child.querySelector('.insight-section__title');
        var childLabel = childTitleEl ? String(childTitleEl.textContent || '').trim() : '';

        if (childLabel && child.id) {
          children.push({id: section.id + '__' + child.id, label: childLabel, type: 'anchor', available: true, targetId: child.id});
        }
      });

      if (children.length > 1) {
        out.push({id: section.id, label: label, type: 'group', available: true, children: children});
      } else {
        out.push({id: section.id, label: label, type: 'anchor', available: true, targetId: section.id});
      }
    });

    return out;
  }

  /* screens/screen-summary.js's step4() also renders a variable number of dynamic insight cards
     (components/explainable-insight-card.js's .insight-region sections, each with its own id'd h2,
     plus data/progressive-insights.js's "Illustrations based on your answers") whose count and
     content depend on project type and answers — not enumerable as a fixed list, the same reason
     discoverFastFactsDestinations() above reads the real rendered details-step sections instead of
     hand-maintaining a copy of them. core/v45.8.7-summary-accordions.js turns each of these into its
     own accordion at render time; this reads the same live elements so the mega-menu destination
     list always matches what actually exists on the page. */
  function discoverGuidanceInsightDestinations(documentRoot) {
    var doc = documentRoot || root.document;

    if (!doc || typeof doc.querySelectorAll !== 'function') {
      return [];
    }

    var out = [];
    var seenTargets = {};
    /* core/v45.8.7-summary-accordions.js runs on the same pnAfterRender completion point this
       discovery does, and may already have turned a region into a <details class="summary-accordion">
       by the time this runs (buildAccordion() moves the original heading's id onto that <details> and
       discards the heading element itself, since its text becomes the accordion's own summary title).
       Reading .textContent off whichever element now owns the id is only safe pre-transform (a bare
       heading) — post-transform it would return the <details>'s ENTIRE panel content concatenated
       with the title (confirmed live: "Illustrations based on your answersThese show possibilities to
       discuss..."). This resolves the label correctly in either state instead of assuming one. */
    function labelFor(el) {
      if (!el) return '';
      if (el.classList && el.classList.contains('summary-accordion')) {
        var title = el.querySelector(':scope > summary .summary-accordion__title');
        return title ? String(title.textContent || '').trim() : '';
      }
      return String(el.textContent || '').trim();
    }
    /* 2026-10-05: components/explainable-insight-card.js's region() never puts an id on the
       .insight-region <section> itself, only on the nested <h2> — the [id] requirement here matched
       nothing, so these destinations silently never appeared in the mega menu even when
       core/v45.8.7-summary-accordions.js had real content to point at. Covers the pre-transform
       shape; the post-transform shape (region already replaced by <details>) is covered below. */
    var regions = doc.querySelectorAll('.insight-region');

    Array.prototype.forEach.call(regions, function (region) {
      var heading = region.querySelector('.insight-region__heading h2[id]');
      var label = heading ? labelFor(heading) : '';

      if (!label || !heading.id || seenTargets[heading.id]) {
        return;
      }

      seenTargets[heading.id] = true;
      out.push({id: 'guidance-insight-' + heading.id, label: label, type: 'anchor', available: true, targetId: heading.id});
    });

    /* Post-transform: the region's own heading id ('insight-region-<regionId>', see region() above)
       now lives on the <details> that replaced it. */
    var transformed = doc.querySelectorAll('.summary-accordion[id^="insight-region-"]');

    Array.prototype.forEach.call(transformed, function (details) {
      var label = labelFor(details);

      if (!label || !details.id || seenTargets[details.id]) {
        return;
      }

      seenTargets[details.id] = true;
      out.push({id: 'guidance-insight-' + details.id, label: label, type: 'anchor', available: true, targetId: details.id});
    });

    var illustrations = typeof doc.getElementById === 'function' ? doc.getElementById('s-illustrations-h') : null;

    if (illustrations && !seenTargets['s-illustrations-h']) {
      var illustrationsLabel = labelFor(illustrations) || 'Illustrations based on your answers';
      out.push({id: 'guidance-illustrations', label: illustrationsLabel, type: 'anchor', available: true, targetId: 's-illustrations-h'});
    }

    return out;
  }

  /* The dynamic insight cards render, in step4(), between "Who may be involved" and "Your living
     preparation plan" — this inserts the discovered destinations at that same point so the
     mega-menu's order matches the page's actual reading order, rather than always trailing at the
     end regardless of where the content they point to actually sits. */
  function insertGuidanceInsightDestinations(resolved, discovered) {
    if (!discovered.length) {
      return resolved;
    }

    var insertAt = resolved.length;

    for (var i = 0; i < resolved.length; i++) {
      if (resolved[i].id === 'who-may-be-involved') {
        insertAt = i + 1;
        break;
      }
    }

    return resolved.slice(0, insertAt).concat(discovered, resolved.slice(insertAt));
  }

  function resolveStaticDestinations(topic, currentStep, context) {
    return (topic.destinations || [])
      .map(function (destination) {
        return resolveDestination(destination, {
          currentStep: currentStep,
          documentRoot: context.documentRoot,
          isStepReachable: context.isStepReachable
        });
      })
      .filter(function (destination) {
        return destination.available;
      });
  }

  /* Pure selector. Never mutates S, never persists currentTopic/open-menu/active-anchor state or
     derived labels (NOW/REVIEW/LATER) — all of that stays transient UI state owned by
     components/project-navigation.js. An unreachable topic always resolves to zero destinations, so
     an incompatible ADU/Panel destination cannot appear as available after a project-type change or
     a corrected answer. */
  function view(context) {
    context = context || {};

    var currentStep =
      typeof context.currentStep === 'number'
        ? context.currentStep
        : 0;

    return TOPICS.map(function (sourceTopic) {
      var topic = clone(sourceTopic);

      topic.current = topic.step === currentStep;
      topic.reachable =
        typeof context.isStepReachable === 'function'
          ? context.isStepReachable(topic.step)
          : topic.current;

      topic.destinations = topic.current
        ? (topic.id === 'details'
            ? discoverFastFactsDestinations(context.documentRoot)
            : topic.id === 'guidance'
            ? insertGuidanceInsightDestinations(
                resolveStaticDestinations(topic, currentStep, context),
                discoverGuidanceInsightDestinations(context.documentRoot)
              )
            : resolveStaticDestinations(topic, currentStep, context))
        : [];

      return topic;
    });
  }

  root.ProjectNavigationModel = {
    topics: function () {
      return clone(TOPICS);
    },
    topicForStep: topicForStep,
    topicById: topicById,
    firstRenderedTarget: firstRenderedTarget,
    resolveDestination: resolveDestination,
    discoverFastFactsDestinations: discoverFastFactsDestinations,
    discoverGuidanceInsightDestinations: discoverGuidanceInsightDestinations,
    view: view
  };
})(typeof window !== 'undefined' ? window : this);
