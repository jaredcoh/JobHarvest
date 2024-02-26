function getSheetData(jobs){
    chrome.storage.local.get(["sheetsURL", "sheetsTab", "startColumn", "endColumn"], function(data) {
        // Extract constants from the retrieved data
        const sheetsURL = data.sheetsURL;
        const sheetsTab = data.sheetsTab;
        const startColumn = (data.startColumn || "").toUpperCase();
        const endColumn = (data.endColumn || "").toUpperCase();
        
        // Call sendToGoogleSheet with the retrieved data
        sendToGoogleSheet(jobs, [sheetsURL, sheetsTab, startColumn, endColumn]);
    });
}

// Function to send job information to Google Sheets
function sendToGoogleSheet(jobs, sheetData) {
    console.log(sheetData, "data")
    const sheetsURL = sheetData[0];
    const sheetsTab = sheetData[1];
    console.log("B", sheetsURL)
    // Check if the sheetsURL and sheetsTab are provided
    if (!sheetsURL || !sheetsTab) {
    console.error('Sheets URL and Tab Name are required');
    return;
    }
    console.log("C", sheetsTab)
    // Construct the Google Sheets API URL
    const spreadsheetId = getSpreadsheetId(sheetsURL);
    const sheetsAPIURL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/`;
    // Get the highest empty row in columns A-E
    const startColumn = sheetData[2].toUpperCase(); // Get start column value
    const endColumn = sheetData[3].toUpperCase(); // Get end column value
    // Convert HTML table to CSV format
    const csvData = tableToCSV(jobs);
    getHighestEmptyRow(spreadsheetId, sheetsTab, startColumn, endColumn).then(highestEmptyRow => {
        // Split the CSV data into an array of arrays
        const rows = csvData.split('\n').map(row => row.split(','));
        // Calculate the range for the update starting from the highest empty row
        const startRange = `${sheetsTab}!${startColumn}${highestEmptyRow + 1}`;
        const endRange = `${String.fromCharCode(65 + rows[0].length - 1)}${highestEmptyRow + rows.length}`;
        // Prepare the data object for the API request
        const requestData = {
            values: rows,
        };
        const token = getOAuthToken();
    
        // Send a POST request to update the Google Sheet
        // Callback function to handle the response
        const callback = (response) => {
            console.log('Values appended successfully:', response);
        };
        
        // Call the appendValuesFromCSV function
        appendValuesFromCSV(spreadsheetId, startRange, 'RAW', csvData, callback);

    })
}