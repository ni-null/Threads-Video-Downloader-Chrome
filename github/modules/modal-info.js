;(() => {
  window.ThreadsModalInfo = window.ThreadsModalInfo || {}
  window.ThreadsModalInfo.appInfo = {
    version: "1.0.0",
    developer: "Ninull",
    email: "admin@ninull.com",
    website: "https://github.com/ni-null/Threads-Downloader-Chrome",
  }
  window.ThreadsModalInfo.showModal = function () {
    const e = window.ThreadsDownloaderUtils?.i18n || ((a) => a),
      o = document.getElementById("threads-info-modal")
    if (o) {
      ;(o.style.opacity = "1"), (o.style.pointerEvents = "auto")
      return
    }
    const n = document.createElement("div")
    ;(n.className = "threads-modal-backdrop"),
      (n.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999998;
    opacity: 0;
    transition: opacity 0.3s ease;
    cursor: pointer;
  `)
    const t = document.createElement("div")
    ;(t.id = "threads-info-modal"),
      (t.className = "threads-modal-content"),
      (t.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    z-index: 9999999;
    max-width: 450px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    opacity: 0;
    transition: opacity 0.3s ease;
  `)
    const d = `
    <div style="padding: 24px;">
      <!-- \u6A19\u984C -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #000;">
          ${e("modalTitle")}
        </h2>
        <button class="threads-modal-close" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">\xD7</button>
      </div>

      <!-- \u7248\u672C -->
      <div style="margin-bottom: 16px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          ${e("modalVersion")}: <strong>${window.ThreadsModalInfo.appInfo.version}</strong>
        </p>
      </div>

      <!-- \u63CF\u8FF0 -->
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
        <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.5;">
          ${e("extDescription")}
        </p>
      </div>

      <!-- \u4E3B\u8981\u529F\u80FD -->
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #000;">${e("modalFeatures")}</h3>
        <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 13px;">
          <li style="margin-bottom: 6px;">${e("modalFeature1")}</li>
          <li style="margin-bottom: 6px;">${e("modalFeature2")}</li>
          <li style="margin-bottom: 6px;">${e("modalFeature3")}</li>
          <li style="margin-bottom: 6px;">${e("modalFeature4")}</li>
        </ul>
      </div>

      <!-- \u9805\u76EE\u8AAA\u660E -->
      <div style="margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px; ">
        <p style="margin: 0; color: #333; font-size: 13px; line-height: 1.6;">
          ${e("modalDisclaimer")}
        </p>
      </div>

      <!-- \u958B\u767C\u8005\u8CC7\u8A0A -->
      <div style="padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 13px;">
        <p style="margin: 0 0 8px 0;"><strong>${e("modalDeveloper")}:</strong> ${window.ThreadsModalInfo.appInfo.developer}</p>
        <p style="margin: 0 0 8px 0;"><strong>${e("modalContact")}:</strong> <a href="mailto:${
      window.ThreadsModalInfo.appInfo.email
    }" style="color: #667eea; text-decoration: none;">${window.ThreadsModalInfo.appInfo.email}</a></p>
        <p style="margin: 0;">
          <strong>${e("modalGitHub")}:</strong> 
          <a href="${
            window.ThreadsModalInfo.appInfo.website
          }" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none;">
            ${e("modalGitHubRepo")}
          </a>
          <span style="margin-left: 8px;">${e("modalGitHubStar")}</span>
        </p>
      </div>
    </div>
  `
    ;(t.innerHTML = d),
      document.body.appendChild(n),
      document.body.appendChild(t),
      setTimeout(() => {
        ;(n.style.opacity = "1"), (t.style.opacity = "1")
      }, 10),
      t.querySelector(".threads-modal-close").addEventListener("click", () => {
        window.ThreadsModalInfo.closeModal()
      }),
      n.addEventListener("click", () => {
        window.ThreadsModalInfo.closeModal()
      })
    const i = (a) => {
      a.key === "Escape" && (window.ThreadsModalInfo.closeModal(), document.removeEventListener("keydown", i))
    }
    document.addEventListener("keydown", i)
  }
  window.ThreadsModalInfo.closeModal = function () {
    const e = document.getElementById("threads-info-modal"),
      o = document.querySelector(".threads-modal-backdrop")
    e &&
      o &&
      ((e.style.opacity = "0"),
      (o.style.opacity = "0"),
      setTimeout(() => {
        e.parentElement && e.parentElement.removeChild(e), o.parentElement && o.parentElement.removeChild(o)
      }, 300))
  }
})()
