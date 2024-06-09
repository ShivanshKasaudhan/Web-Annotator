document.addEventListener('DOMContentLoaded',()=>{
  
  let userColor = "";

  const colors = document.querySelectorAll('.color');
  colors.forEach(color => {
    color.addEventListener('click', () => {
      userColor = window.getComputedStyle(color).backgroundColor;
      console.log('Selected color:', userColor);
      chrome.storage.local.set({userColor});
  
  
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length > 0) {
          console.log("Sending action to content script to updateColor");
          chrome.tabs.sendMessage(tabs[0].id, {action: "updateColor", userColor: userColor});
        } else {
          console.error("No active tab found");
        }
      });
  
    });
  });


document.getElementById('startButton').addEventListener('click', () => {
  chrome.storage.local.set({ userColor });

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length > 0) {
      console.log("Sending action to content script to start the highlighting");
      chrome.tabs.sendMessage(tabs[0].id, {action: "startHighlighting"});
    } else {
      console.error("No active tab found");
    }
  });
});



document.getElementById('saveButton').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length > 0) {
      console.log("Sending 'save' action to content script");
      chrome.tabs.sendMessage(tabs[0].id, {action: "saveHighlights"});
    } else {
      console.error("No active tab found");
    }
  });
});

document.getElementById('undoButton').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs.length > 0) {
      console.log("Sending 'undo' action to content script");
      chrome.tabs.sendMessage(tabs[0].id, {action: "undoHighlights"});
    } else {
      console.error("No active tab found");
    }
  });
});


const searchButton = document.getElementById('searchButton');
const exportButton = document.getElementById('exportButton');
const searchInput = document.getElementById('searchInput');


searchButton.addEventListener('click', function () {
  const query = searchInput.value;
  if (query === '') {
    alert('Please enter a search keyword.');
    return;
  }
    
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'search', query: query });
  });
  
});

exportButton.addEventListener('click', function () {
  console.log("You Clicked Export Button");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'export' });
  });
});


});
