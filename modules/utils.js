// 工具函數模組
// 使用全域命名空間來避免衝突
window.ThreadsDownloaderUtils = window.ThreadsDownloaderUtils || {}

// Debug 模式設定 (可通過擴充功能設定控制)
window.ThreadsDownloaderUtils._debugMode = false

// 語言設定
window.ThreadsDownloaderUtils._currentLanguage = null
window.ThreadsDownloaderUtils._messages = null

// 調試日誌函數 - 只在 debug 模式下輸出
window.ThreadsDownloaderUtils.logDebug = function (message, data = null) {
  if (window.ThreadsDownloaderUtils._debugMode) {
    console.log("[DEBUG-CONTENT]", message, data || "")
  }
}

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

/**
 * 初始化語言設定
 */
window.ThreadsDownloaderUtils.initLanguage = async function () {
  return new Promise((resolve) => {
    chrome.storage.local.get(["language", "debugMode"], async (result) => {
      window.ThreadsDownloaderUtils._debugMode = result.debugMode === true
      
      const savedLanguage = result.language || "auto"
      let targetLocale = null

      if (savedLanguage === "auto") {
        // 使用瀏覽器語言
        const browserLang = chrome.i18n.getUILanguage()
        targetLocale = localeMap[browserLang] || "en"
      } else {
        targetLocale = savedLanguage
      }

      window.ThreadsDownloaderUtils._currentLanguage = targetLocale
      window.ThreadsDownloaderUtils.logDebug("載入語言:", targetLocale)

      // 載入語言檔案
      try {
        const response = await fetch(chrome.runtime.getURL(`_locales/${targetLocale}/messages.json`))
        window.ThreadsDownloaderUtils._messages = await response.json()
        window.ThreadsDownloaderUtils.logDebug("語言檔案載入成功")
      } catch (error) {
        console.error("無法載入語言檔案:", error)
        window.ThreadsDownloaderUtils._messages = null
      }

      resolve()
    })
  })
}

/**
 * i18n 國際化函數
 * 獲取本地化字串，支援佔位符替換
 * @param {string} messageName - 訊息名稱（對應 messages.json 中的 key）
 * @param {string|string[]} substitutions - 替換佔位符的值
 * @returns {string} - 本地化後的字串
 */
window.ThreadsDownloaderUtils.i18n = function (messageName, substitutions = null) {
  try {
    // 如果已載入自訂語言檔案，從中讀取
    if (window.ThreadsDownloaderUtils._messages && window.ThreadsDownloaderUtils._messages[messageName]) {
      const messageData = window.ThreadsDownloaderUtils._messages[messageName]
      let message = messageData.message
      
      // 處理佔位符替換
      if (substitutions && messageData.placeholders) {
        const subs = Array.isArray(substitutions) ? substitutions : [substitutions]
        
        // 遍歷所有佔位符定義
        Object.keys(messageData.placeholders).forEach((placeholderName) => {
          const placeholder = messageData.placeholders[placeholderName]
          const placeholderPattern = placeholder.content // 例如 "$1"
          
          // 提取位置索引（$1 -> 1, $2 -> 2）
          const match = placeholderPattern.match(/\$(\d+)/)
          if (match) {
            const index = parseInt(match[1]) - 1 // 轉換為 0-based 索引
            if (index >= 0 && index < subs.length) {
              // 替換命名佔位符（例如 $COUNT$ -> 實際值）
              const namedPlaceholder = `\\$${placeholderName.toUpperCase()}\\$`
              message = message.replace(new RegExp(namedPlaceholder, 'gi'), subs[index])
            }
          }
        })
      }
      
      return message
    }
    
    // Fallback 到 chrome.i18n
    if (chrome && chrome.i18n && chrome.i18n.getMessage) {
      const message = chrome.i18n.getMessage(messageName, substitutions)
      return message || messageName
    }
  } catch (e) {
    console.error("i18n error:", e)
  }
  return messageName
}

/**
 * 獲取當前語言
 * @returns {string} - 語言代碼（如 'en', 'zh_TW', 'ja'）
 */
window.ThreadsDownloaderUtils.getUILanguage = function () {
  try {
    if (chrome && chrome.i18n && chrome.i18n.getUILanguage) {
      return chrome.i18n.getUILanguage()
    }
  } catch (e) {
    // fallback
  }
  return navigator.language || "en"
}

