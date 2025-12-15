// 媒體覆蓋按鈕模組 - 在媒體左下角顯示下載按鈕
window.ThreadsDownloaderOverlay = window.ThreadsDownloaderOverlay || {}

// 已處理的媒體元素（避免重複處理）
window.ThreadsDownloaderOverlay._processedMedia = window.ThreadsDownloaderOverlay._processedMedia || new WeakSet()

// 擴充功能上下文失效標誌
window.ThreadsDownloaderOverlay._contextInvalidated = false

// Debug 模式標誌（預設關閉）
window.ThreadsDownloaderOverlay._debugMode = false

/**
 * Debug 日誌函數
 */
function logDebug(...args) {
  if (window.ThreadsDownloaderOverlay._debugMode) {
    console.log("[Overlay]", ...args)
  }
}

/**
 * 主要入口：為所有媒體添加左下角下載按鈕
 */
window.ThreadsDownloaderOverlay.addMediaOverlayButtons = function () {
  if (window.ThreadsDownloaderOverlay._contextInvalidated) {
    return
  }

  logDebug("開始添加媒體覆蓋按鈕")
  window.ThreadsDownloaderOverlay.processVideos()
  window.ThreadsDownloaderOverlay.processImages()
}

// 以下函數已移至 media-extractor.js 統一管理：
// - detectMedia -> ThreadsMediaExtractor.extractVideo
// - detectImage -> ThreadsMediaExtractor.extractImage
// - getPosterFromVideo -> ThreadsMediaExtractor.extractPoster

/**
 * 檢查是否已有按鈕
 */
window.ThreadsDownloaderOverlay.hasExistingButton = function (container, dataAttr, value) {
  return container.querySelector(`.threads-overlay-btn[${dataAttr}='${value.replace(/'/g, "\\'")}']`)
}

/**
 * 處理所有影片元素
 */
window.ThreadsDownloaderOverlay.processVideos = function () {
  const videos = document.querySelectorAll("video")
  logDebug("找到影片元素數量:", videos.length)

  videos.forEach((video, index) => {
    if (window.ThreadsDownloaderOverlay._processedMedia.has(video)) {
      return
    }

    // 使用統一提取模組
    const mediaData = window.ThreadsMediaExtractor.extractVideo(video, { maxDepth: 8 })
    if (!mediaData) {
      logDebug(`影片 ${index} 無效，跳過`)
      return
    }

    const mediaContainer = window.ThreadsDownloaderOverlay.findMediaContainer(video)
    if (!mediaContainer) {
      logDebug(`影片 ${index} 找不到容器，跳過`)
      return
    }

    if (window.ThreadsDownloaderOverlay.hasExistingButton(mediaContainer, "data-video-src", mediaData.url)) {
      window.ThreadsDownloaderOverlay._processedMedia.add(video)
      return
    }

    window.ThreadsDownloaderOverlay.createOverlayButton(mediaContainer, mediaData)

    window.ThreadsDownloaderOverlay._processedMedia.add(video)
    logDebug(`影片 ${index} 成功添加按鈕`)
  })
}

/**
 * 處理所有圖片元素
 */
window.ThreadsDownloaderOverlay.processImages = function () {
  const pictures = document.querySelectorAll("picture")
  logDebug("找到 picture 元素數量:", pictures.length)

  pictures.forEach((picture, index) => {
    const img = picture.querySelector("img")
    if (!img || window.ThreadsDownloaderOverlay._processedMedia.has(img)) {
      return
    }

    // 使用統一提取模組
    const mediaData = window.ThreadsMediaExtractor.extractImage(picture)
    if (!mediaData) {
      logDebug(`圖片 ${index} 無效，跳過`)
      return
    }

    const mediaContainer = window.ThreadsDownloaderOverlay.findMediaContainer(picture)
    if (!mediaContainer) {
      logDebug(`圖片 ${index} 找不到容器，跳過`)
      return
    }

    if (window.ThreadsDownloaderOverlay.hasExistingButton(mediaContainer, "data-image-src", mediaData.url)) {
      window.ThreadsDownloaderOverlay._processedMedia.add(img)
      return
    }

    window.ThreadsDownloaderOverlay.createOverlayButton(mediaContainer, mediaData)

    window.ThreadsDownloaderOverlay._processedMedia.add(img)
    logDebug(`圖片 ${index} 成功添加按鈕`)
  })
}

/**
 * 找到適合放置覆蓋按鈕的媒體容器
 * 使用 ThreadsMediaPositionFinder 模組
 */
window.ThreadsDownloaderOverlay.findMediaContainer = function (element) {
  return window.ThreadsMediaPositionFinder.findMediaContainer(element)
}

