// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Perform action based on the message received
    if (message.action === 'nextPage') {
        // Find and click the "next" button on the page
        const nextButton = document.querySelector('button[type="button"][data-uxi-element-id="next"]');
        console.log(nextButton)
        if (nextButton) {
            nextButton.click();
        }
        sendResponse({ result: 'clicked' });
    } else if (message.action === 'previousPage') {
        // Find and click the "prev" button on the page
        const prevButton = document.querySelector('button[type="button"][data-uxi-element-id="previous"]');
        console.log(prevButton)
        if (prevButton) {
            prevButton.click();
        }
        sendResponse({ result: 'clicked' });
    }
});
