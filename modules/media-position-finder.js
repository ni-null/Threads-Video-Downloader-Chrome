// 媒體元素位置查找模組 - 負責尋找適合放置覆蓋按鈕的容器
window.ThreadsMediaPositionFinder = window.ThreadsMediaPositionFinder || {}

/**
 * 檢查是否為 Threads 媒體容器
 * @param {HTMLElement} element - 要檢查的元素
 * @returns {boolean} 是否為 Threads 媒體容器
 */
window.ThreadsMediaPositionFinder.isThreadsMediaContainer = function (element) {
  const styleStr = element.style.cssText || ""
  return (styleStr.includes("--x-borderRadius") || styleStr.includes("--x-aspectRatio")) && element.offsetWidth > 100 && element.offsetHeight > 50
}

/**
 * 檢查是否為 Grid 輪播容器
 * @param {HTMLElement} element - 要檢查的元素
 * @returns {boolean} 是否為 Grid 輪播容器
 */
window.ThreadsMediaPositionFinder.isGridContainer = function (element) {
  return element.style.cssText.includes("--x-gridTemplateColumns")
}

/**
 * 確保容器有 position: relative
 * @param {HTMLElement} container - 要設定的容器
 */
window.ThreadsMediaPositionFinder.ensureRelativePosition = function (container) {
  if (window.getComputedStyle(container).position === "static") {
    container.style.position = "relative"
  }
}

/**
 * 找最近的 Threads 媒體容器或 Grid 容器
 * @param {HTMLElement} element - 起始元素
 * @param {number} maxDepth - 最大搜索深度
 * @returns {Object} 返回 {container, gridParent, depth}
 */
window.ThreadsMediaPositionFinder.findThreadsContainer = function (element, maxDepth = 15) {
  let parent = element.parentElement
  let depth = 0

  while (parent && depth < maxDepth) {
    if (window.ThreadsMediaPositionFinder.isGridContainer(parent)) {
      return { container: null, gridParent: parent, depth }
    }
    if (window.ThreadsMediaPositionFinder.isThreadsMediaContainer(parent)) {
      return { container: parent, gridParent: null, depth }
    }
    parent = parent.parentElement
    depth++
  }
  return { container: null, gridParent: null, depth }
}

/**
 * 找備用容器（position:relative 或 borderRadius）
 * @param {HTMLElement} element - 起始元素
 * @param {number} maxDepth - 最大搜索深度
 * @returns {Object} 返回 {container, depth}
 */
window.ThreadsMediaPositionFinder.findFallbackContainer = function (element, maxDepth = 15) {
  let parent = element.parentElement
  let depth = 0

  while (parent && depth < maxDepth) {
    const style = window.getComputedStyle(parent)
    if (parent.offsetWidth > 100 && parent.offsetHeight > 100) {
      if (style.position === "relative" || style.position === "absolute" || (style.borderRadius && style.borderRadius !== "0px")) {
        return { container: parent, depth }
      }
    }
    parent = parent.parentElement
    depth++
  }
  return { container: null, depth: -1 }
}

/**
 * 找到適合放置覆蓋按鈕的媒體容器
 * 這是主要的入口函數，按優先級搜索合適的容器：
 * 1. Threads 專用容器（有特定 CSS 變數）
 * 2. Grid 容器的子容器
 * 3. 備用容器（有 position 或 borderRadius）
 * 4. 直接父容器
 * 
 * @param {HTMLElement} element - 媒體元素（video 或 img）
 * @returns {HTMLElement|null} 找到的容器元素，如果找不到返回 null
 */
window.ThreadsMediaPositionFinder.findMediaContainer = function (element) {
  if (!element) return null

  // 第一步：查找 Threads 容器或 Grid 容器
  const { container, gridParent } = window.ThreadsMediaPositionFinder.findThreadsContainer(element)

  if (container) {
    window.ThreadsMediaPositionFinder.ensureRelativePosition(container)
    return container
  }

  // 第二步：如果找到 Grid 容器，往下找直接子容器
  if (gridParent) {
    const { container: fallback } = window.ThreadsMediaPositionFinder.findFallbackContainer(element, 10)
    if (fallback && fallback !== gridParent) {
      window.ThreadsMediaPositionFinder.ensureRelativePosition(fallback)
      return fallback
    }
  }

  // 第三步：查找備用容器
  const { container: fallback } = window.ThreadsMediaPositionFinder.findFallbackContainer(element)
  if (fallback) {
    window.ThreadsMediaPositionFinder.ensureRelativePosition(fallback)
    return fallback
  }

  // 第四步：使用直接父容器
  if (element.parentElement) {
    window.ThreadsMediaPositionFinder.ensureRelativePosition(element.parentElement)
    return element.parentElement
  }

  return null
}
