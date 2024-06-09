chrome.runtime.onInstalled.addListener(() => {
  console.log("Extensioni Installation Complete");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "loadPreviousHighlights") {
    chrome.storage.local.get(['highlights'], (result) => {
    sendResponse({highlights: result.highlights});
  });
  return true; // Indicates that sendResponse will be called asynchronously
}
else if(message.action === "saveHighlights") {
  try {
    chrome.storage.local.set({highlights : message.highlights}, () => {
      sendResponse({ status: "Success" });
    });
  } 
  catch (error) {
    console.error("Could not Save Highlights:", error);
    sendResponse({ status: "Failure" });
  }
  return true; // Indicates that sendResponse will be called asynchronously
  }  
});