/**
 * 創建覆蓋在媒體左下角的下載按鈕
 * @param {HTMLElement} container - 媒體容器
 * @param {Object} mediaInfo - 媒體資訊
 */
window.ThreadsDownloaderOverlay.createOverlayButton = function (container, mediaInfo) {
  const { findPostInfoFromElement, showPageNotification, i18n } = window.ThreadsDownloaderUtils

  logDebug("創建覆蓋按鈕，容器:", container.className, "媒體類型:", mediaInfo.type)

  // 檢查擴充功能上下文是否有效
  let downloadIconUrl
  try {
    downloadIconUrl = chrome.runtime.getURL("image/download-white.svg")
  } catch (error) {
    console.warn("Threads Downloader: 擴充功能上下文已失效")
    window.ThreadsDownloaderOverlay._contextInvalidated = true
    // 斷開 DOM 觀察器
    if (window.ThreadsDownloaderScanner && window.ThreadsDownloaderScanner._observer) {
      window.ThreadsDownloaderScanner._observer.disconnect()
    }
    return null
  }

  const btn = document.createElement("button")
  btn.className = "threads-overlay-btn"
  btn.innerHTML = `<img src="${downloadIconUrl}" alt="下載" style="width: 16px; height: 16px;">`
  btn.title = mediaInfo.type === "video" ? i18n("downloadVideo") : i18n("downloadImage")
  // 添加數據屬性以便識別
  if (mediaInfo.type === "video") {
    btn.setAttribute("data-video-src", mediaInfo.url)
  } else {
    btn.setAttribute("data-image-src", mediaInfo.url)
  }
  btn.style.cssText = `
    position: absolute;
    left: 12px;
    bottom: 12px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: white;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 9999;
    opacity: 0;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  `

  // 使用事件委派來處理 hover
  // 追蹤滑鼠是否在容器或按鈕上
  let isHovering = false

  const showButton = () => {
    isHovering = true
    btn.style.opacity = "1"
    btn.style.pointerEvents = "auto"
  }

  const hideButton = () => {
    isHovering = false
    // 稍微延遲隱藏，讓使用者有時間移動到按鈕上
    setTimeout(() => {
      if (!isHovering) {
        btn.style.opacity = "0"
        btn.style.pointerEvents = "none"
      }
    }, 100)
  }

  // 容器的 hover 事件
  container.addEventListener("mouseenter", showButton)
  container.addEventListener("mouseleave", hideButton)

  // 按鈕的 hover 事件（保持顯示）
  btn.addEventListener("mouseenter", () => {
    isHovering = true
    btn.style.background = "rgba(0, 0, 0, 0.5)"
    btn.style.transform = "scale(1.1)"
  })

  btn.addEventListener("mouseleave", () => {
    btn.style.background = "rgba(0, 0, 0, 0.3)"
    btn.style.transform = "scale(1)"
    hideButton()
  })

  // 點擊下載
  btn.addEventListener("click", (e) => {
    e.stopPropagation()
    e.preventDefault()

    // 先找到貼文容器（包含 /post/ 連結的容器）
    let postContainer = mediaInfo.element
    let depth = 0
    while (postContainer && depth < 20) {
      if (postContainer.querySelector && postContainer.querySelector('a[href*="/post/"]')) {
        break
      }
      postContainer = postContainer.parentElement
      depth++
    }

    // 計算此媒體在貼文中的索引
    let mediaIndex = 1
    if (postContainer && mediaInfo.element) {
      // 取得貼文中所有同類型的媒體
      const allMedia = mediaInfo.type === "video" ? postContainer.querySelectorAll("video") : postContainer.querySelectorAll("picture img")

      // 找出當前媒體的索引
      for (let i = 0; i < allMedia.length; i++) {
        if (allMedia[i] === mediaInfo.element) {
          mediaIndex = i + 1
          break
        }
      }
    }

    // 使用統一的檔名生成器
    const filename = window.ThreadsFilenameGenerator.generateFilenameFromElement({
      element: postContainer || mediaInfo.element,
      type: mediaInfo.type,
      index: mediaIndex,
      useTimestamp: true, // 覆蓋按鈕使用時間戳
      addPrefix: window.ThreadsDownloaderOverlay._enableFilenamePrefix !== false, // 從設定讀取
    })

    // 使用 Chrome Downloads API 下載
    chrome.runtime.sendMessage(
      {
        action: "downloadVideo",
        url: mediaInfo.url,
        filename: filename,
      },
      (response) => {
        if (response && response.success) {
          showPageNotification(i18n("downloadStarted", filename))
        } else {
          showPageNotification(i18n("downloadFailed", filename))
        }
      }
    )
  })

  container.appendChild(btn)
  return btn
}
