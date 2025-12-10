// 檔案名稱生成器模組 - 統一管理下載檔案的命名規則
window.ThreadsFilenameGenerator = window.ThreadsFilenameGenerator || {}

/**
 * 生成下載檔案的檔名
 * @param {Object} options - 檔名生成選項
 * @param {string} options.type - 媒體類型 ('video' 或 'image')
 * @param {number} options.index - 媒體索引 (1-based)
 * @param {Object} [options.postInfo] - 貼文資訊
 * @param {string} [options.postInfo.username] - 使用者名稱
 * @param {string} [options.postInfo.postId] - 貼文 ID
 * @param {boolean} [options.useTimestamp=false] - 無貼文資訊時是否使用時間戳
 * @returns {string} 生成的檔名
 * 
 * @example
 * // 有貼文資訊
 * generateFilename({
 *   type: 'video',
 *   index: 1,
 *   postInfo: { username: 'john', postId: 'ABC123' }
 * })
 * // 返回: '@john-ABC123-1.mp4'
 * 
 * @example
 * // 無貼文資訊，使用時間戳
 * generateFilename({
 *   type: 'image',
 *   index: 2,
 *   useTimestamp: true
 * })
 * // 返回: 'threads_image_1701234567890-2.jpg'
 * 
 * @example
 * // 無貼文資訊，不使用時間戳
 * generateFilename({
 *   type: 'video',
 *   index: 3
 * })
 * // 返回: 'threads_video_3.mp4'
 */
window.ThreadsFilenameGenerator.generateFilename = function (options) {
  const { type, index, postInfo, useTimestamp = false, addPrefix = true } = options

  // 決定副檔名
  const ext = type === "video" ? ".mp4" : ".jpg"
  
  // 決定前綴
  const prefix = addPrefix ? "threads_" : ""

  // 如果有完整的貼文資訊，使用標準格式
  if (postInfo && postInfo.username && postInfo.postId) {
    return `${prefix}${postInfo.username}-${postInfo.postId}-${index}${ext}`
  }

  // 如果沒有貼文資訊，根據設定決定是否使用時間戳
  if (useTimestamp) {
    return `${prefix}${type}_${Date.now()}-${index}${ext}`
  } else {
    return `${prefix}${type}_${index}${ext}`
  }
}

/**
 * 從元素中提取貼文資訊並生成檔名
 * 這是一個便捷方法，結合了貼文資訊提取和檔名生成
 * 
 * @param {Object} options - 選項
 * @param {HTMLElement} options.element - DOM 元素 (用於尋找貼文資訊)
 * @param {string} options.type - 媒體類型 ('video' 或 'image')
 * @param {number} options.index - 媒體索引
 * @param {boolean} [options.useTimestamp=false] - 無貼文資訊時是否使用時間戳
 * @returns {string} 生成的檔名
 */
window.ThreadsFilenameGenerator.generateFilenameFromElement = function (options) {
  const { element, type, index, useTimestamp = false, addPrefix = true } = options

  // 使用 utils 模組中的方法提取貼文資訊
  let postInfo = null
  if (window.ThreadsDownloaderUtils && window.ThreadsDownloaderUtils.findPostInfoFromElement) {
    postInfo = window.ThreadsDownloaderUtils.findPostInfoFromElement(element)
  }

  return window.ThreadsFilenameGenerator.generateFilename({
    type,
    index,
    postInfo,
    useTimestamp,
    addPrefix,
  })
}

/**
 * 生成 ZIP 壓縮檔的檔名
 * @param {Object} [postInfo] - 貼文資訊
 * @param {string} [postInfo.username] - 使用者名稱
 * @param {string} [postInfo.postId] - 貼文 ID
 * @param {boolean} [addPrefix=true] - 是否添加 threads_ 前綴
 * @param {string} [tabType='all'] - tab 類型 ('all', 'video', 'image')
 * @returns {string} ZIP 檔名
 * 
 * @example
 * // 有貼文資訊，全部
 * generateZipFilename({ username: 'john', postId: 'ABC123' }, true, 'all')
 * // 返回: 'threads_john-ABC123-all.zip'
 * 
 * @example
 * // 有貼文資訊，影片
 * generateZipFilename({ username: 'john', postId: 'ABC123' }, true, 'video')
 * // 返回: 'threads_john-ABC123-video.zip'
 * 
 * @example
 * // 有貼文資訊，相片
 * generateZipFilename({ username: 'john', postId: 'ABC123' }, true, 'image')
 * // 返回: 'threads_john-ABC123-image.zip'
 * 
 * @example
 * // 無貼文資訊
 * generateZipFilename(null, true, 'all')
 * // 返回: 'threads_all.zip'
 */
window.ThreadsFilenameGenerator.generateZipFilename = function (postInfo, addPrefix = true, tabType = 'all') {
  const prefix = addPrefix ? "threads_" : ""
  
  if (postInfo && postInfo.username && postInfo.postId) {
    return `${prefix}${postInfo.username}-${postInfo.postId}-${tabType}.zip`
  }
  
  return `${prefix}${tabType}.zip`
}
