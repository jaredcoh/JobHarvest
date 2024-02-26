// Function to check the URL and set badge text and color accordingly
function updateBadge(tabId, tab) {
    // Check if the tab URL matches any of the specified conditions
    console.log(tab.url)
    if (tab.url.includes("workday") || tab.url.includes("workforcenow") || tab.url.includes("eightfold")) {
        // Set badge text to "!"
        chrome.action.setBadgeText({
            text: "!",
            tabId: tabId
        });
        // Set badge background color to black
        chrome.action.setBadgeBackgroundColor({
            color: '#333',
            tabId: tabId
        });
    } else {
        // Remove badge if the conditions are not met
        chrome.action.setBadgeText({
            text: "",
            tabId: tabId
        });
    }
}

// Add an event listener for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Check if the tab has completed loading
    if (changeInfo.status === 'complete') {
        // Call the function to update badge
        updateBadge(tabId, tab);
    }
});

// Add an event listener to execute code when the extension is loaded
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // Call the function to update badge for the current tab
        updateBadge(tabs[0].id, tabs[0]);
});
