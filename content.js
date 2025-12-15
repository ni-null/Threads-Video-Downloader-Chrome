// Threads Video Downloader - 主入口檔案
// 所有模組已透過 manifest.json 載入
// 使用 MutationObserver + Intersection Observer 優化效能

;(function () {
  "use strict"

  // 等待所有模組載入完成
  if (!window.ThreadsDownloaderUtils || !window.ThreadsMediaExtractor || !window.ThreadsDownloaderButton || !window.ThreadsDownloaderOverlay) {
    console.error("[Threads Downloader] 模組載入失敗，請檢查 manifest.json 中的載入順序")
    return
  }

  const { logDebug, DOMObserver } = window.ThreadsDownloaderUtils
  const { addDownloadButtons } = window.ThreadsDownloaderButton
  const { addMediaOverlayButtons } = window.ThreadsDownloaderOverlay

  logDebug("Content script starting...")

  // 設定狀態
  let settings = {
    enableMediaMenu: true,
    enableSingleDownload: true,
    enableFilenamePrefix: true,
    debugMode: false,
    language: "auto",
  }

  // 載入設定
  async function loadSettings() {
    // 先初始化語言
    await window.ThreadsDownloaderUtils.initLanguage()
    
    chrome.storage.local.get(["enableMediaMenu", "enableSingleDownload", "enableFilenamePrefix", "debugMode", "language"], (result) => {
      settings.enableMediaMenu = result.enableMediaMenu !== false
      settings.enableSingleDownload = result.enableSingleDownload !== false
      settings.enableFilenamePrefix = result.enableFilenamePrefix !== false
      settings.debugMode = result.debugMode === true
      settings.language = result.language || "auto"

      // 初始化各模組的 debug 模式
      if (window.ThreadsDownloaderUtils) {
        window.ThreadsDownloaderUtils._debugMode = settings.debugMode
      }
      if (window.ThreadsDownloaderButton) {
        window.ThreadsDownloaderButton._debugMode = settings.debugMode
        window.ThreadsDownloaderButton._enableFilenamePrefix = settings.enableFilenamePrefix
      }
      if (window.ThreadsDownloaderOverlay) {
        window.ThreadsDownloaderOverlay._debugMode = settings.debugMode
        window.ThreadsDownloaderOverlay._enableFilenamePrefix = settings.enableFilenamePrefix
      }

      logDebug("設定已載入:", settings)

      // 根據設定更新 UI
      updateUIBySettings()
    })
  }

  // 根據設定更新 UI
  function updateUIBySettings() {
    // 處理媒體下載選單按鈕的顯示/隱藏
    const menuButtons = document.querySelectorAll(".threads-download-btn")
    menuButtons.forEach((btn) => {
      btn.style.display = settings.enableMediaMenu ? "" : "none"
    })

    // 處理 hover 下載按鈕的顯示/隱藏
    const overlayButtons = document.querySelectorAll(".threads-overlay-btn")
    overlayButtons.forEach((btn) => {
      btn.style.display = settings.enableSingleDownload ? "" : "none"
    })
  }

  // 監聽來自 popup 的設定更新
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateSettings") {
      settings = message.settings
      logDebug("設定已更新:", settings)

      // 如果語言變更，重新載入語言檔案
      if (message.settings.language !== undefined) {
        window.ThreadsDownloaderUtils.initLanguage().then(() => {
          logDebug("語言已更新")
        })
      }

      // 更新 utils 的 debug 模式
      if (window.ThreadsDownloaderUtils) {
        window.ThreadsDownloaderUtils._debugMode = settings.debugMode === true
        logDebug("Utils debug mode 已更新:", window.ThreadsDownloaderUtils._debugMode)
      }

      // 更新按鈕模組的 debug 模式
      if (window.ThreadsDownloaderButton) {
        window.ThreadsDownloaderButton._debugMode = settings.debugMode === true
        window.ThreadsDownloaderButton._enableFilenamePrefix = settings.enableFilenamePrefix !== false
      }

      // 更新覆蓋按鈕模組的 debug 模式
      if (window.ThreadsDownloaderOverlay) {
        window.ThreadsDownloaderOverlay._debugMode = settings.debugMode === true
        window.ThreadsDownloaderOverlay._enableFilenamePrefix = settings.enableFilenamePrefix !== false
      }

      updateUIBySettings()
      sendResponse({ success: true })
    }
    return true
  })

  // 初始載入設定
  loadSettings()

  // 統計資訊（用於除錯）
  let stats = {
    totalProcessCalls: 0,
    lastProcessTime: null,
  }

  /**
   * 處理 DOM 變化的回調函數
   * 這個函數會在 DOM 有相關變化時被調用（已經過節流處理）
   * @param {Object} event - 事件資訊
   */
  function handleDOMChange(event) {
    stats.totalProcessCalls++
    stats.lastProcessTime = new Date().toISOString()

    logDebug(`處理 DOM 變化 [${event.type}] - 總調用次數: ${stats.totalProcessCalls}`)
    logDebug(`當前設定 - enableMediaMenu: ${settings.enableMediaMenu}, enableSingleDownload: ${settings.enableSingleDownload}`)

    // 檢查上下文是否失效
    if (window.ThreadsDownloaderButton && window.ThreadsDownloaderButton._contextInvalidated) {
      logDebug("Button 上下文已失效,跳過處理")
      return
    }
    if (window.ThreadsDownloaderOverlay && window.ThreadsDownloaderOverlay._contextInvalidated) {
      logDebug("Overlay 上下文已失效,跳過處理")
      return
    }

    // 根據設定決定是否添加按鈕
    if (settings.enableMediaMenu) {
      logDebug("準備調用 addDownloadButtons()")
      addDownloadButtons()
    } else {
      logDebug("跳過 addDownloadButtons: enableMediaMenu = false")
    }
    if (settings.enableSingleDownload) {
      logDebug("準備調用 addMediaOverlayButtons()")
      addMediaOverlayButtons()
    } else {
      logDebug("跳過 addMediaOverlayButtons: enableSingleDownload = false")
    }

    // 更新按鈕顯示狀態
    updateUIBySettings()
  }

  /**
   * 處理元素進入視窗的回調函數
   * 可用於延遲載入按鈕（目前未使用，保留擴展性）
   * @param {HTMLElement} element - 進入視窗的元素
   */
  function handleElementVisible(element) {
    // 目前使用 DOM 變化來處理，這裡保留用於未來優化
    // 例如：可以改為只在元素進入視窗時才添加按鈕
  }

  // 初始化 DOM 觀察器
  DOMObserver.init({
    // 配置選項（可根據需求調整）
    config: {
      throttleDelay: 300, // 節流延遲 300ms
      debounceDelay: 150, // 防抖延遲 150ms
      initialDelay: 1000, // 初始延遲 1 秒
      intersectionThreshold: 0.1,
      intersectionRootMargin: "200px",
      enableDebugLog: false, // 設為 true 可查看更多日誌
    },
    // 回調函數
    onDOMChange: handleDOMChange,
    onElementVisible: handleElementVisible,
  })

  // 監聽頁面可見性變化
  // 當使用者切換回此分頁時，觸發一次處理
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      logDebug("頁面重新可見，觸發處理")
      DOMObserver.triggerProcess()
    }
  })

  // 監聽輪播切換事件（通過 transitionend 和 animationend）
  // 這有助於檢測輪播式媒體的切換
  document.addEventListener(
    "transitionend",
    () => {
      logDebug("檢測到 transition 事件，檢查是否有新媒體")
      DOMObserver.triggerProcess()
    },
    { passive: true }
  )

  document.addEventListener(
    "animationend",
    () => {
      logDebug("檢測到 animation 事件，檢查是否有新媒體")
      DOMObserver.triggerProcess()
    },
    { passive: true }
  )

  // 監聽滾動事件（使用節流）
  // 這是備用機制，確保滾動時能處理新內容
  const throttledScrollHandler = window.ThreadsDownloaderUtils.throttle(() => {
    DOMObserver.triggerProcess()
  }, 500) // 滾動時最多每 500ms 處理一次

  window.addEventListener("scroll", throttledScrollHandler, { passive: true })

  // 監職 popstate 事件（SPA 路由變化）
  window.addEventListener("popstate", () => {
    logDebug("路由變化，觸發處理")
    setTimeout(() => {
      DOMObserver.triggerProcess()
    }, 500)
  })

  // 備用：監聽 URL 變化（使用 History API）
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    logDebug("pushState 觸發")
    setTimeout(() => {
      DOMObserver.triggerProcess()
    }, 500)
  }

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    logDebug("replaceState 觸發")
    setTimeout(() => {
      DOMObserver.triggerProcess()
    }, 500)
  }

  // 提供全域接口供除錯使用
  window.ThreadsDownloaderDebug = {
    getStats: () => stats,
    triggerProcess: () => DOMObserver.triggerProcess(),
    stopObserver: () => DOMObserver.stop(),
    updateConfig: (config) => DOMObserver.updateConfig(config),
    isRunning: () => DOMObserver.isRunning(),
  }

  console.log("Threads Downloader content script loaded (優化版)")
  logDebug("Content script fully loaded - 使用 MutationObserver + 節流機制")
})()
