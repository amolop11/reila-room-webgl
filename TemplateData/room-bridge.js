(() => {
  "use strict";

  const activities = new Set(["Desk", "Chair", "Reading", "Walking", "Idle", "Sleeping", "Greeting"]);
  const bands = new Set(["Morning", "Day", "Evening", "Night", "DeepNight"]);
  const weather = new Set(["Neutral", "Clear", "Cloudy", "Rain", "Snow", "Thunderstorm"]);
  const invites = new Set(["Available", "Pending", "Joining", "Together", "Reading", "Sleeping"]);

  let unity, state, expiry;

  function invalidate() {
    clearTimeout(expiry);
    if (!state) return;
    state = undefined;
    window.dispatchEvent(new CustomEvent("reila:state", { detail: null }));
  }

  window.reilaRoomReceive = json => {
    let next;
    try { next = JSON.parse(json); } catch { invalidate(); return; }
    if (!next || next.version !== 1 || !activities.has(next.activity) ||
        !bands.has(next.timeBand) || !weather.has(next.weather) ||
        !invites.has(next.invite) || !Number.isSafeInteger(next.inviteSequence)) {
      invalidate();
      return;
    }
    if (document.hidden) return;
    state = Object.freeze(next);
    clearTimeout(expiry);
    expiry = setTimeout(invalidate, 3500);
    window.dispatchEvent(new CustomEvent("reila:state", { detail: state }));
  };

  window.reilaRoomConnect = instance => { unity = instance; };
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
  document.addEventListener("visibilitychange", invalidate);
  window.addEventListener("pagehide", invalidate);
  document.querySelector("#unity-canvas").addEventListener("webglcontextlost", invalidate);
})();