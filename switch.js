
/*let footer = `<div id="footer">
                <button id="wButton" class="button">W</button>
                <button id="eButton" class="button light">E</button>
              </div>`
*/
// Function to toggle button classes and invert images
function toggleButton(buttonId) {
  // Toggle button colors
  var buttons = ['wButton', 'eButton', 'tButton', 'sButton'];
  buttons.forEach(function(button) {
    if (button === buttonId) {
      document.getElementById(button).classList.remove('light');
    } else {
      document.getElementById(button).classList.add('light');
    }
    var buttonImage = document.getElementById(button).querySelector('img');
    if (buttonImage) {
      if (button === buttonId) {

        // If the button is clicked, invert the image
        buttonImage.style.filter = 'invert(90%)'; // Adjust brightness as needed
      }else {
        // If the button is not clicked, remove the filter
        buttonImage.style.filter = '';
      }
    }
  });
}
//Jared's Phrases to Ignore: 
//sr, senior, III, manager,IV, VI, director, coop,co-opprincipal, lead, head,field, technician
document.getElementById('openNewTabButton').addEventListener('click', function() {
  window.open(window.location.href, '_blank');
});
document.addEventListener('DOMContentLoaded', function() {
  // List of button IDs
  var buttonIds = ['wButton', 'eButton', 'tButton', 'sButton'];

  // Load the footer HTML file
  fetch('../footer.html')
      .then(response => response.text())
      .then(html => {
          // Create a temporary div element to hold the HTML content
          var tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;

          // Extract the footer element
          var footer = tempDiv.querySelector('#footer');
          // Add event listeners to each button
          buttonIds.forEach(function(buttonId) {
              var button = document.getElementById(buttonId);
              button.addEventListener('click', function() {
                  console.log(buttonId.charAt(0).toUpperCase() + "Button");
                  loadDifferentHTML(buttonId, footer);
              });
          });
      })
      .catch(error => console.error('Error loading footer HTML:', error));
});

function loadDifferentHTML(letter, footer) {
  // Load the different HTML file dynamically
  if (letter === "eButton") {
      file = "../emailTab/popdown.html";
  } else if (letter === "wButton") {
      file = "../websiteTab/popup.html";
  } else if (letter === "tButton") {
      file = "../tutorialTab/data.html";
  } else if (letter === "sButton") {
      file = "../settingsTab/data.html";
  } else {
      console.log("Not A Button");
  }

  fetch(file)
      .then(response => response.text())
      .then(html => {
          // Replace the current HTML content with the content from the different HTML file
          document.body.innerHTML = html;
          // Append the footer back to the body
          var existingFooter = document.getElementById('footer');
          if (!existingFooter) {
              // If footer doesn't exist, append it to the body
              document.body.appendChild(footer);
          }
          toggleButton(letter);
          const scriptElement = document.createElement('script');
          scriptElement.src = "../switch.js";
          document.body.appendChild(scriptElement);
          // Load scripts if needed
          if (letter === "eButton") {
              let sList = ['dictParse.js', 'glassdoorParse.js', 'getroParse.js','googleSheetsIntegration.js', 'indeedParse.js', 'linkedinParse.js', 'smallFunctions.js', 'channelContents.js']
              sList.forEach(fileName => {
                  const scriptElement = document.createElement('script');
                  scriptElement.src = `/emailTab/${fileName}`;
                  document.body.appendChild(scriptElement);
              });
          }
          if (letter === "wButton") {
              let eList = ["new_analysis.js"]
              eList.forEach(fileName => {
                  const scriptElement = document.createElement('script');
                  scriptElement.src = `/websiteTab/${fileName}`;
                  document.body.appendChild(scriptElement);
              });
          }
          if (letter === "sButton") {
              const scriptElement = document.createElement('script');
              scriptElement.src = "/settingsTab/preferences.js";
              document.body.appendChild(scriptElement);
          }
          // Reattach event listeners for buttons
          attachEventListeners();
      })
      .catch(error => console.error('Error loading different HTML:', error));
}

function attachEventListeners() {
  // List of button IDs
  var buttonIds = ['wButton', 'eButton', 'tButton', 'sButton'];

  // Add event listeners to each button
  buttonIds.forEach(function(buttonId) {
      var button = document.getElementById(buttonId);
      button.addEventListener('click', function() {
          console.log(buttonId.charAt(0).toUpperCase());
          loadDifferentHTML(buttonId, footer);
      });
  });
}


function updateCircle() {
  const circle = document.querySelector(".circle");
  const keywords = ["workday", "workforcenow", "eightfold", "ultipro"];

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      // Check if the URL contains any of the keywords
      const containsKeyword = keywords.some(keyword => tabs[0].url.includes(keyword));

      // Style the circle
      circle.style.backgroundColor = containsKeyword ? '#DAA520' : 'transparent';
  });
}

// Listen for tab updates
chrome.tabs.onUpdated.addListener(updateCircle);

// Initial call to updateCircle to check the URL when the extension is loaded
updateCircle();
