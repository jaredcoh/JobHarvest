loadPreferences()

function savePreferences() {
    const ignorePhrases = document.getElementById("ignorePhrases").value;
    const column1 = document.getElementById("option1").value;
    const column2 = document.getElementById("option2").value;
    const column3 = document.getElementById("option3").value;
    const column4 = document.getElementById("option4").value;
    const column5 = document.getElementById("option5").value;
    const column6 = document.getElementById("option6").value;
    const sheetsURL = document.getElementById("sheetsURL").value;
    const sheetsTab = document.getElementById("sheetsTab").value;
    const numEmails = document.getElementById("numEmails").value;
    const startColumn = document.getElementById("startColumn").value;
    const endColumn = document.getElementById("endColumn").value;
    console.log("SAVE", column1, column2, column3, column4);
    chrome.storage.local.set({
        'numEmails':numEmails,
        'ignorePhrases': ignorePhrases,
        'column1': column1,
        'column2': column2,
        'column3': column3,
        'column4': column4,
        'column5': column5,
        'column6': column6,
        'sheetsURL': sheetsURL,
        'sheetsTab': sheetsTab,
        'startColumn': startColumn,
        'endColumn': endColumn
    }, function () {
        console.log('Preferences saved');
    });
}
function addEventListenerIfElementExists(elementId, eventType, listener) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, listener);
    }
}

function loadPreferences() {
    chrome.storage.local.get([
        'numEmails',
        'ignorePhrases',
        'column1',
        'column2',
        'column3',
        'column4',
        'column5',
        'column6',
        'sheetsURL',
        'sheetsTab',
        'companyName',
        'startColumn',
        'endColumn',
    ], function (result) {
        // Mapping between preference keys and corresponding form element IDs
        console.log(result)
        const preferencesMap = {
            'numEmails':'numEmails',
            'ignorePhrases': 'ignorePhrases',
            'column1': 'option1',
            'column2': 'option2',
            'column3': 'option3',
            'column4': 'option4',
            'column5': 'option5',
            'column6': 'option6',
            'sheetsURL': 'sheetsURL',
            'sheetsTab': 'sheetsTab',
            'companyName': 'companyName',
            'startColumn': 'startColumn',
            'endColumn': 'endColumn',
        };

        // Set values based on the loaded preferences
        Object.keys(preferencesMap).forEach(prefKey => {
            const elementId = preferencesMap[prefKey];
            const element = document.getElementById(elementId);
            if (element) {
                element.value = result[prefKey] || '';
            }
        });

    });

    // Add event listeners
    addEventListenerIfElementExists('numEmails', 'change', savePreferences);
    addEventListenerIfElementExists('ignorePhrases', 'input', savePreferences);
    addEventListenerIfElementExists('option1', 'change', savePreferences);
    addEventListenerIfElementExists('option2', 'change', savePreferences);
    addEventListenerIfElementExists('option3', 'change', savePreferences);
    addEventListenerIfElementExists('option4', 'change', savePreferences);
    addEventListenerIfElementExists('option5', 'change', savePreferences);
    addEventListenerIfElementExists('option6', 'change', savePreferences);
    addEventListenerIfElementExists('sheetsURL', 'input', savePreferences);
    addEventListenerIfElementExists('sheetsTab', 'input', savePreferences);
    addEventListenerIfElementExists('companyName', 'input', savePreferences);
    addEventListenerIfElementExists('startColumn', 'input', savePreferences);
    addEventListenerIfElementExists('endColumn', 'input', savePreferences);

    console.log("loaded");
}
