// Threads Video Downloader - Background Script
// 處理跨域下載和檔名設定

// 監聽來自 content script 的下載請求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadVideo') {
    // 使用 Chrome Downloads API 下載影片（支援跨域）
    chrome.downloads.download({
      url: request.url,
      filename: `Threads/${request.filename}`,
      saveAs: false
    }, (downloadId) => {
      if (downloadId) {
        console.log('Download started:', downloadId, 'Filename:', request.filename);
        sendResponse({ success: true, downloadId: downloadId });
      } else if (chrome.runtime.lastError) {
        console.error('Download failed:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      }
    });
    
    return true; // 保持消息通道開啟以進行異步回應
  }
});

console.log('Threads Downloader background script loaded');
