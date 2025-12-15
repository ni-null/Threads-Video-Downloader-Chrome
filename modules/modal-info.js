// 資訊彈窗模組 - 管理應用程式資訊提示
window.ThreadsModalInfo = window.ThreadsModalInfo || {}

/**
 * 取得外掛名稱 (從 manifest 動態讀取)
 */
function getExtensionName() {
  // 使用 chrome.i18n API 取得本地化的外掛名稱
  if (typeof chrome !== "undefined" && chrome.i18n && chrome.i18n.getMessage) {
    return chrome.i18n.getMessage("extName") || "Threads Video Downloader"
  }
  return "Threads Video Downloader"
}

/**
 * 應用程式資訊內容 (靜態值)
 */
window.ThreadsModalInfo.appInfo = {
  version: "1.0.0",
  developer: "Ninull",
  email: "admin@ninull.com",
  website: "https://github.com/ni-null/Threads-Downloader-Chrome",
}

/**
 * 顯示資訊彈窗
 */
window.ThreadsModalInfo.showModal = function () {
  // 取得 i18n 函數
  const i18n = window.ThreadsDownloaderUtils?.i18n || ((key) => key)

  // 檢查是否已經存在彈窗
  const existingModal = document.getElementById("threads-info-modal")
  if (existingModal) {
    existingModal.style.opacity = "1"
    existingModal.style.pointerEvents = "auto"
    return
  }

  // 建立背景遮罩
  const backdrop = document.createElement("div")
  backdrop.className = "threads-modal-backdrop"
  backdrop.style.cssText = `
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
  `

  // 建立彈窗容器
  const modal = document.createElement("div")
  modal.id = "threads-info-modal"
  modal.className = "threads-modal-content"
  modal.style.cssText = `
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
  `

  // 建立彈窗內容
  const content = `
    <div style="padding: 24px;">
      <!-- 標題 -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #000;">
          ${i18n("modalTitle")}
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
        ">×</button>
      </div>

      <!-- 版本 -->
      <div style="margin-bottom: 16px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          ${i18n("modalVersion")}: <strong>${window.ThreadsModalInfo.appInfo.version}</strong>
        </p>
      </div>

      <!-- 描述 -->
      <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
        <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.5;">
          ${i18n("extDescription")}
        </p>
      </div>

      <!-- 主要功能 -->
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #000;">${i18n("modalFeatures")}</h3>
        <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 13px;">
          <li style="margin-bottom: 6px;">${i18n("modalFeature1")}</li>
          <li style="margin-bottom: 6px;">${i18n("modalFeature2")}</li>
          <li style="margin-bottom: 6px;">${i18n("modalFeature3")}</li>
          <li style="margin-bottom: 6px;">${i18n("modalFeature4")}</li>
        </ul>
      </div>

      <!-- 項目說明 -->
      <div style="margin-bottom: 20px; padding: 12px; background: #f5f5f5; border-radius: 8px; ">
        <p style="margin: 0; color: #333; font-size: 13px; line-height: 1.6;">
          ${i18n("modalDisclaimer")}
        </p>
      </div>

      <!-- 開發者資訊 -->
      <div style="padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 13px;">
        <p style="margin: 0 0 8px 0;"><strong>${i18n("modalDeveloper")}:</strong> ${window.ThreadsModalInfo.appInfo.developer}</p>
        <p style="margin: 0 0 8px 0;"><strong>${i18n("modalContact")}:</strong> <a href="mailto:${
    window.ThreadsModalInfo.appInfo.email
  }" style="color: #667eea; text-decoration: none;">${window.ThreadsModalInfo.appInfo.email}</a></p>
        <p style="margin: 0;">
          <strong>${i18n("modalGitHub")}:</strong> 
          <a href="${
            window.ThreadsModalInfo.appInfo.website
          }" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none;">
            ${i18n("modalGitHubRepo")}
          </a>
          <span style="margin-left: 8px;">${i18n("modalGitHubStar")}</span>
        </p>
      </div>
    </div>
  `

  modal.innerHTML = content

  // 添加到頁面
  document.body.appendChild(backdrop)
  document.body.appendChild(modal)

  // 觸發淡入動畫
  setTimeout(() => {
    backdrop.style.opacity = "1"
    modal.style.opacity = "1"
  }, 10)

  // 關閉按鈕事件
  const closeBtn = modal.querySelector(".threads-modal-close")
  closeBtn.addEventListener("click", () => {
    window.ThreadsModalInfo.closeModal()
  })

  // 背景點擊關閉
  backdrop.addEventListener("click", () => {
    window.ThreadsModalInfo.closeModal()
  })

  // 按 Esc 關閉
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      window.ThreadsModalInfo.closeModal()
      document.removeEventListener("keydown", handleEsc)
    }
  }
  document.addEventListener("keydown", handleEsc)
}

/**
 * 關閉資訊彈窗
 */
window.ThreadsModalInfo.closeModal = function () {
  const modal = document.getElementById("threads-info-modal")
  const backdrop = document.querySelector(".threads-modal-backdrop")

  if (modal && backdrop) {
    modal.style.opacity = "0"
    backdrop.style.opacity = "0"

    setTimeout(() => {
      if (modal.parentElement) modal.parentElement.removeChild(modal)
      if (backdrop.parentElement) backdrop.parentElement.removeChild(backdrop)
    }, 300)
  }
}
