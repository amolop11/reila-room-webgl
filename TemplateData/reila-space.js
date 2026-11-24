(() => {
  "use strict";

  const activities = {
    Desk: "机で作業してるよ", Chair: "椅子でひと休み中",
    Reading: "本を読んでるよ", Walking: "部屋を歩いてるよ",
    Idle: "のんびりしてるよ", Sleeping: "すやすや眠ってるよ",
    Greeting: "あいさつしてるよ"
  };
  const bands = { Morning: "朝", Day: "昼", Evening: "夕方", Night: "夜", DeepNight: "深夜" };
  const weather = {
    Neutral: "情報なし", Clear: "晴れ", Cloudy: "曇り",
    Rain: "雨", Snow: "雪", Thunderstorm: "雷雨"
  };
  const invites = new Set(["Available", "Pending", "Joining", "Together", "Reading", "Sleeping"]);
  const responses = {
    Starting: "一緒に始めよう", Together: "一緒に作業してるよ",
    Sleeping: "いまはおやすみ中だよ", Reading: "いま読書中だよ"
  };
  const activity = document.querySelector("#reila-activity");
  const details = document.querySelector(".reila-details");
  const time = document.querySelector("#reila-time");
  const sky = document.querySelector("#reila-weather");
  const button = document.querySelector("#reila-invite");
  const feedback = document.querySelector("#reila-invite-feedback");
  const duration = document.querySelector("#reila-focus-duration");
  const start = document.querySelector("#reila-focus-start");
  const stop = document.querySelector("#reila-focus-stop");
  const clock = document.querySelector("#reila-focus-clock");
  const reply = document.querySelector("#reila-focus-reply");
  const focusActivity = document.querySelector("#reila-focus-activity");
  let unity, state, expiry, feedbackExpiry, pendingSequence;
  let focusId, deadline, stopping, retryStopAt, countdown;

  function write(element, value) {
    if (element.textContent !== value) element.textContent = value;
  }

  function send(method, value) {
    if (!unity) return false;
    try {
      unity.SendMessage("Work Invite Overlay", method, value);
      return true;
    } catch {
      return false;
    }
  }

  function tick() {
    clearTimeout(countdown);
    if (!deadline) return;
    const remaining = Math.max(0, deadline - Date.now());
    const seconds = Math.ceil(remaining / 1000);
    write(clock, Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0"));
    if (remaining > 0) countdown = setTimeout(tick, remaining % 1000 || 1000);
    else {
      stop.disabled = true;
      if (!stopping) write(reply, "時間になったよ。Reilaの区切りを待っています。");
    }
  }

  function renderFocus() {
    const active = Boolean(focusId);
    start.disabled = active || !unity || !state || !Number.isSafeInteger(state.focusEndsAt);
    duration.disabled = active;
    stop.hidden = !active;
    stop.disabled = !active || stopping || Boolean(deadline && Date.now() >= deadline);
    clock.hidden = !deadline;
    focusActivity.hidden = !active;
    if (active) write(focusActivity, state ? activities[state.activity] : "部屋からの更新を待っています。");
    tick();
  }

  function updateFocus() {
    if (focusId && state?.focusId === focusId) {
      switch (state.focusState) {
        case "Joining":
        case "Together":
          if (state.focusState === "Together") deadline = state.focusEndsAt;
          if (stopping && Date.now() >= retryStopAt) {
            send("StopWebFocus", focusId);
            retryStopAt = Date.now() + 1000;
          }
          write(reply, stopping ? "Reilaに区切りを伝えています。" :
            deadline ? "Reilaと一緒に作業中。" : "Reilaが机に向かう準備をしています。");
          break;
        case "Finished":
        case "Stopped":
        case "Reading":
        case "Sleeping": {
          const wasTogether = Boolean(deadline || state.focusEndsAt);
          const messages = {
            Finished: "一緒に過ごせてうれしかった。ここでひと息つこう。",
            Stopped: wasTogether ? "ここでひと息。Reilaも自分のペースに戻るよ。" : "招待を取り消したよ。",
            Reading: "Reilaはいま読書中だよ。",
            Sleeping: wasTogether ? "Reilaはおやすみの時間になったよ。" : "Reilaはいまおやすみ中だよ。"
          };
          write(reply, messages[state.focusState]);
          const restoreFocus = document.activeElement === stop;
          focusId = deadline = undefined;
          stopping = false;
          renderFocus();
          if (restoreFocus) start.focus();
          return;
        }
      }
    }
    renderFocus();
  }

  start.addEventListener("click", () => {
    if (start.disabled) return;
    focusId = crypto.randomUUID();
    if (send("RequestWebFocus", focusId + ":" + duration.value)) {
      write(reply, "Reilaの返事を待っています。");
    } else {
      focusId = undefined;
      write(reply, "部屋に招待を届けられませんでした。");
    }
    renderFocus();
  });

  stop.addEventListener("click", () => {
    stopping = true;
    retryStopAt = Date.now() + 1000;
    send("StopWebFocus", focusId);
    write(reply, "Reilaに区切りを伝えています。");
    renderFocus();
  });

  function clearFeedback() {
    pendingSequence = undefined;
    clearTimeout(feedbackExpiry);
    write(feedback, "");
  }

  function invalidate() {
    clearTimeout(expiry);
    if (!state) return;
    state = undefined;
    clearFeedback();
    details.hidden = true;
    write(time, "");
    write(sky, "");
    write(activity, "部屋からの更新が止まっています。");
    button.disabled = true;
    renderFocus();
    window.dispatchEvent(new CustomEvent("reila:state", { detail: null }));
  }

  window.reilaRoomReceive = json => {
    let next;
    try { next = JSON.parse(json); } catch { invalidate(); return; }
    if (!next || next.version !== 1 || !Object.hasOwn(activities, next.activity) ||
        !Object.hasOwn(bands, next.timeBand) || !Object.hasOwn(weather, next.weather) ||
        !invites.has(next.invite) || !Number.isSafeInteger(next.inviteSequence)) {
      invalidate();
      return;
    }
    if (document.hidden) return;
    state = Object.freeze(next);
    clearTimeout(expiry);
    expiry = setTimeout(invalidate, 3500);
    write(activity, activities[state.activity]);
    write(time, bands[state.timeBand]);
    write(sky, weather[state.weather]);
    details.hidden = false;
    button.disabled = !unity;
    if (pendingSequence !== undefined && state.inviteSequence > pendingSequence &&
        Object.hasOwn(responses, state.inviteResponse)) {
      clearFeedback();
      write(feedback, responses[state.inviteResponse]);
      feedbackExpiry = setTimeout(clearFeedback, 2600);
    }
    window.dispatchEvent(new CustomEvent("reila:state", { detail: state }));
    updateFocus();
  };

  window.reilaRoomConnect = instance => {
    unity = instance;
    button.disabled = !state;
    renderFocus();
  };
  window.reilaRoom = Object.freeze({
    getState: () => state ?? null,
    invite: () => {
      if (!unity || !state || document.hidden) return false;
      return send("RequestWebInvite");
    }
  });

  button.addEventListener("click", () => {
    clearFeedback();
    pendingSequence = state?.inviteSequence;
    if (window.reilaRoom.invite()) {
      feedbackExpiry = setTimeout(clearFeedback, 3500);
    } else {
      pendingSequence = undefined;
      write(feedback, "部屋に招待を届けられませんでした。");
    }
  });
  document.addEventListener("visibilitychange", () => {
    invalidate();
    renderFocus();
  });
  window.addEventListener("pagehide", invalidate);
  document.querySelector("#unity-canvas").addEventListener("webglcontextlost", invalidate);
})();
