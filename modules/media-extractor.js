// 媒體提取模組 - 統一處理影片和圖片的提取邏輯
window.ThreadsMediaExtractor = window.ThreadsMediaExtractor || {}

/**
 * 從影片元素提取資訊
 * @param {HTMLVideoElement} videoElement - 影片元素
 * @param {Object} options - 選項 {maxDepth: number}
 * @returns {Object|null} - {url, poster, element, type} 或 null
 */
window.ThreadsMediaExtractor.extractVideo = function (videoElement, options = {}) {
  if (!videoElement) return null

  const src = videoElement.src || videoElement.currentSrc || videoElement.querySelector("source")?.src

  if (!src || src === "about:blank") {
    return null
  }

  return {
    url: src,
    poster: this.extractPoster(videoElement, options),
    element: videoElement,
    type: "video",
  }
}

/**
 * 從圖片元素提取資訊
 * @param {HTMLElement} pictureElement - picture 元素或 img 元素
 * @returns {Object|null} - {url, thumbnail, element, type} 或 null
 */
window.ThreadsMediaExtractor.extractImage = function (pictureElement) {
  if (!pictureElement) return null

  const img = pictureElement.tagName === "IMG" ? pictureElement : pictureElement.querySelector("img")
  if (!img) return null

  const imgUrl = img.src || img.getAttribute("data-src")

  // 驗證圖片 URL
  if (!imgUrl || (!imgUrl.includes("cdninstagram") && !imgUrl.includes("fbcdn"))) {
    return null
  }

  // 驗證圖片尺寸（排除小圖標）
  if (img.naturalWidth > 0 && (img.naturalWidth <= 100 || img.naturalHeight <= 100)) {
    return null
  }

  return {
    url: imgUrl,
    thumbnail: imgUrl,
    element: img,
    type: "image",
  }
}

/**
 * 統一的縮圖提取邏輯
 * @param {HTMLVideoElement} videoElement - 影片元素
 * @param {Object} options - 選項 {maxDepth: number}
 * @returns {string} - 縮圖 URL
 */
window.ThreadsMediaExtractor.extractPoster = function (videoElement, options = {}) {
  const maxDepth = options.maxDepth || 12
  let poster = videoElement.poster || ""

  if (!poster) {
    let searchContainer = videoElement.parentElement
    let depth = 0

    while (searchContainer && depth < maxDepth && !poster) {
      const imgs = searchContainer.querySelectorAll("img")

      for (const img of imgs) {
        const imgSrc = img.src || ""
        if (!imgSrc || (!imgSrc.includes("fbcdn.net") && !imgSrc.includes("cdninstagram"))) {
          continue
        }

        // 優先級 1: 標準縮圖格式 (.jpg 且包含 t51.2885)
        if (imgSrc.includes(".jpg") && imgSrc.includes("t51.2885")) {
          poster = imgSrc
          break
        }

        // 優先級 2: 任何 fbcdn 圖片
        if (imgSrc.includes("fbcdn.net")) {
          poster = imgSrc
          break
        }

        // 優先級 3: 任何 cdninstagram 圖片
        if (imgSrc.includes("cdninstagram")) {
          poster = imgSrc
          // 繼續尋找更好的選擇
        }
      }

      searchContainer = searchContainer.parentElement
      depth++
    }
  }

  return poster
}

/**
 * 從貼文容器提取所有媒體（影片和圖片）
 * @param {HTMLElement} postContainer - 貼文容器
 * @returns {Object} - {videos: Array, images: Array}
 */
window.ThreadsMediaExtractor.extractFromPost = function (postContainer) {
  if (!postContainer) {
    return { videos: [], images: [] }
  }

  // 找出所有嵌套的子貼文（避免提取子貼文的媒體）
  const nestedPosts = Array.from(postContainer.querySelectorAll('article, [role="article"]')).filter((article) => article !== postContainer)

  // 檢查元素是否屬於子貼文
  const isElementInNestedPost = (element) => {
    return nestedPosts.some((nestedPost) => nestedPost.contains(element))
  }

  // 提取影片
  const videoElements = Array.from(postContainer.querySelectorAll("video")).filter((video) => !isElementInNestedPost(video))

  const videos = videoElements
    .map((video, index) => {
      const videoData = this.extractVideo(video)
      if (!videoData) return null

      return {
        ...videoData,
        index: index + 1,
        postContainer: postContainer,
      }
    })
    .filter(Boolean)

  // 提取圖片
  const pictureElements = Array.from(postContainer.querySelectorAll("picture")).filter((picture) => !isElementInNestedPost(picture))

  const images = pictureElements
    .map((picture, index) => {
      const imageData = this.extractImage(picture)
      if (!imageData) return null

      return {
        ...imageData,
        index: index + 1,
        postContainer: postContainer,
      }
    })
    .filter(Boolean)

  return { videos, images }
}
