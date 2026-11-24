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
  let unity, state, expiry, feedbackExpiry, pendingSequence;

  function write(element, value) {
    if (element.textContent !== value) element.textContent = value;
  }

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
  };

  window.reilaRoomConnect = instance => {
    unity = instance;
    button.disabled = !state;
  };
  window.reilaRoom = Object.freeze({
    getState: () => state ?? null,
    invite: () => {
      if (!unity || !state || document.hidden) return false;
      try {
        unity.SendMessage("Work Invite Overlay", "RequestWebInvite");
        return true;
      } catch {
        return false;
      }
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
  document.addEventListener("visibilitychange", invalidate);
  window.addEventListener("pagehide", invalidate);
  document.querySelector("#unity-canvas").addEventListener("webglcontextlost", invalidate);
})();
