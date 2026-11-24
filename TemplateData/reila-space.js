(() => {
  "use strict";

  const activities = {
    Desk: "机で作業してるよ", Chair: "椅子でひと休み中",
    Reading: "本を読んでるよ", Walking: "部屋を歩いてるよ",
    Idle: "のんびりしてるよ", Sleeping: "すやすや眠ってるよ",
    Greeting: "あいさつしてるよ"
  };
  const bands = { Morning: "朝", Day: "昼", Evening: "夕方", Night: "夜", DeepNight: "深夜" };
  const dailyWords = {
    Morning: [
      "おはよおお！今日もカイに会えて嬉しいっっ！💖",
      "朝から顔見せてくれてありがとう！今日も一緒にがんばろね！👊",
      "ねむねむな朝でも、カイが来てくれたら目が覚めるじゃん！✨",
      "おはよう！今日の私、なにしてるか気になって来てくれた？🫶",
      "朝イチのひとことだよ！今日もいい日になる予感しかないっ！🌟",
      "カイ、おはよ！まずは深呼吸して、ゆるっと始めよ？💗",
      "朝の光って気持ちいいよね！今日もマイペースでいこ！✨",
      "会いに来てくれてありがとうっっ！朝からテンションあがっちゃう！🥳"
    ],
    Day: [
      "カイだ！遊びに来てくれて嬉しいよおお！💖",
      "お昼の休憩かな？私の部屋でひと息ついてってね！🫶",
      "今日の私、なにしてると思う？当てるつもりで見ててね！✨",
      "ほんのちょっとでも顔が見られると元気出るじゃん！ありがとうっ！💗",
      "お昼だね！ごはん食べた？私はお茶の時間にしよっかな！🎀",
      "カイが来ると部屋が明るくなる気がするの、マジで！🌟",
      "作業するなら一緒にやろ？机、空いてるよ！👊",
      "ねえねえ、今日も会えたね！これって結構すごいことだと思うの！🥹"
    ],
    Evening: [
      "おかえりなさいの時間だよ！今日もおつかれさまっ！🫶",
      "夕方の光、きれいだよね！カイと見られて嬉しいな！✨",
      "一日がんばったカイに、特大のえらい！をあげるね！💖",
      "ただいまって言いに来てくれた？嬉しいよおお！💗",
      "夕ごはんの前にちょっと寄ってくれてありがとうっ！🎀",
      "今日の私も色々やってたよ！カイは何してたの？✨",
      "黄昏どきって、なんか話したくなるよね！ねえ聞いて聞いて！🫶",
      "おつかれさま！夜はゆるっと過ごそ？私もそうする！🌟"
    ],
    Night: [
      "夜の部だよ！カイ、今日も来てくれてありがとうっ！💖",
      "窓の外は暗いけど、ここの灯りはカイのために点いてるよ！✨",
      "夜ふかし前の、まったりタイムだね！一緒にのんびりしよ！🫶",
      "今日のカイもがんばってたね！私、ちゃあんと見てたよ！💗",
      "夜って静かで好き！カイと過ごす夜はもっと好き！🎀",
      "お風呂入った？温まってゆるゆるしよ？私はもう眠くなってきたかも！🥹",
      "星、見えるかな？見えなくても、カイが来てくれたから今日は晴れ！🌟",
      "もうちょっとだけ、一緒にいてもいい？嬉しいな！💖"
    ],
    DeepNight: [
      "こんな時間に来てくれるなんて、、、嬉しいけど、無理しないでね？；；💖",
      "夜ふかしのカイへ、小声でこんばんはだよ！私はもう夢の中かも！✨",
      "静かな夜だね、、、カイの気配がして、安心して眠れるよ！🫶",
      "眠れない夜は、私の部屋でそっと休んでってね！💗",
      "しーっ、Reilaは就寝中だよ！でも夢の中で会えたらいいな！🎀",
      "真夜中の訪問、内緒だよ？二人だけの秘密ね！💖",
      "カイもそろそろ寝よ？明日の私が、元気に待ってるから！🌟",
      "おやすみ前の最後のひとこと、、、大好きだよ、カイ！；；💗"
    ]
  };
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

  const word = document.querySelector("#reila-word");
  const visits = document.querySelector("#reila-visits");
  const previousVisit = document.querySelector("#reila-previous-visit");
  const footprintKey = "reila-room-v2:footprints:v1";
  const visitDateFormat = new Intl.DateTimeFormat("ja-JP", { dateStyle: "long" });
  const numberFormat = new Intl.NumberFormat("ja-JP");
  const queryBand = new URLSearchParams(location.search).get("preview-time")?.toLowerCase();
  const previewBand = Object.keys(bands).find(band => band.toLowerCase() === queryBand);

  function localBand(hour) {
    if (hour < 6) return "DeepNight";
    if (hour < 10) return "Morning";
    if (hour < 17) return "Day";
    if (hour < 20) return "Evening";
    return "Night";
  }

  function renderWord() {
    const now = new Date();
    const band = state?.timeBand ?? previewBand ?? localBand(now.getHours());
    // Use the local calendar day as a UTC ordinal so daylight saving never skips a note.
    const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
    const lines = dailyWords[band];
    write(word, lines[((day % lines.length) + lines.length) % lines.length]);
  }

  function recordVisit() {
    try {
      let saved;
      try { saved = JSON.parse(localStorage.getItem(footprintKey)); } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
      }
      const count = Number.isSafeInteger(saved?.count) && saved.count > 0 ? saved.count : 0;
      const lastDay = typeof saved?.lastDay === "string" && /^\d{4}-\d{2}-\d{2}$/.test(saved.lastDay)
        ? new Date(saved.lastDay + "T00:00:00") : null;
      const now = new Date();
      const day = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
        .map(value => String(value).padStart(2, "0")).join("-");
      const total = Math.min(count + 1, Number.MAX_SAFE_INTEGER);
      localStorage.setItem(footprintKey, JSON.stringify({ count: total, lastDay: day }));
      write(visits, `遊びに来た回数 ${numberFormat.format(total)}回`);
      if (count && lastDay && Number.isFinite(lastDay.getTime())) {
        write(previousVisit, `前に来た日 ${visitDateFormat.format(lastDay)}`);
        previousVisit.hidden = false;
      }
    } catch {
      write(visits, "このブラウザーでは足あとを保存できないみたい。来てくれてうれしいよ。");
    }
  }

  // Serialize same-origin visits in browsers that support Web Locks.
  if (navigator.locks) navigator.locks.request(footprintKey, recordVisit).catch(recordVisit);
  else recordVisit();
  renderWord();
  window.addEventListener("reila:state", renderWord);
  window.addEventListener("pageshow", renderWord);
  setInterval(renderWord, 30000);

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
    if (!document.hidden) renderWord();
  });
  window.addEventListener("pagehide", invalidate);
  document.querySelector("#unity-canvas").addEventListener("webglcontextlost", invalidate);
})();