// 顯示頁面通知
window.ThreadsDownloaderUtils.showPageNotification = function (message) {
  // 移除舊通知
  const oldNotification = document.querySelector(".threads-download-notification")
  if (oldNotification) oldNotification.remove()

  const notification = document.createElement("div")
  notification.className = "threads-download-notification"
  notification.innerHTML = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 100000;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  `

  // 添加動畫
  const style = document.createElement("style")
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  if (!document.querySelector("style[data-threads-download]")) {
    style.setAttribute("data-threads-download", "true")
    document.head.appendChild(style)
  }

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.opacity = "0"
    notification.style.transition = "opacity 0.3s"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

/**
 * 從元素向上遍歷 DOM，找到最近的 Threads 貼文連結
 * @param {HTMLElement} element - 起始元素
 * @returns {Object|null} - { username, postId, url } 或 null
 */
window.ThreadsDownloaderUtils.findPostInfoFromElement = function (element) {
  if (!element) return null

  let current = element
  let depth = 0
  const maxDepth = 15

  while (current && depth < maxDepth) {
    // 在當前節點及其子節點中查找 Threads 貼文連結
    const links = current.querySelectorAll ? current.querySelectorAll('a[href*="/post/"]') : []

    for (const link of links) {
      const href = link.href
      const postInfo = window.ThreadsDownloaderUtils.parseThreadsUrl(href)
      if (postInfo) {
        return postInfo
      }
    }

    current = current.parentElement
    depth++
  }

  // 如果沒找到，嘗試從當前頁面 URL 解析
  return window.ThreadsDownloaderUtils.parseThreadsUrl(window.location.href)
}

/**
 * 解析 Threads URL 獲取用戶名和貼文 ID
 * @param {string} url - Threads URL
 * @returns {Object|null} - { username, postId, url } 或 null
 */
window.ThreadsDownloaderUtils.parseThreadsUrl = function (url) {
  if (!url) return null

  try {
    // Threads URL 格式: https://www.threads.net/@username/post/postId
    const match = url.match(/@([^/]+)\/post\/([^/?#]+)/)
    if (match) {
      return {
        username: match[1],
        postId: match[2],
        url: url,
      }
    }
  } catch (e) {
    window.ThreadsDownloaderUtils.logDebug("Error parsing URL:", e)
  }

  return null
}

// ============================================
// DOM 觀察器模組 - 效能優化
// ============================================

/**
 * 創建節流函數
 * 在指定時間內只執行一次函數，避免頻繁觸發
 * @param {Function} func - 要節流的函數
 * @param {number} wait - 等待時間（毫秒）
 * @returns {Function} - 節流後的函數
 */
window.ThreadsDownloaderUtils.throttle = function (func, wait) {
  let timeout = null
  let lastTime = 0

  return function (...args) {
    const now = Date.now()
    const remaining = wait - (now - lastTime)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      lastTime = now
      func.apply(this, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastTime = Date.now()
        timeout = null
        func.apply(this, args)
      }, remaining)
    }
  }
}

/**
 * 創建防抖函數
 * 延遲執行函數，如果在延遲期間再次調用則重新計時
 * @param {Function} func - 要防抖的函數
 * @param {number} wait - 等待時間（毫秒）
 * @returns {Function} - 防抖後的函數
 */
window.ThreadsDownloaderUtils.debounce = function (func, wait) {
  let timeout = null

  return function (...args) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      timeout = null
      func.apply(this, args)
    }, wait)
  }
}

/**
 * DOM 觀察器管理器
 * 使用 MutationObserver 監聽 DOM 變化，配合節流機制避免效能問題
 */
window.ThreadsDownloaderUtils.DOMObserver = {
  // 觀察器實例
  mutationObserver: null,
  intersectionObserver: null,

  // 配置選項（可根據需求調整）
  config: {
    // 節流延遲（毫秒）- DOM 變化後多久才處理
    throttleDelay: 300,
    // 防抖延遲（毫秒）- 連續變化時等待多久
    debounceDelay: 150,
    // 初始延遲（毫秒）- 頁面載入後等待多久開始監聽
    initialDelay: 1000,
    // Intersection Observer 閾值 - 元素可見多少比例時觸發
    intersectionThreshold: 0.1,
    // Intersection Observer 邊界 - 提前多少像素開始處理
    intersectionRootMargin: "200px",
    // 是否啟用 debug 日誌
    enableDebugLog: false,
  },

  // 回調函數
  _onDOMChangeCallback: null,
  _onElementVisibleCallback: null,

  // 節流後的處理函數
  _throttledHandler: null,
  _debouncedHandler: null,

  // 待處理的元素佇列
  _pendingElements: new Set(),

  // 狀態
  _isRunning: false,

  /**
   * 初始化觀察器
   * @param {Object} options - 配置選項
   * @param {Function} options.onDOMChange - DOM 變化時的回調
   * @param {Function} options.onElementVisible - 元素進入視窗時的回調
   */
  init: function (options = {}) {
    const { logDebug } = window.ThreadsDownloaderUtils

    if (this._isRunning) {
      logDebug("DOMObserver 已經在運行中")
      return
    }

    // 合併配置
    if (options.config) {
      this.config = { ...this.config, ...options.config }
    }

    // 設置回調
    this._onDOMChangeCallback = options.onDOMChange || null
    this._onElementVisibleCallback = options.onElementVisible || null

    // 創建節流和防抖處理器
    this._throttledHandler = window.ThreadsDownloaderUtils.throttle(this._processDOMChanges.bind(this), this.config.throttleDelay)

    this._debouncedHandler = window.ThreadsDownloaderUtils.debounce(this._processDOMChanges.bind(this), this.config.debounceDelay)

    // 延遲初始化觀察器
    setTimeout(() => {
      this._initMutationObserver()
      this._initIntersectionObserver()
      this._isRunning = true

      // 初始掃描
      if (this._onDOMChangeCallback) {
        this._onDOMChangeCallback({ type: "initial" })
      }

      logDebug("DOMObserver 初始化完成")
    }, this.config.initialDelay)
  },

  /**
   * 初始化 MutationObserver
   * 監聽 DOM 結構變化
   */
  _initMutationObserver: function () {
    const { logDebug } = window.ThreadsDownloaderUtils

    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      // 檢查是否有相關的變化
      let hasRelevantChange = false

      for (const mutation of mutations) {
        // 只處理新增節點
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            // 只處理元素節點
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 檢查是否包含媒體元素或貼文容器
              if (this._isRelevantNode(node)) {
                hasRelevantChange = true
                break
              }
            }
          }
        }

        if (hasRelevantChange) break
      }

      if (hasRelevantChange) {
        if (this.config.enableDebugLog) {
          logDebug("偵測到相關 DOM 變化")
        }
        // 使用防抖處理連續的 DOM 變化
        this._debouncedHandler()
      }
    })

    // 開始觀察
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      // 不監聽屬性和文字變化，減少觸發次數
      attributes: false,
      characterData: false,
    })
  },

  /**
   * 初始化 Intersection Observer
   * 監聽元素進入視窗
   */
  _initIntersectionObserver: function () {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // 元素進入視窗
            if (this._onElementVisibleCallback) {
              this._onElementVisibleCallback(entry.target)
            }
            // 處理後取消觀察
            this.intersectionObserver.unobserve(entry.target)
          }
        }
      },
      {
        threshold: this.config.intersectionThreshold,
        rootMargin: this.config.intersectionRootMargin,
      }
    )
  },

  /**
   * 檢查節點是否與我們的功能相關
   * @param {HTMLElement} node - 要檢查的節點
   * @returns {boolean}
   */
  _isRelevantNode: function (node) {
    // 檢查是否包含影片或圖片
    if (node.tagName === "VIDEO" || node.tagName === "PICTURE" || node.tagName === "IMG") {
      return true
    }

    // 檢查子節點中是否有媒體
    if (node.querySelector) {
      if (node.querySelector("video, picture, img")) {
        return true
      }
      // 檢查是否是貼文容器（包含連結到 /post/ 的元素）
      if (node.querySelector('a[href*="/post/"]')) {
        return true
      }
    }

    return false
  },

  /**
   * 處理 DOM 變化
   */
  _processDOMChanges: function () {
    if (this._onDOMChangeCallback) {
      this._onDOMChangeCallback({ type: "mutation" })
    }
  },

  /**
   * 觀察特定元素的可見性
   * @param {HTMLElement} element - 要觀察的元素
   */
  observeElement: function (element) {
    if (this.intersectionObserver && element) {
      this.intersectionObserver.observe(element)
    }
  },

  /**
   * 手動觸發一次處理
   * 用於需要立即執行的情況
   */
  triggerProcess: function () {
    this._throttledHandler()
  },

  /**
   * 停止觀察
   */
  stop: function () {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = null
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }

    this._isRunning = false
    window.ThreadsDownloaderUtils.logDebug("DOMObserver 已停止")
  },

  /**
   * 更新配置
   * @param {Object} newConfig - 新的配置選項
   */
  updateConfig: function (newConfig) {
    this.config = { ...this.config, ...newConfig }

    // 重新創建節流函數
    if (this._isRunning) {
      this._throttledHandler = window.ThreadsDownloaderUtils.throttle(this._processDOMChanges.bind(this), this.config.throttleDelay)
      this._debouncedHandler = window.ThreadsDownloaderUtils.debounce(this._processDOMChanges.bind(this), this.config.debounceDelay)
    }
  },

  /**
   * 檢查是否正在運行
   * @returns {boolean}
   */
  isRunning: function () {
    return this._isRunning
  },
}
