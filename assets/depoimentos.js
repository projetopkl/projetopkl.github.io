(function () {
  var FORM_URL = "https://formsubmit.co/ajax/pklprojeto@gmail.com";

  function focusables(dialog) {
    return Array.prototype.filter.call(
      dialog.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"),
      function (el) {
        return !el.disabled && el.tabIndex >= 0 && el.getAttribute("aria-hidden") !== "true" && !el.hidden && el.offsetParent !== null;
      }
    );
  }

  function openModal(modal, trigger) {
    modal.hidden = false;
    modal._depoTrigger = trigger || null;
    document.body.classList.add("depo-open");
    var closeBtn = modal.querySelector(".depo-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal(modal) {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    if (!document.querySelector(".depo-modal:not([hidden])")) {
      document.body.classList.remove("depo-open");
    }
    if (modal._depoTrigger) modal._depoTrigger.focus();
  }

  document.querySelectorAll(".depo-modal").forEach(function (modal) {
    var dialog = modal.querySelector(".depo-dialog");
    var closeBtn = modal.querySelector(".depo-close");
    if (closeBtn) closeBtn.addEventListener("click", function () { closeModal(modal); });
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(modal); });
    modal.addEventListener("keydown", function (e) {
      if (modal.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); closeModal(modal); return; }
      if (e.key !== "Tab") return;
      var list = focusables(dialog);
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });

  var quoteModal = document.getElementById("depo-modal");
  if (quoteModal) {
    var nameEl = document.getElementById("depo-modal-name");
    var photoEl = document.getElementById("depo-modal-photo");
    var bodyEl = document.getElementById("depo-modal-body");
    document.querySelectorAll("button.depo-card").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = btn.querySelector("img");
        nameEl.textContent = btn.querySelector("h3").textContent;
        photoEl.src = img.getAttribute("src");
        photoEl.alt = "";
        bodyEl.replaceChildren();
        btn.querySelectorAll(".depo-excerpt p").forEach(function (p) {
          bodyEl.appendChild(p.cloneNode(true));
        });
        openModal(quoteModal, btn);
      });
    });
    function clearQuote() { bodyEl.replaceChildren(); }
    quoteModal.querySelector(".depo-close").addEventListener("click", clearQuote);
    quoteModal.addEventListener("click", function (e) { if (e.target === quoteModal) clearQuote(); });
    quoteModal.addEventListener("keydown", function (e) { if (e.key === "Escape") clearQuote(); });
  }

  var formModal = document.getElementById("depo-form-modal");
  var openForm = document.getElementById("depo-open-form");
  if (formModal && openForm) {
    var form = document.getElementById("depo-form");
    var statusEl = form.querySelector(".depo-form-status");
    var thanks = formModal.querySelector(".depo-thanks");
    var submitBtn = form.querySelector("button[type=submit]");
    openForm.addEventListener("click", function () { openModal(formModal, openForm); });
    formModal.querySelector(".depo-close").addEventListener("click", resetForm);
    formModal.addEventListener("click", function (e) { if (e.target === formModal) resetForm(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !formModal.hidden) resetForm();
    }, true);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fileInput = form.querySelector("input[type=file]");
      var file = fileInput.files && fileInput.files[0];
      if (!form.reportValidity()) return;
      if (!file || file.type.indexOf("image/") !== 0) {
        statusEl.textContent = "Escolha um arquivo de imagem para a foto.";
        fileInput.focus();
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        statusEl.textContent = "A foto precisa ter no máximo 5 MB.";
        fileInput.focus();
        return;
      }
      submitBtn.disabled = true;
      statusEl.textContent = "Enviando…";
      var data = new FormData(form);
      fetch(FORM_URL, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          return { ok: res.ok, body: body };
        });
      }).then(function (result) {
        var success = result.body && (result.body.success === true || result.body.success === "true");
        var msg = (result.body && result.body.message) ? String(result.body.message) : "";
        var activation = /activat/i.test(msg);
        if (!(success || activation)) throw new Error("fail");
        form.hidden = true;
        thanks.hidden = false;
        statusEl.textContent = "";
        var doneClose = formModal.querySelector(".depo-close");
        if (doneClose) doneClose.focus();
      }).catch(function () {
        statusEl.textContent = "Não foi possível enviar agora. Tente de novo em instantes.";
        submitBtn.disabled = false;
      });
    });
    function resetForm() {
      form.hidden = false;
      form.reset();
      submitBtn.disabled = false;
      statusEl.textContent = "";
      thanks.hidden = true;
    }
  }

  document.querySelectorAll(".depo-carousel").forEach(initCarousel);

  function initCarousel(root) {
    var viewport = root.querySelector(".depo-viewport");
    var track = root.querySelector(".depo-track");
    var prev = root.querySelector(".depo-prev");
    var next = root.querySelector(".depo-next");
    var index = 0;
    var dragging = false;
    var startX = 0;
    var lastX = 0;
    var startTx = 0;
    var moved = 0;
    var suppressClick = false;
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });
    Array.prototype.forEach.call(track.querySelectorAll("a, img"), function (el) {
      el.setAttribute("draggable", "false");
    });

    function perView() {
      var w = viewport.clientWidth;
      if (w >= 1000) return 3;
      if (w >= 700) return 2;
      return 1;
    }
    function metrics() {
      var n = Math.min(perView(), track.children.length || 1);
      var g = 14;
      var card = (viewport.clientWidth - g * (n - 1)) / n;
      return { n: n, g: g, card: card, max: Math.max(0, track.children.length - n) };
    }
    function apply(animate) {
      var m = metrics();
      if (index > m.max) index = m.max;
      Array.prototype.forEach.call(track.children, function (el) {
        el.style.flex = "0 0 " + m.card + "px";
        el.style.width = m.card + "px";
      });
      track.style.transition = animate ? "" : "none";
      track.style.transform = "translate3d(" + (-index * (m.card + m.g)) + "px,0,0)";
      prev.disabled = index <= 0;
      next.disabled = index >= m.max;
      if (!animate) {
        track.offsetHeight;
        track.style.transition = "";
      }
    }
    function go(dir) {
      var m = metrics();
      index = Math.max(0, Math.min(m.max, index + dir));
      apply(true);
    }
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    function onMove(e) {
      if (!dragging) return;
      lastX = e.clientX;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      track.style.transition = "none";
      track.style.transform = "translate3d(" + (startTx + dx) + "px,0,0)";
    }
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", endDrag);
      document.removeEventListener("pointercancel", endDrag);
      viewport.classList.remove("is-dragging");
      var x = (e && typeof e.clientX === "number") ? e.clientX : lastX;
      var dx = x - startX;
      var m = metrics();
      var threshold = Math.max(24, m.card * 0.18);
      if (Math.abs(dx) > threshold) index += dx < 0 ? 1 : -1;
      index = Math.max(0, Math.min(m.max, index));
      if (moved > 8) {
        suppressClick = true;
        setTimeout(function () { suppressClick = false; }, 0);
      }
      apply(true);
    }
    viewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = lastX = e.clientX;
      var m = metrics();
      startTx = -(index * (m.card + m.g));
      viewport.classList.add("is-dragging");
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", endDrag);
      document.addEventListener("pointercancel", endDrag);
    });
    document.addEventListener("click", function (e) {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);
    window.addEventListener("resize", function () { apply(false); });
    apply(false);
  }
})();
