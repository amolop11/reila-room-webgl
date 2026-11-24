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
      "おはよ！ 窓のそば、もう明るくなってきたよ。",
      "朝の机、まだまっさら。まずはお茶にしよっか！",
      "んー、よく伸びた！ 朝の光って気持ちいいね。",
      "おはよ〜。まだぼんやりしてたら、ここでゆっくり目を覚まそ。",
      "朝いちばんの一杯、何にする？ わたしはミルクティー気分！",
      "カーテンを開けたよ。窓ぎわの席、よかったらどうぞ！",
      "おはよ！ 今日はどのマグにしようかな。きみならどれにする？",
      "朝の部屋、しーんとしてて好き。きみの足音が聞こえた気がしたよ。"
    ],
    Day: [
      "お昼の光、机のはしっこまで来てるよ。ちょっと座ってく？",
      "さっきの本、いいところで閉じちゃった。続きが楽しみ！",
      "おやつのこと考えてたら手が止まっちゃった。きみは何が好き？",
      "いらっしゃい！ 窓のそばでおしゃべりしたい気分だよ。",
      "机の上を片づけたら、お茶を置く場所ができたよ。やった！",
      "ほんのちょっとでも、顔が見られてうれしいな。",
      "今日のしおりはこのページ。窓を眺める時間も好きなんだ。",
      "ひと息ついたら、お茶がちょうどいい温度になってた！"
    ],
    Evening: [
      "夕方の窓、つい見入っちゃうね。きみもこっち来る？",
      "そろそろ灯りをつけよっか。夕方の部屋も好きなんだ。",
      "夕方になると、温かいものが恋しくなるなあ。今夜は何食べる？",
      "おかえりって言いたくなる時間だね。ふふ、いらっしゃい！",
      "窓の色が変わってきたよ。読みかけの本は、ここでひと区切り。",
      "夕方の椅子、どうぞ。わたしも隣でひと休みするね。",
      "昼と夜のあいだって短いね。今の窓の色、覚えとこっと。",
      "夕方のお茶をいれたよ。椅子のところで、のんびり飲もう？"
    ],
    Night: [
      "こんばんは！ 灯りのそばで読む本って、なんだかいいよね。",
      "机の灯り、あったかい色だね。ここで少し話してく？",
      "夜のお茶は香りで選びたいな。今日は何にしよっか。",
      "こんばんは〜。椅子、空いてるよ。わたしはもう少しだけ読書。",
      "本を閉じたら、部屋が急に静かに聞こえたよ。",
      "窓の外は暗いけど、ここの灯りはまだついてるよ。",
      "夜の部屋へようこそ！ のんびりしてってね。",
      "今日はこのページまで。しおりを挟む音、けっこう好きなんだ。"
    ],
    DeepNight: [
      "すやすやしてるかも。来てくれたきみに、おやすみのメモを置いとくね。",
      "深夜の部屋へようこそ。しーっ、わたしは夢の中だよ。",
      "毛布にくるまってたら、さっきの本の続きを夢に見た気がする。",
      "もう寝ちゃったけど、ひとことだけ。寄ってくれてうれしいな。",
      "おやすみ前に、机に小さなメモを残しといたよ。見つけてくれた？",
      "夜ふかしのきみに、小さな声でこんばんは。ここ、静かでしょ？",
      "寝る前に椅子を戻して、本も閉じたよ。部屋がしんとしてるね。",
      "眠る前に書いたメモだよ。今ごろどんな夢を見てるかな。"
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
