let userColor = '';
let highlights = [];
let ClickTime;
let popup = null;

function handleMouseUpandStartHighlighting(e) {
  clearTimeout(ClickTime);
  // handleMouseUp is triggered, setting a timeout to call startHighlighting after 200 milliseconds.
  ClickTime = setTimeout(() => {startHighlighting();}, 200); 
}


function handleMouseDownandClosePopup(e) {
  clearTimeout(ClickTime); // Cancel the ClickTime timeout to prevent the prompt from appearing
  closePopup(); // Close the popup when the user starts selecting text
}

function closePopup() {
  if (popup) {
    popup.close();
    popup = null;
  }
}

function Highlight_with_userColor(userColor,notes) {
  let selection = window.getSelection();
  if (selection.rangeCount > 0) {
    let range = selection.getRangeAt(0);
    let span = document.createElement('span');
    span.style.backgroundColor = userColor;
    span.setAttribute('highlight-id', Date.now()); // Assigning a unique identifier
    range.surroundContents(span);
    
    highlights.push({ 
      span: span.outerHTML, 
      range: range.toString(), 
      userColor: userColor, 
      id: span.getAttribute('highlight-id'),
      note: notes,
    });
  }      
}
      
function startHighlighting() {
  console.log("again!");
  let note = prompt("Enter a note for this highlight:");
  Highlight_with_userColor(userColor,note);
}
        
function loadPreviousHighlights() {
  chrome.runtime.sendMessage({ action: "loadPreviousHighlights" }, (response) => {
    if (response && response.highlights) {
      highlights = response.highlights;
        reload();
    }
  });
}
  
function reload() {
  highlights.forEach(highlight => {
  let span = document.createElement('span');
  span.innerHTML = highlight.range;
  span.style.backgroundColor = highlight.userColor;
  span.setAttribute('highlight-id', highlight.id);
  let bodyText = document.body.innerHTML;
  let highlightedText = bodyText.replace(highlight.range, span.outerHTML);
  document.body.innerHTML = highlightedText;
});
}
      
function saveHighlights() {
  chrome.runtime.sendMessage({ action: "saveHighlights", highlights: highlights }, (response) => {
  if (response && response.status === "Success") {alert("Annotations Saved!");}
  });
}
            
function undoHighlights() {
  if (highlights.length > 0) {
    const lastHighlightedContent = highlights.pop();
    const span = document.querySelector(`span[highlight-id="${lastHighlightedContent.id}"]`);
  if (span) {
    span.replaceWith(document.createTextNode(span.textContent));
  }
  reload();
}}
      
// Create and append the canvas element to the body
  function initiate(){
  canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  canvas.addEventListener('mouseup', handleMouseUpandStartHighlighting);
  document.addEventListener('mousedown', handleMouseDownandClosePopup);

  // Load saved Previous Highlights
  loadPreviousHighlights();
}
      
initiate();


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // console.log("Received message:", message);

  if (message.action === "startHighlighting") {
    document.addEventListener('mouseup', handleMouseUpandStartHighlighting);
    document.addEventListener('click', (event) => {
      if (event.target.tagName === 'SPAN' && event.target.hasAttribute('highlight-id')) {
        let highlightId = event.target.getAttribute('highlight-id');
        let highlight = highlights.find(h => h.id === highlightId);
        if (highlight && highlight.note) {
          alert(`Note: ${highlight.note}`);
        }
      }
    });
  }



  else if (message.action === "updateColor") {
    console.log("Setting color to", message.color);
    userColor = message.userColor;
  } 


  else if (message.action === "saveHighlights") {
    saveHighlights();
  } 

    else if (message.action === "undoHighlights") {
      undoHighlights();
    }

    
    else if (message.action === "search") {
      const query = message.query;
      if(query === ''){
        alert("Enter Valid Annoatation");
      }
      else{
        // Retrieving highlights from storage
        chrome.storage.local.get('highlights', function (data) {
          const storedHighlights = data.highlights;

          if(storedHighlights && storedHighlights.length === 0){
            alert('No annotations found matching your search.');
            return;
          }


          let results = [];     // to store the matching higlights

          storedHighlights.forEach(highlight => {
            if (highlight.note && highlight.note.toLowerCase().includes(query)) {
                results.push(highlight.range);
            } else {
                console.log("Skipping highlight:", highlight);
            }
        });

          if (results  && results.length === 0) {
            alert('No annotations found matching your search.');
          }
          else{
            // Creating an ordered list string
              let listString = '';
              results.forEach((result, index) => {
                  listString += `${index + 1}. ${result}\n`;
              });

              // Displaying the ordered list in an alert
              alert(`Highlights matching to your query are :\n${listString}`);
          }

        });
    
        // Returning true to indicate that sendResponse will be called asynchronously
        return true;
      }
    }

  else if(message.action === 'export'){
    alert("Export Started");
    // Retrieve highlights from storage
    chrome.storage.local.get('highlights', function(data) {
      const storedHighlights = data.highlights;

    let results = []; 
    if(storedHighlights && storedHighlights.length > 0){
        storedHighlights.forEach(highlight => {
          results.push(highlight.range);
      });
    }
    console.log(results);
    
    const orderedResult = results.map((item, index) => `${index + 1}. ${item}`).join('\n');

    const blob = new Blob([orderedResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'data.txt';
    anchor.click();
    URL.revokeObjectURL(url);

    });
  }
});