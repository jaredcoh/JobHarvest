// Function to save preferences
function savePreferences() {
  const autoEmailChecksDropdown = document.getElementById("autoEmailChecksDropdown").value;
  const numEmails = document.getElementById("numEmails").value;
  const phrasesToIgnore = document.getElementById("phrasesToIgnore").value.split(',').map(phrase => phrase.trim());
  const sheetsURL = document.getElementById("sheetsURL").value;
  const sheetsTab = document.getElementById("sheetsTab").value;
  const parenthesis = document.getElementById("parenthesis").checked;
  const combineJobs = document.getElementById("combineJobs").checked;
  const startColumn = document.getElementById("startColumn").value.toUpperCase(); // Get start column value
  const endColumn = document.getElementById("endColumn").value.toUpperCase(); // Get end column value
  // Get values for columns 1-6
  const column1 = document.getElementById("option1").value;
  const column2 = document.getElementById("option2").value;
  const column3 = document.getElementById("option3").value;
  const column4 = document.getElementById("option4").value;
  const column5 = document.getElementById("option5").value;
  const column6 = document.getElementById("option6").value;
  const hideTutorial = document.getElementById("hideTutorial").checked;

  // Save preferences to storage
  chrome.storage.local.set({
    'autoEmailChecksDropdown': autoEmailChecksDropdown,
    'numEmails': numEmails,
    'phrasesToIgnore': phrasesToIgnore,
    'sheetsURL': sheetsURL,
    'sheetsTab': sheetsTab,
    'parenthesis': parenthesis,
    'combineJobs': combineJobs,
    'startColumn': startColumn,
    'endColumn': endColumn,
    'parenthesis': parenthesis,
    'column1': column1,
    'column2': column2,
    'column3': column3,
    'column4': column4,
    'column5': column5,
    'column6': column6,
    'hideTutorial': hideTutorial
  }, function () {
    console.log('Preferences saved');
  });
}

// Function to load preferences
function loadPreferences() {
  chrome.storage.local.get([
    'autoEmailChecksDropdown',
    'numEmails',
    'phrasesToIgnore',
    'sheetsURL',
    'sheetsTab',
    'parenthesis',
    'combineJobs',
    'startColumn',
    'endColumn',
    'parenthesis',
    'column1',
    'column2',
    'column3',
    'column4',
    'column5',
    'column6',
    'hideTutorial'

  ], function (result) {
    // Set values based on the loaded preferences
    document.getElementById("autoEmailChecksDropdown").value = result.autoEmailChecksDropdown || '10';
    document.getElementById("numEmails").value = result.numEmails || '25';
    document.getElementById("phrasesToIgnore").value = result.phrasesToIgnore ? result.phrasesToIgnore.join(', ') : '';
    document.getElementById("sheetsURL").value = result.sheetsURL || '';
    document.getElementById("sheetsTab").value = result.sheetsTab || '';
    document.getElementById("parenthesis").checked = result.parenthesis || false;
    document.getElementById("combineJobs").checked = result.combineJobs || false;
    document.getElementById("startColumn").value = result.startColumn || '';
    document.getElementById("endColumn").value = result.endColumn || '';
    document.getElementById("parenthesis").value = result.endColumn || false;
    document.getElementById("option1").value = result.column1 || 'none';
    document.getElementById("option2").value = result.column2 || 'none';
    document.getElementById("option3").value = result.column3 || 'none';
    document.getElementById("option4").value = result.column4 || 'none';
    document.getElementById("option5").value = result.column5 || 'none';
    document.getElementById("option6").value = result.column6 || 'none';
    document.getElementById("hideTutorial").checked = result.hideTutorial || false;
  });
}

// Load preferences when the extension is opened
document.addEventListener('DOMContentLoaded', function () {
  loadPreferences();
});

// Attach an event listener to save preferences when there's a change
document.getElementById("autoEmailChecksDropdown").addEventListener('change', savePreferences);
document.getElementById("numEmails").addEventListener('change', savePreferences);
document.getElementById("phrasesToIgnore").addEventListener('input', savePreferences);
document.getElementById("sheetsURL").addEventListener('input', savePreferences);
document.getElementById("sheetsTab").addEventListener('input', savePreferences);
document.getElementById("parenthesis").addEventListener('change', savePreferences);
document.getElementById("combineJobs").addEventListener('change', savePreferences);
document.getElementById("startColumn").addEventListener('input', savePreferences);
document.getElementById("endColumn").addEventListener('input', savePreferences);
document.getElementById("parenthesis").addEventListener('change', savePreferences);
document.getElementById("option1").addEventListener('change', savePreferences);
document.getElementById("option2").addEventListener('change', savePreferences);
document.getElementById("option3").addEventListener('change', savePreferences);
document.getElementById("option4").addEventListener('change', savePreferences);
document.getElementById("option5").addEventListener('change', savePreferences);
document.getElementById("option6").addEventListener('change', savePreferences);
document.getElementById("hideTutorial").addEventListener('change', savePreferences);
