
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
    console.log(button, buttonId);
    if (button === buttonId) {
      document.getElementById(button).classList.remove('light');
    } else {
      document.getElementById(button).classList.add('light');
    }
    var buttonImage = document.getElementById(button).querySelector('img');
    console.log(button, buttonImage);
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
          console.log(footer)
          // Add event listeners to each button
          buttonIds.forEach(function(buttonId) {
              var button = document.getElementById(buttonId);
              button.addEventListener('click', function() {
                  console.log(buttonId.charAt(0).toUpperCase());
                  console.log(footer);
                  loadDifferentHTML(buttonId, footer);
              });
          });
      })
      .catch(error => console.error('Error loading footer HTML:', error));
});

function loadDifferentHTML(letter, footer) {
  // Load the different HTML file dynamically
  console.log("VE")
  if (letter === "eButton") {
      file = "../emailTab/popdown.html"
  } else if (letter === "wButton") {
      file = "../websiteTab/popup.html"
  } else if (letter === "tButton") {
      file = "../tutorialTab/data.html"
  } else if (letter === "sButton") {
      file = "../settingsTab/data.html"
  } else {
      console.log("AE")
  }

  fetch(file)
      .then(response => response.text())
      .then(html => {
          // Replace the current HTML content with the content from the different HTML file
          document.body.innerHTML = html;
          // Append the footer back to the body
          console.log(footer)
          var existingFooter = document.getElementById('footer');
          if (!existingFooter) {
              // If footer doesn't exist, append it to the body
              document.body.appendChild(footer);
          }
          toggleButton(letter);
          console.log("footer appended");
          const scriptElement = document.createElement('script');
          scriptElement.src = "../switch.js";
          console.log(scriptElement);
          document.body.appendChild(scriptElement);
          // Load scripts if needed
          if (letter === "eButton") {
              let sList = ['dictParse.js', 'glassdoorParse.js', 'googleSheetsIntegration.js', 'indeedParse.js', 'linkedinParse.js', 'smallFunctions.js', 'channelContents.js']
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
                  console.log(scriptElement);
                  document.body.appendChild(scriptElement);
              });
          }
          if (letter === "sButton") {
              const scriptElement = document.createElement('script');
              scriptElement.src = "/settingsTab/preferences.js";
              console.log(scriptElement);
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
          console.log(footer);
          loadDifferentHTML(buttonId, footer);
      });
  });
}