document.addEventListener("DOMContentLoaded", async () => {
  // 先載入設定（包含語言設定）
  const settings = await new Promise((resolve) => {
    chrome.storage.local.get(["enableMediaMenu", "enableSingleDownload", "language", "debugMode"], (result) => {
      resolve(result)
    })
  })

  // 根據設定初始化 i18n
  const savedLanguage = settings.language || "auto"
  await initI18n(savedLanguage === "auto" ? null : savedLanguage)

  // 設定開關元素
  const languageSelect = document.getElementById("languageSelect")
  const enableMediaMenuToggle = document.getElementById("enableMediaMenu")
  const enableSingleDownloadToggle = document.getElementById("enableSingleDownload")
  const enableFilenamePrefixToggle = document.getElementById("enableFilenamePrefix")
  const enableDebugModeToggle = document.getElementById("enableDebugMode")

  // 調試日誌函數
  function logDebug(message, data = null) {
    const logMsg = "[DEBUG-POPUP] " + message + (data ? " " + JSON.stringify(data) : "")
    console.log(logMsg)
  }

  logDebug("Popup initialized")

  // i18n 初始化函數
  async function initI18n(locale = null) {
    // 語言映射：chrome.i18n.getUILanguage() -> manifest locale
    const localeMap = {
      "zh-TW": "zh_TW",
      "zh-CN": "zh_CN",
      "zh-HK": "zh_TW",
      "zh-SG": "zh_CN",
      ja: "ja",
      "ja-JP": "ja",
      ko: "ko",
      "ko-KR": "ko",
      en: "en",
      "en-US": "en",
      "en-GB": "en",
    }

    // 獲取當前語言設定
    let currentLocale = locale
    if (!currentLocale) {
      // 如果沒有指定語言，使用瀏覽器語言
      const browserLang = chrome.i18n.getUILanguage()
      currentLocale = localeMap[browserLang] || "en"
    }

    logDebug("Initializing i18n with locale:", currentLocale)

    // 載入對應語言的 messages.json
    try {
      const response = await fetch(chrome.runtime.getURL(`_locales/${currentLocale}/messages.json`))
      const messages = await response.json()

      // 處理所有帶 data-i18n 屬性的元素
      document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n")
        if (messages[key] && messages[key].message) {
          element.textContent = messages[key].message
        }
      })

      logDebug("Language loaded:", currentLocale)
    } catch (error) {
      console.error("Failed to load language:", error)
      // 降級到預設語言
      document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n")
        const message = chrome.i18n.getMessage(key)
        if (message) {
          element.textContent = message
        }
      })
    }
  }

  // 載入設定
  function loadSettings() {
    chrome.storage.local.get(["enableMediaMenu", "enableSingleDownload", "enableFilenamePrefix", "language", "debugMode"], (result) => {
      // 預設都啟用
      const mediaMenuEnabled = result.enableMediaMenu !== false
      const singleDownloadEnabled = result.enableSingleDownload !== false
      const filenamePrefixEnabled = result.enableFilenamePrefix !== false // 預設啟用
      const debugModeEnabled = result.debugMode === true // 明確檢查是否為 true
      const language = result.language || "auto"

      enableMediaMenuToggle.checked = mediaMenuEnabled
      enableSingleDownloadToggle.checked = singleDownloadEnabled
      enableFilenamePrefixToggle.checked = filenamePrefixEnabled
      enableDebugModeToggle.checked = debugModeEnabled
      languageSelect.value = language

      logDebug("Settings loaded:", { mediaMenuEnabled, singleDownloadEnabled, filenamePrefixEnabled, debugModeEnabled, language })
    })
  }

  // 儲存設定並通知 content script
  function saveSettings() {
    const settings = {
      enableMediaMenu: enableMediaMenuToggle.checked,
      enableSingleDownload: enableSingleDownloadToggle.checked,
      enableFilenamePrefix: enableFilenamePrefixToggle.checked,
      debugMode: enableDebugModeToggle.checked,
      language: languageSelect.value,
    }

    chrome.storage.local.set(settings, () => {
      logDebug("Settings saved:", settings)

      // 通知當前分頁的 content script 更新設定
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "updateSettings",
              settings: settings,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                logDebug("無法通知 content script（頁面可能不支援）")
              } else {
                logDebug("Content script 已更新設定")
              }
            }
          )
        }
      })
    })
  }

  // 設定開關事件監聽
  enableMediaMenuToggle.addEventListener("change", saveSettings)
  enableSingleDownloadToggle.addEventListener("change", saveSettings)
  enableFilenamePrefixToggle.addEventListener("change", saveSettings)
  enableDebugModeToggle.addEventListener("change", saveSettings)

  // 語言切換事件
  languageSelect.addEventListener("change", async () => {
    saveSettings()
    // 立即重新載入語言
    const selectedLang = languageSelect.value
    await initI18n(selectedLang === "auto" ? null : selectedLang)
  })

  // 初始化：載入設定
  loadSettings()

  logDebug("Popup setup complete")
})
