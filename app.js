(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 2,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    searchQuery: "",
    viewMode: "kit",
    tour: { active: false, stepIndex: 0 },
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    modal: null,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();

  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list) =>
    list
      .map(([v, t]) => '<option value="' + esc(v) + '">' + esc(t) + "</option>")
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    sub +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";

  function showToast(msg, type = "normal") {
    const hub = q("[data-toasts]");
    if (!hub) return;
    const toast = document.createElement("div");
    toast.className = "toast-item " + (type === "good" ? "good" : "");
    toast.innerHTML =
      (type === "good"
        ? '<svg class="store-icon" width="16" height="16"><use href="#icon-check"></use></svg>'
        : "") +
      "<span>" +
      esc(msg) +
      "</span>";
    hub.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  const tourSteps = [
    {
      step: 1,
      title: "1. The Counter Rush (Friday · 3:45 pm)",
      highlightSelector: ".kit-issue-box",
      text: "Kabir Sen arrives at the desk to collect the Film Society's screening kit for a courtyard film starting in 15 minutes (at 4:00 pm). Request RQ-214 requires 3 items: an HDMI projector, portable speaker, and USB-C adapter.",
      setup: () => {
        s.phase = 0;
        s.tab = "Requests";
        s.selected = "RQ-214";
        s.loans = [
          {
            num: 401,
            req: "RQ-209",
            asset: "MI-09",
            who: "Tara Shah",
            due: "Sat 10 am",
            back: false,
          },
        ];
        s.notice = "Tour: Opened RQ-214 to review approved screening equipment.";
      },
    },
    {
      step: 2,
      title: "2. 1-Click Approved Kit Checkout",
      highlightSelector: ".kit-card",
      text: "Instead of filling out 3 separate forms with 12 dropdowns, staff uses our 1-click kit checkout: available shelf units (PR-04, SP-02, AD-12) are auto-matched, and Kabir Sen is set as the collector. Slips L-402, L-403, and L-404 are issued together in under 20 seconds.",
      setup: () => {
        s.phase = 0;
        s.tab = "Loan register";
        s.selected = "";
        s.loans = [
          {
            num: 401,
            req: "RQ-209",
            asset: "MI-09",
            who: "Tara Shah",
            due: "Sat 10 am",
            back: false,
          },
          {
            num: 402,
            req: "RQ-214",
            asset: "PR-04",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: false,
          },
          {
            num: 403,
            req: "RQ-214",
            asset: "SP-02",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: false,
          },
          {
            num: 404,
            req: "RQ-214",
            asset: "AD-12",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: false,
          },
        ];
        s.notice = "Tour: Complete screening kit issued on slips L-402, L-403, L-404.";
      },
    },
    {
      step: 3,
      title: "3. Partial Return (Friday · 7:30 pm)",
      highlightSelector: ".kit-progress-track",
      text: "Kabir brings back the projector and speaker, but explains: “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Staff clicks 'Record return' on the projector and speaker. The kit progress updates to 2/3 returned (67%).",
      setup: () => {
        s.phase = 1;
        s.tab = "Loan register";
        s.selected = "";
        s.loans = [
          {
            num: 401,
            req: "RQ-209",
            asset: "MI-09",
            who: "Tara Shah",
            due: "Sat 10 am",
            back: false,
          },
          {
            num: 402,
            req: "RQ-214",
            asset: "PR-04",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: true,
          },
          {
            num: 403,
            req: "RQ-214",
            asset: "SP-02",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: true,
          },
          {
            num: 404,
            req: "RQ-214",
            asset: "AD-12",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: false,
          },
        ];
        s.notice =
          "Tour: Projector and speaker returned. Adapter AD-12 remains outstanding.";
      },
    },
    {
      step: 4,
      title: "4. Custody Handover & Deadline Extension",
      highlightSelector: ".kit-subrow:not(.returned)",
      text: "In the original app, slip L-404 would be left in Kabir's name with an expired due time. With our Handover Modal, staff transfers custody to Leela Das, extends the return deadline to Saturday 9:00 am, and attaches Kabir's note directly to the active slip.",
      setup: () => {
        s.phase = 1;
        s.tab = "Loan register";
        s.selected = "";
        s.loans = [
          {
            num: 401,
            req: "RQ-209",
            asset: "MI-09",
            who: "Tara Shah",
            due: "Sat 10 am",
            back: false,
          },
          {
            num: 402,
            req: "RQ-214",
            asset: "PR-04",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: true,
          },
          {
            num: 403,
            req: "RQ-214",
            asset: "SP-02",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: true,
          },
          {
            num: 404,
            req: "RQ-214",
            asset: "AD-12",
            who: "Leela Das",
            transferredFrom: "Kabir Sen",
            due: "Sat 9 am",
            handoverNote:
              "Kabir returned projector & speaker; Leela kept adapter for morning drop-off",
            back: false,
          },
        ];
        s.notes = [
          {
            phase: 1,
            text: "Handover for L-404 (AD-12): Custody transferred to Leela Das, due Sat 9 am. Kabir returned projector & speaker; Leela kept adapter for morning drop-off",
          },
        ];
        s.notice =
          "Tour: Custody transferred to Leela Das with extended deadline Sat 9 am.";
      },
    },
    {
      step: 5,
      title: "5. Morning Shift Takeover (Saturday · 9:00 am)",
      highlightSelector: ".briefing-banner",
      text: "A new clerk takes over the desk Saturday morning. The prominent Morning Shift Handover Briefing banner immediately alerts staff that Leela Das is arriving with adapter AD-12. No searching through old notebooks required.",
      setup: () => {
        s.phase = 2;
        s.tab = "Loan register";
        s.selected = "";
        s.loans = [
          {
            num: 401,
            req: "RQ-209",
            asset: "MI-09",
            who: "Tara Shah",
            due: "Sat 10 am",
            back: false,
          },
          {
            num: 402,
            req: "RQ-214",
            asset: "PR-04",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: true,
          },
          {
            num: 403,
            req: "RQ-214",
            asset: "SP-02",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: true,
          },
          {
            num: 404,
            req: "RQ-214",
            asset: "AD-12",
            who: "Leela Das",
            transferredFrom: "Kabir Sen",
            due: "Sat 9 am",
            handoverNote:
              "Kabir returned projector & speaker; Leela kept adapter for morning drop-off",
            back: false,
          },
        ];
        s.notice =
          "Tour: Saturday morning handover alert active. Leela is at the counter.";
      },
    },
    {
      step: 6,
      title: "6. Final Return & 100% Kit Completion",
      highlightSelector: ".kit-card",
      text: "Leela hands over the adapter. The clerk clicks 'Record return' directly on Leela's slip. Slip L-404 closes, AD-12 is restocked to Bin C4, and the Film Society screening kit hits 100% complete!",
      setup: () => {
        s.phase = 2;
        s.tab = "Loan register";
        s.selected = "";
        s.loans = [
          {
            num: 401,
            req: "RQ-209",
            asset: "MI-09",
            who: "Tara Shah",
            due: "Sat 10 am",
            back: false,
          },
          {
            num: 402,
            req: "RQ-214",
            asset: "PR-04",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: true,
          },
          {
            num: 403,
            req: "RQ-214",
            asset: "SP-02",
            who: "Kabir Sen",
            due: "Fri 8 pm",
            back: true,
          },
          {
            num: 404,
            req: "RQ-214",
            asset: "AD-12",
            who: "Leela Das",
            transferredFrom: "Kabir Sen",
            due: "Sat 9 am",
            handoverNote:
              "Kabir returned projector & speaker; Leela kept adapter for morning drop-off",
            back: true,
          },
        ];
        s.notice = "Tour: All items returned! Film Society kit is 100% complete.";
      },
    },
  ];

  function renderTourDock() {
    const dock = q("[data-tour-dock]");
    if (!dock) return;
    if (!s.tour || !s.tour.active) {
      dock.hidden = true;
      dock.innerHTML = "";
      return;
    }
    const cur = tourSteps[s.tour.stepIndex];
    dock.hidden = false;
    dock.innerHTML =
      '<div class="tour-dock">' +
      '<div class="tour-header">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
      '<span class="tour-step-tag">Step ' +
      cur.step +
      " of " +
      tourSteps.length +
      "</span>" +
      "<strong>" +
      esc(cur.title) +
      "</strong>" +
      "</div>" +
      '<button type="button" data-action="exit-tour" style="cursor:pointer;">&times; Exit Walkthrough</button>' +
      "</div>" +
      '<div class="tour-body"><p>' +
      esc(cur.text) +
      "</p></div>" +
      '<div class="tour-footer">' +
      '<button type="button" data-action="prev-tour"' +
      (s.tour.stepIndex === 0
        ? ' disabled style="opacity:0.4;cursor:not-allowed;"'
        : "") +
      ">&larr; Previous Step</button>" +
      '<div style="display:flex;gap:6px;align-items:center;">' +
      tourSteps
        .map(
          (_, i) =>
            '<span style="width:8px;height:8px;border-radius:50%;background:' +
            (i === s.tour.stepIndex ? "var(--mark)" : "rgba(255,255,255,0.3)") +
            ';display:inline-block;"></span>',
        )
        .join("") +
      "</div>" +
      '<button type="button" data-action="next-tour" class="tour-primary">' +
      (s.tour.stepIndex === tourSteps.length - 1
        ? "Finish Walkthrough"
        : "Next Step &rarr;") +
      "</button>" +
      "</div></div>";
  }

  function applyTourHighlight() {
    document.querySelectorAll(".tour-highlight").forEach((el) => {
      el.classList.remove("tour-highlight");
    });
    if (!s.tour || !s.tour.active) return;
    const cur = tourSteps[s.tour.stepIndex];
    if (!cur || !cur.highlightSelector) return;
    setTimeout(() => {
      const el = q(cur.highlightSelector);
      if (el) {
        el.classList.add("tour-highlight");
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 50);
  }

  function renderShiftStepper() {
    const stepper = q("[data-stepper]");
    if (!stepper) return;
    const steps = [
      { name: "1. Pickup", time: "Fri 3:45 pm" },
      { name: "2. Return & Handover", time: "Fri 7:30 pm" },
      { name: "3. Morning Takeover", time: "Sat 9:00 am" },
    ];
    stepper.innerHTML = steps
      .map((st, i) => {
        const isDone = s.phase > i;
        const isActive = s.phase === i;
        return (
          '<span class="step-pill' +
          (isActive ? " active" : "") +
          (isDone ? " done" : "") +
          '">' +
          (isDone
            ? '<svg class="store-icon" width="12" height="12"><use href="#icon-check"></use></svg>'
            : "") +
          st.name +
          "</span>"
        );
      })
      .join("");
  }

  function renderBriefingBanner() {
    const banner = q("[data-briefing-banner]");
    if (!banner) return;
    if (s.phase === 2) {
      const pending = s.loans.find((l) => !l.back && l.transferredFrom);
      if (pending) {
        banner.innerHTML =
          '<div class="briefing-banner"><div><strong><svg class="store-icon" width="16" height="16"><use href="#icon-alert-triangle"></use></svg>Shift Handover Briefing</strong> <span>' +
          esc(pending.who) +
          " is returning " +
          esc(pending.asset) +
          " (" +
          esc(getAsset(pending.asset)?.type) +
          ") at 9:00 am. Note from Kabir: “" +
          esc(pending.handoverNote || "") +
          "”.</span></div>" +
          '<button type="button" data-action="tab" data-val="Loan register" class="primary" style="padding:4px 8px;font-size:12px;">View in Loan Register</button></div>';
        return;
      }
    }
    banner.innerHTML = "";
  }

  function renderModal() {
    const modalEl = q("[data-modal]");
    if (!modalEl) return;
    if (!s.modal) {
      modalEl.hidden = true;
      modalEl.innerHTML = "";
      return;
    }
    if (s.modal.type === "handover") {
      const l = s.loans.find((x) => x.num === s.modal.slipNum);
      if (!l || l.back) {
        s.modal = null;
        modalEl.hidden = true;
        return;
      }
      const unit = getAsset(l.asset);
      modalEl.hidden = false;
      modalEl.innerHTML =
        '<div class="modal-card"><div class="modal-header"><div><h3>Handover &amp; Custody Transfer</h3><small>Slip L-' +
        l.num +
        " · " +
        esc(l.asset) +
        " (" +
        esc(unit?.type || "") +
        ")</small></div><button type=\"button\" data-action=\"close-modal\" style=\"border:none;background:transparent;cursor:pointer;font-size:20px;color:var(--quiet);line-height:1;\">&times;</button></div>" +
        '<p style="margin-bottom:12px;font-size:13px;color:var(--quiet);">Currently held by <b>' +
        esc(l.who) +
        "</b> under request <b>" +
        esc(l.req) +
        "</b>. Reassign custodian and extend the return deadline for incoming shift.</p>" +
        '<form data-handover="' +
        l.num +
        '"><div class="form"><label><span>Transfer custody to</span><select name="handover_who" required>' +
        opts(people.map((p) => [p, p])) +
        '</select></label><label><span>Agreed return time</span><select name="handover_due" required>' +
        opts(
          ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"].map((d) => [d, d]),
        ) +
        '</select></label><label class="full"><span>Shift handover instructions</span><textarea name="handover_note" rows="2" placeholder="e.g. Kabir returned projector &amp; speaker; Leela kept adapter for morning drop-off" required>' +
        esc(l.handoverNote || "") +
        '</textarea></label></div><div class="buttons" style="justify-content:flex-end;margin-top:14px;"><button type="button" data-action="close-modal">Cancel</button><button type="submit" class="primary">Confirm Handover</button></div></form></div>';
    }
  }

  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      const activeLoans = s.loans.filter((l) => l.req === r.id && !l.back);
      const issuedTypes = activeLoans.map((l) => getAsset(l.asset).type);
      const remainingItems = r.items.filter((x) => !issuedTypes.includes(x));
      const available = assets.filter((a) => !a.repair && !out(a.id));

      let kitSection = "";
      if (remainingItems.length > 0) {
        kitSection =
          '<div class="kit-issue-box"><h4>Issue approved kit</h4>' +
          '<p><small>Assign available units and issue remaining slips together (' +
          remainingItems.length +
          ' items).</small></p><form data-issue-kit><input type="hidden" name="req" value="' +
          esc(r.id) +
          '" /><div class="kit-items-list">' +
          remainingItems
            .map((itemType, idx) => {
              const matches = available.filter((a) => a.type === itemType);
              return (
                '<div class="kit-item-row"><span><strong>' +
                esc(itemType) +
                "</strong></span>" +
                (matches.length
                  ? '<select name="asset_' +
                    idx +
                    '" required><option value="">Select unit…</option>' +
                    matches
                      .map(
                        (a) =>
                          '<option value="' +
                          esc(a.id) +
                          '"' +
                          (matches[0].id === a.id ? " selected" : "") +
                          ">" +
                          esc(a.id) +
                          " · " +
                          esc(a.model) +
                          " (Bin " +
                          esc(a.bin) +
                          ")</option>",
                      )
                      .join("") +
                    "</select>"
                  : '<span class="tag">No shelf units available</span>') +
                "</div>"
              );
            })
            .join("") +
          '</div><div class="form"><label><span>Collected by</span><select name="who" required><option value="">Select collector…</option>' +
          opts(people.map((p) => [p, p])) +
          '</select></label><label><span>Return by</span><select name="due" required>' +
          opts(
            ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"].map((d) => [d, d]),
          ) +
          '</select></label></div><button type="submit" class="primary">Issue complete kit</button></form></div>';
      } else {
        kitSection =
          '<div class="record"><span class="tag good">All approved equipment issued</span><p><small>Active slips: ' +
          activeLoans
            .map((l) => "L-" + l.num + " (" + l.asset + " to " + l.who + ")")
            .join(", ") +
          "</small></p></div>";
      }

      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p></div>" +
        kitSection;
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club,
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }

  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const status = a.repair
        ? "In repair"
        : out(a.id)
          ? "On loan"
          : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · Bin " + a.bin,
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }

  function renderSlipSubRow(l) {
    const unit = getAsset(l.asset);
    const unitType = unit ? unit.type : "";
    let whoDisplay = esc(l.who);
    if (l.transferredFrom) {
      whoDisplay =
        esc(l.who) + " (transferred from " + esc(l.transferredFrom) + ")";
    }
    let subText = "Held by " + whoDisplay + " · Due " + esc(l.due);
    if (l.handoverNote) {
      subText +=
        '<br /><span class="handover-memo">Handover: ' +
        esc(l.handoverNote) +
        "</span>";
    }
    const actions = l.back
      ? badge("Returned", true)
      : '<div class="btn-group">' +
        btn("Record return", "return", String(l.num), "good") +
        btn("Handover / Extend", "open-handover", String(l.num)) +
        "</div>";

    return (
      '<div class="kit-subrow' +
      (l.back ? " returned" : "") +
      '"><div><strong>L-' +
      l.num +
      " · " +
      esc(l.asset) +
      (unitType ? " (" + esc(unitType) + ")" : "") +
      '</strong><small style="display:block;margin-top:2px;">' +
      subText +
      "</small></div><div>" +
      actions +
      "</div></div>"
    );
  }

  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit · Grouped by kit lifecycle",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );

    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const select = (label, key, options) =>
        "<label><span>" +
        label +
        '</span><select name="' +
        key +
        '" required><option value="">Select…</option>' +
        opts(options) +
        "</select></label>";
      return (
        html +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"].map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }

    // Search bar
    html +=
      '<div class="search-box"><svg class="store-icon"><use href="#icon-search"></use></svg>' +
      '<input type="search" placeholder="Search loans by student, event, or asset ID…" data-search-loans value="' +
      esc(s.searchQuery) +
      '" /></div>';

    // Toolbar with Scope and View Mode
    html +=
      '<div class="buttons" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
      "<div>" +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>" +
      '<div class="view-toggles">' +
      '<button type="button" data-action="view-mode" data-val="kit" aria-pressed="' +
      (s.viewMode === "kit") +
      '">Grouped by Kit</button>' +
      '<button type="button" data-action="view-mode" data-val="flat" aria-pressed="' +
      (s.viewMode === "flat") +
      '">Individual Slips</button>' +
      "</div>" +
      "</div>";

    let shown = s.loans.filter((l) => !s.onlyOpen || !l.back);
    if (s.searchQuery) {
      const qLower = s.searchQuery.toLowerCase();
      shown = shown.filter((l) => {
        const asset = getAsset(l.asset);
        const r = getReq(l.req);
        return (
          l.asset.toLowerCase().includes(qLower) ||
          l.who.toLowerCase().includes(qLower) ||
          l.req.toLowerCase().includes(qLower) ||
          (l.transferredFrom &&
            l.transferredFrom.toLowerCase().includes(qLower)) ||
          (asset && asset.type.toLowerCase().includes(qLower)) ||
          (r && r.event.toLowerCase().includes(qLower)) ||
          (r && r.club.toLowerCase().includes(qLower))
        );
      });
    }

    if (!shown.length) {
      html += "<p>No matching slips found.</p>";
      return html;
    }

    if (s.viewMode === "kit") {
      // Group by request
      const reqIds = [...new Set(shown.map((l) => l.req))];
      for (const reqId of reqIds) {
        const r = getReq(reqId);
        const groupLoans = shown.filter((l) => l.req === reqId).slice().reverse();
        const allReqLoans = s.loans.filter((l) => l.req === reqId);
        const returnedCount = allReqLoans.filter((l) => l.back).length;
        const totalCount = allReqLoans.length;
        const pct =
          totalCount > 0 ? Math.round((returnedCount / totalCount) * 100) : 0;

        html +=
          '<div class="kit-card">' +
          '<div class="kit-header">' +
          '<div class="kit-title"><strong>' +
          esc(r ? r.event : reqId) +
          ' · <span class="muted">' +
          esc(r ? r.club : "") +
          " (" +
          esc(reqId) +
          ")</span></strong>" +
          "<small>Return due: " +
          esc(r ? r.due : "Flexible") +
          " · Approved to " +
          esc(r ? r.owner : "") +
          "</small></div>" +
          '<div><span class="tag' +
          (pct === 100 ? " good" : "") +
          '">' +
          returnedCount +
          "/" +
          totalCount +
          " items returned (" +
          pct +
          "%)</span></div>" +
          "</div>" +
          '<div class="kit-progress-track"><div class="kit-progress-fill' +
          (pct === 100 ? " complete" : "") +
          '" style="width:' +
          pct +
          '%"></div></div>' +
          '<div class="kit-subitems">' +
          groupLoans.map((l) => renderSlipSubRow(l)).join("") +
          "</div></div>";
      }
    } else {
      // Flat list
      for (const l of shown.slice().reverse()) {
        const unit = getAsset(l.asset);
        const unitType = unit ? unit.type : "";
        let whoDisplay = esc(l.who);
        if (l.transferredFrom) {
          whoDisplay =
            esc(l.who) + " (transferred from " + esc(l.transferredFrom) + ")";
        }
        let subText =
          esc(l.req) + " · Held by " + whoDisplay + " · Due " + esc(l.due);
        if (l.handoverNote) {
          subText +=
            '<br /><span class="handover-memo">Handover: ' +
            esc(l.handoverNote) +
            "</span>";
        }
        const actions = l.back
          ? badge("Returned", true)
          : '<div class="btn-group">' +
            btn("Record return", "return", String(l.num), "good") +
            btn("Handover / Extend", "open-handover", String(l.num)) +
            "</div>";

        html += row(
          "L-" +
            l.num +
            " · " +
            esc(l.asset) +
            (unitType ? " (" + esc(unitType) + ")" : ""),
          subText,
          actions,
        );
      }
    }
    return html;
  }

  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }

  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };

  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    renderTourDock();
    renderShiftStepper();
    renderBriefingBanner();
    renderModal();

    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
    applyTourHighlight();
  }

  function commit(msg, toastType = "normal") {
    if (msg) {
      s.notice = msg;
      showToast(msg, toastType);
    }
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "toggle-tour":
        if (!s.tour) s.tour = { active: false, stepIndex: 0 };
        s.tour.active = !s.tour.active;
        if (s.tour.active) {
          s.tour.stepIndex = 0;
          tourSteps[0].setup();
          commit("Started Interactive Journey Walkthrough.");
        } else {
          commit("Exited walkthrough.");
        }
        return;
      case "next-tour":
        if (s.tour.stepIndex < tourSteps.length - 1) {
          s.tour.stepIndex++;
          tourSteps[s.tour.stepIndex].setup();
          commit(
            "Walkthrough: Step " +
              (s.tour.stepIndex + 1) +
              " of " +
              tourSteps.length,
          );
        } else {
          s.tour.active = false;
          commit("Completed Guided Journey Walkthrough!", "good");
        }
        return;
      case "prev-tour":
        if (s.tour.stepIndex > 0) {
          s.tour.stepIndex--;
          tourSteps[s.tour.stepIndex].setup();
          commit(
            "Walkthrough: Step " +
              (s.tour.stepIndex + 1) +
              " of " +
              tourSteps.length,
          );
        }
        return;
      case "exit-tour":
        s.tour.active = false;
        commit("Exited walkthrough tour.");
        return;
      case "restart":
        s = original();
        commit("Restarted shift with initial sample data.");
        return;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.modal = null;
        commit("Advanced desk time to " + shifts[s.phase].time + ".");
        return;
      case "tab":
        s.tab = v;
        s.editing = false;
        s.modal = null;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        s.modal = null;
        break;
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "view-mode":
        s.viewMode = v;
        break;
      case "open-handover":
        s.modal = { type: "handover", slipNum: Number(v) };
        break;
      case "close-modal":
        s.modal = null;
        break;
      case "return": {
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        l.back = true;
        commit(
          l.asset + " returned to stock. Slip L-" + l.num + " closed.",
          "good",
        );
        return;
      }
    }
    commit();
  });

  root.addEventListener("input", (e) => {
    if (e.target.matches("[data-search-loans]")) {
      s.searchQuery = e.target.value;
      const pageEl = q("[data-page]");
      if (s.tab === "Loan register" && pageEl) {
        const curInput = e.target;
        const curStart = curInput.selectionStart;
        const curEnd = curInput.selectionEnd;
        pageEl.innerHTML = register();
        const newInput = q("[data-search-loans]");
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(curStart, curEnd);
        }
      }
    }
  });

  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });

  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved to Desk book.", "good");
      return;
    }
    if (f.matches("[data-handover]")) {
      const slipNum = Number(f.dataset.handover);
      const l = s.loans.find((x) => x.num === slipNum);
      if (!l || l.back) return;
      const newWho = String(form.get("handover_who")).trim();
      const newDue = String(form.get("handover_due")).trim();
      const note = String(form.get("handover_note")).trim();

      if (!l.transferredFrom) {
        l.transferredFrom = l.who;
      }
      l.who = newWho;
      l.due = newDue;
      l.handoverNote = note;

      s.notes.push({
        phase: s.phase,
        text:
          "Handover for L-" +
          l.num +
          " (" +
          l.asset +
          "): Custody transferred to " +
          newWho +
          ", due " +
          newDue +
          ". " +
          note,
      });

      s.modal = null;
      commit(
        "Handover saved for L-" +
          l.num +
          ". Transferred to " +
          newWho +
          " (Due " +
          newDue +
          ").",
        "good",
      );
      return;
    }
    if (f.matches("[data-issue-kit]")) {
      const req = String(form.get("req"));
      const r = getReq(req);
      const who = String(form.get("who"));
      const due = String(form.get("due"));
      if (!r || !people.includes(who)) return;

      const activeLoans = s.loans.filter((l) => l.req === r.id && !l.back);
      const issuedTypes = activeLoans.map((l) => getAsset(l.asset).type);
      const remainingItems = r.items.filter((item) => !issuedTypes.includes(item));

      const chosenAssetIds = [];
      for (let i = 0; i < remainingItems.length; i++) {
        const val = form.get("asset_" + i);
        if (val) chosenAssetIds.push(String(val));
      }

      if (chosenAssetIds.length === 0) return;

      let nextNum = Math.max(...s.loans.map((l) => l.num)) + 1;
      const createdSlips = [];

      for (const assetId of chosenAssetIds) {
        const unit = getAsset(assetId);
        if (!unit || unit.repair || out(assetId)) continue;
        s.loans.push({
          num: nextNum,
          req: r.id,
          asset: assetId,
          who,
          due,
          back: false,
        });
        createdSlips.push("L-" + nextNum);
        nextNum++;
      }

      s.tab = "Loan register";
      commit(
        "Issued " +
          createdSlips.length +
          " kit items for " +
          r.id +
          " to " +
          who +
          " (" +
          createdSlips.join(", ") +
          ").",
        "good",
      );
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.editing = false;
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".", "good");
  });

  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      tour: d.tour || { active: false, stepIndex: 0 },
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }

  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep fresh shift when storage is unavailable or saved data is invalid.
  }
})();
