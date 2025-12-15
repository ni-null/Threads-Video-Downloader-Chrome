(()=>{window.ThreadsDownloaderButton=window.ThreadsDownloaderButton||{};window.ThreadsDownloaderButton._processedPosts=window.ThreadsDownloaderButton._processedPosts||new WeakSet;window.ThreadsDownloaderButton._contextInvalidated=!1;window.ThreadsDownloaderButton._debugMode=!1;function T(r,t=null){return window.ThreadsDownloaderUtils?.i18n(r,t)||r}window.ThreadsDownloaderButton.addDownloadButtons=function(){if(window.ThreadsDownloaderButton._contextInvalidated)return;let r=0;window.ThreadsDownloaderButton.findAllPosts().forEach((a,u)=>{const{postContainer:o,isMainPost:e,parentPost:n}=a,d=window.ThreadsDownloaderButton.checkPostHasDirectMedia(o),s=window.ThreadsDownloaderButton._processedPosts.has(o);if(!d)return;const p=window.ThreadsDownloaderButton.findButtonContainer(o);if(!p)return;if(p.querySelector(".threads-download-wrapper")||p.querySelector(".threads-download-btn")){window.ThreadsDownloaderButton._processedPosts.add(o);return}if(window.ThreadsDownloaderButton._processedPosts.has(o))return;if(!window.ThreadsDownloaderButton.createDownloadButton(p,o)){window.ThreadsDownloaderButton._processedPosts.add(o);try{chrome.runtime.getURL("test")}catch{window.ThreadsDownloaderButton._contextInvalidated=!0,window.ThreadsDownloaderScanner&&window.ThreadsDownloaderScanner._observer&&window.ThreadsDownloaderScanner._observer.disconnect();return}return}window.ThreadsDownloaderButton._processedPosts.add(o),r++})};window.ThreadsDownloaderButton.findAllPosts=function(){const r=[],t=new Set,a="M15.6097 4.09082L6.65039 9.11104";return document.querySelectorAll("svg").forEach(o=>{if(!o.innerHTML.includes(a))return;const e=window.ThreadsDownloaderButton.findPostContainerFromElement(o);if(!e||t.has(e))return;t.add(e);const n=window.ThreadsDownloaderButton.findParentPost(e),d=!n;r.push({postContainer:e,isMainPost:d,parentPost:n})}),r};window.ThreadsDownloaderButton.findPostContainerFromElement=function(r){if(!r)return null;const t=r.closest("article")||r.closest('[role="article"]');if(t)return t;const a="M15.6097 4.09082L6.65039 9.11104";let u=r.parentElement,o=0;for(;u&&o<10;){if(Array.from(u.querySelectorAll("svg")).filter(n=>n.innerHTML.includes(a)).length===1&&(u.querySelector('video, picture, img[src*="cdninstagram"], img[src*="fbcdn"]')||u.innerText?.length>50))return u;u=u.parentElement,o++}return null};window.ThreadsDownloaderButton.findParentPost=function(r){if(!r||!r.parentElement)return null;let t=r.parentElement;for(;t&&t!==document.body;){if((t.tagName==="ARTICLE"||t.getAttribute("role")==="article")&&t!==r)return t;t=t.parentElement}return null};window.ThreadsDownloaderButton.checkPostHasDirectMedia=function(r){if(!r)return!1;const t=Array.from(r.querySelectorAll('article, [role="article"]')).filter(e=>e!==r),a=e=>t.some(n=>n.contains(e)),u=r.querySelectorAll("video");for(const e of u)if(!a(e)){const n=e.src||e.currentSrc||e.querySelector("source")?.src;if(n&&n!=="about:blank")return!0}const o=r.querySelectorAll("picture");for(const e of o)if(!a(e)){const n=e.querySelector("img");if(n){const d=n.src||n.getAttribute("data-src");if(d&&(d.includes("cdninstagram")||d.includes("fbcdn"))&&(n.naturalWidth===0||n.naturalWidth>100&&n.naturalHeight>100))return!0}}return!1};window.ThreadsDownloaderButton.findButtonContainer=function(r){if(!r)return null;const t="M15.6097 4.09082L6.65039 9.11104",a=Array.from(r.querySelectorAll('article, [role="article"]')).filter(e=>e!==r),u=e=>a.some(n=>n.contains(e)),o=r.querySelectorAll("svg");for(const e of o){if(!e.innerHTML.includes(t)||u(e))continue;let n=null;const d=e.closest('div[role="button"]');if(d&&(n=d.parentElement),!n){const s=e.closest("button");s&&(n=s.parentElement)}if(!n){let s=e.parentElement,p=0;for(;s&&p<3;){if(s.children.length>=3){n=s;break}s=s.parentElement,p++}}if(n)return n}return null};window.ThreadsDownloaderButton.createDownloadButton=function(r,t){const a=document.createElement("div");a.className="threads-download-wrapper",a.style.cssText=`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 6px;
  `;let u;try{u=chrome.runtime.getURL("image/download-black.svg")}catch{return null}const o=document.createElement("button");o.className="threads-download-btn",o.innerHTML=`<img src="${u}" alt="${T("downloadVideo")}" style="width: 18px; height: 18px; vertical-align: middle;">`,o.title=T("downloadVideo"),o.style.cssText=`
    padding: 6px 10px;
    border-radius: 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
  `,o.addEventListener("mouseenter",()=>{o.style.background="#F5F5F5"}),o.addEventListener("mouseleave",()=>{o.style.background="transparent"});const e=document.createElement("div");e.className="threads-download-menu",e.style.cssText=`
    display: none;
    position: fixed;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999999;
    padding: 8px 0;
    max-height: 400px;
    overflow-y: auto;
  `,o.addEventListener("click",s=>{if(s.stopPropagation(),document.querySelectorAll(".threads-download-menu").forEach(p=>{p!==e&&(p.style.display="none")}),e.style.display==="none"){const p=window.ThreadsDownloaderButton.extractMediaFromPost(t);window.ThreadsDownloaderButton.updateDownloadMenu(e,p);const m=o.getBoundingClientRect();e.style.top=m.bottom+4+"px",e.style.left=m.left+"px",e.style.display="block"}else e.style.display="none"}),a.appendChild(o),a.appendChild(e),r.parentElement.appendChild(a),document.body.appendChild(e);let n;const d=()=>{if(e.style.display==="block"){const s=o.getBoundingClientRect();e.style.top=s.bottom+4+"px",e.style.left=s.left+"px"}};return window.addEventListener("scroll",()=>{clearTimeout(n),n=setTimeout(d,10)},!0),document.addEventListener("click",s=>{!a.contains(s.target)&&!e.contains(s.target)&&(e.style.display="none")}),a};window.ThreadsDownloaderButton.extractMediaFromPost=function(r){return window.ThreadsMediaExtractor.extractFromPost(r)};window.ThreadsDownloaderButton.extractVideosFromPost=function(r){return window.ThreadsDownloaderButton.extractMediaFromPost(r).videos};window.ThreadsDownloaderButton.updateDownloadMenu=function(r,t){const{i18n:a}=window.ThreadsDownloaderUtils;window.ThreadsDownloaderUtils._messages,r.innerHTML="";const u=t.videos.length+t.images.length;if(u===0){const l=document.createElement("div");l.className="threads-menu-no-media",l.textContent=a("noMedia"),l.style.cssText=`
      padding: 12px 16px;
      color: #666;
      font-size: 14px;
      text-align: center;
    `,r.appendChild(l);return}const o=document.createElement("div");o.className="threads-menu-tab-header",o.style.cssText=`
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid #eee;
    padding: 0 8px;
  `;const e=document.createElement("div");e.className="threads-menu-tabs",e.style.cssText=`
    display: flex;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
  `;const n=document.createElement("button");n.className="threads-menu-info-btn",n.title="\u61C9\u7528\u7A0B\u5F0F\u8CC7\u8A0A";let d="";try{d=chrome.runtime.getURL("image/info-circle-svgrepo-com.svg")}catch{d=""}n.innerHTML=d?`<img src="${d}" alt="info" style="width: 20px; height: 20px;">`:"\u24D8",n.style.cssText=`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    padding: 8px 12px;
    transition: color 0.2s;
    flex-shrink: 0;
  `,n.addEventListener("mouseenter",()=>{n.style.color="#667eea"}),n.addEventListener("mouseleave",()=>{n.style.color="#666"}),n.addEventListener("click",l=>{l.stopPropagation(),window.ThreadsModalInfo.showModal()});const s=[];s.push({id:"all",label:a("tabAll",String(u)),filter:"all"}),t.videos.length>0&&s.push({id:"videos",label:a("tabVideos",String(t.videos.length)),filter:"video"}),t.images.length>0&&s.push({id:"images",label:a("tabImages",String(t.images.length)),filter:"image"});let p="all";const m=document.createElement("div");m.className="threads-menu-content",m.style.cssText=`
    max-height: 350px;
    overflow-y: auto;
  `;const g=l=>{m.innerHTML="";let c=[];if(l==="all"?c=[...t.videos,...t.images]:l==="video"?c=t.videos:l==="image"&&(c=t.images),c.length>=1){const i=document.createElement("div");i.className="threads-download-all-btn";let w="";try{w=chrome.runtime.getURL("image/package-white.svg")}catch{}i.style.cssText=`
        margin: 8px;
        padding: 12px 16px;
        background: #000;
        color: white;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      `,i.innerHTML=`<img src="${w}" alt="package" style="width: 20px; height: 20px;"> ${a("downloadAll",String(c.length))}`,i.addEventListener("click",async h=>{h.stopPropagation(),await window.ThreadsDownloaderButton.downloadAllAsZip(c,i,l)}),m.appendChild(i)}if(c.length===0){const i=document.createElement("div");i.className="threads-menu-empty",i.textContent=a(l==="video"?"noVideos":l==="image"?"noImages":"noMedia"),i.style.cssText=`
        padding: 20px;
        text-align: center;
        color: #999;
        font-size: 14px;
      `,m.appendChild(i);return}c.forEach(i=>{window.ThreadsDownloaderButton.createMediaItem(m,i,r)})};s.forEach(l=>{const c=document.createElement("div");c.className=`threads-menu-tab threads-menu-tab-${l.id}`,c.textContent=l.label,c.style.cssText=`
      padding: 10px 16px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
      color: #666;
      user-select: none;
      white-space: nowrap;
      flex-shrink: 0;
    `,l.id===p&&(c.style.color="#667eea",c.style.borderBottomColor="#667eea"),c.addEventListener("mouseenter",()=>{l.id!==p&&(c.style.color="#333")}),c.addEventListener("mouseleave",()=>{l.id!==p&&(c.style.color="#666")}),c.addEventListener("click",i=>{i.stopPropagation(),p=l.id,Array.from(e.children).forEach((w,h)=>{s[h].id===p?(w.style.color="#667eea",w.style.borderBottomColor="#667eea"):(w.style.color="#666",w.style.borderBottomColor="transparent")}),g(l.filter)}),e.appendChild(c)}),o.appendChild(e),o.appendChild(n),r.appendChild(o),r.appendChild(m),g("all")};window.ThreadsDownloaderButton.createMediaItem=function(r,t,a){const{findPostInfoFromElement:u}=window.ThreadsDownloaderUtils;let o;try{o=chrome.runtime.getURL("image/download-white.svg")}catch{return null}const e=window.ThreadsFilenameGenerator.generateFilenameFromElement({element:t.postContainer||t.element,type:t.type,index:t.index,useTimestamp:!1,addPrefix:window.ThreadsDownloaderButton._enableFilenamePrefix!==!1}),n=document.createElement("div");n.className=`threads-menu-item threads-menu-item-${t.type}`,n.style.cssText=`
    padding: 10px 16px;
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;
  `;const d=document.createElement("div");d.className="threads-item-thumbnail",d.style.cssText=`
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    cursor: pointer;
  `;const s=document.createElement("div");s.className="threads-preview-overlay",s.style.cssText=`
    display: none;
    position: fixed;
    z-index: 9999999;
    pointer-events: none;
  `;let p;d.addEventListener("mouseenter",i=>{p=setTimeout(()=>{const w=d.getBoundingClientRect();if(s.innerHTML="",t.type==="video"){const f=document.createElement("video");f.src=t.url,f.autoplay=!0,f.loop=!0,f.muted=!0,f.style.cssText=`
          max-width: 400px;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          background: #000;
        `,s.appendChild(f)}else{const f=document.createElement("img");f.src=t.url,f.style.cssText=`
          max-width: 400px;
          max-height: 400px;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        `,s.appendChild(f)}const h=w.right+10,x=w.bottom;h+400>window.innerWidth?s.style.left=w.left-410+"px":s.style.left=h+"px",s.style.bottom=window.innerHeight-x+"px",s.style.top="auto",s.style.display="block",document.body.appendChild(s)},300)}),d.addEventListener("mouseleave",()=>{clearTimeout(p),s.style.display="none",s.parentElement&&document.body.removeChild(s)});const m=t.type==="video"?t.poster||"":t.thumbnail;if(m){const i=document.createElement("img");i.src=m,i.style.cssText=`
      width: 100%;
      height: 100%;
      object-fit: cover;
    `,d.appendChild(i),n.appendChild(d)}else{const i=document.createElement("span");i.textContent=t.type==="video"?"\u{1F3AC}":"\u{1F5BC}\uFE0F",i.style.fontSize="20px",d.appendChild(i),n.appendChild(d)}const g=document.createElement("span");g.className="threads-item-label",g.style.cssText=`
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    display: flex;
    align-items: center;
  `,g.title=e;const l=e.lastIndexOf(".");if(l>0){const i=e.substring(0,l),w=e.substring(l),h=document.createElement("span");h.textContent=i,h.style.cssText=`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex-shrink: 1;
    `;const x=document.createElement("span");x.textContent=w,x.style.cssText=`
      flex-shrink: 0;
      white-space: nowrap;
    `,g.appendChild(h),g.appendChild(x)}else g.textContent=e,g.style.cssText+=`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;n.appendChild(g);const c=document.createElement("span");return c.className="threads-item-download-icon",c.innerHTML=`<img src="${o}" alt="\u4E0B\u8F09" style="width: 12px; height: 12px;">`,n.appendChild(c),n.addEventListener("mouseenter",()=>{n.style.background="#f5f5f5"}),n.addEventListener("mouseleave",()=>{n.style.background="transparent"}),n.addEventListener("click",i=>{i.stopPropagation(),chrome.runtime.sendMessage({action:"downloadVideo",url:t.url,filename:e},w=>{if(w&&w.success){n.style.background="#e8f5e9",c.textContent="\u2705";const{showPageNotification:h,i18n:x}=window.ThreadsDownloaderUtils;let f="";try{f=chrome.runtime.getURL("image/download-white.svg")}catch{}h(`<img src="${f}" alt="download" style="width: 16px; height: 16px;"> ${x("downloadStarted",e)}`),setTimeout(()=>{n.style.background="transparent",c.innerHTML=`<img src="${f}" alt="\u4E0B\u8F09" style="width: 12px; height: 12px;">`},1500)}else{n.style.background="#ffebee",c.textContent="\u274C";const{showPageNotification:h,i18n:x}=window.ThreadsDownloaderUtils;h(x("downloadFailed",e)),setTimeout(()=>{n.style.background="transparent",c.textContent="\u2B07\uFE0F"},2e3)}}),a.style.display="none"}),r.appendChild(n),n};window.ThreadsDownloaderButton.downloadAllAsZip=async function(r,t,a="all"){const{findPostInfoFromElement:u,showPageNotification:o,i18n:e}=window.ThreadsDownloaderUtils;if(typeof JSZip>"u"){o("\u274C "+e("jsZipNotLoaded"));return}const n=t.innerHTML;t.style.pointerEvents="none",t.style.opacity="0.7";let d="";try{d=chrome.runtime.getURL("image/package-white.svg")}catch{}try{const s=new JSZip;let p=0;const m=r.length,g=u(r[0].postContainer||r[0].element),l=window.ThreadsFilenameGenerator.generateZipFilename(g,window.ThreadsDownloaderButton._enableFilenamePrefix!==!1,a);t.innerHTML=`\u23F3 ${e("downloadProgress",["0",String(m)])}`;for(let h=0;h<r.length;h++){const x=r[h],f=window.ThreadsFilenameGenerator.generateFilename({type:x.type,index:x.index,postInfo:g,useTimestamp:!1,addPrefix:window.ThreadsDownloaderButton._enableFilenamePrefix!==!1});try{const y=await fetch(x.url);if(!y.ok)throw new Error(`HTTP ${y.status}`);const v=await y.blob();s.file(f,v),p++,t.innerHTML=`\u23F3 ${e("downloadProgress",[String(p),String(m)])}`}catch(y){console.error(`\u4E0B\u8F09\u5931\u6557: ${f}`,y)}}if(p===0)throw new Error(e("allFilesFailed"));t.innerHTML=`\u{1F4E6} ${e("packaging")}`;const c=await s.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}}),i=URL.createObjectURL(c),w=document.createElement("a");w.href=i,w.download=l,w.style.display="none",document.body.appendChild(w),w.click(),document.body.removeChild(w),URL.revokeObjectURL(i),t.innerHTML=`<img src="${d}" alt="package" style="width: 20px; height: 20px;"> ${e("completed",[String(p),String(m)])}`,o(`<img src="${d}" alt="package" style="width: 16px; height: 16px;"> ${e("zipDownloaded",[String(p),l])}`),setTimeout(()=>{t.innerHTML=n,t.style.pointerEvents="auto",t.style.opacity="1"},2e3)}catch(s){console.error("\u6253\u5305\u4E0B\u8F09\u5931\u6557:",s),t.innerHTML=`\u274C ${e("failed")}`,o("\u274C "+e("zipFailed",s.message)),setTimeout(()=>{t.innerHTML=n,t.style.pointerEvents="auto",t.style.opacity="1"},2e3)}};window.ThreadsDownloaderButton.downloadVideoFromPage=function(r,t){const{showPageNotification:a,i18n:u}=window.ThreadsDownloaderUtils,o=document.createElement("a");o.href=r,o.download=t,o.style.display="none",document.body.appendChild(o),o.click(),document.body.removeChild(o),a(u("downloadStarted",t))};})();
