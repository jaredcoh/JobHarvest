getWebsiteInfo();
document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the "title" element
    document.getElementById("title").addEventListener("click", function() {
        // Call the getWebsiteInfo function when the title element is clicked
        getWebsiteInfo();
    });
});

function getWebsiteInfo(){
    chrome.storage.local.get(["ignorePhrases", "numEmails", "sheetsURL", "sheetsTab", "startColumn", "endColumn", "column1", "column2", "column3", "column4", "column5", "column6"], function(data) {
        // Extract constants from the retrieved data
        const sheetsURL = data.sheetsURL;
        const sheetsTab = data.sheetsTab;
        const startColumn = (data.startColumn || "").toUpperCase();
        const endColumn = (data.endColumn || "").toUpperCase();
        const numEmails = data.numEmails || 10;
        const column1 = data.column1 || "";
        const column2 = data.column2 || "";
        const column3 = data.column3 || "";
        const column4 = data.column4 || "";
        const column5 = data.column5 || "";
        const column6 = data.column6 || "";
        const ignorePhrases = data.ignorePhrases || "";

        // Call your function or execute your code here
        executeScript(ignorePhrases, sheetsURL, sheetsTab, startColumn, endColumn, numEmails, column1, column2, column3, column4, column5, column6);
    });
}

function executeScript(ignorePhrases,sheetsURL, sheetsTab, startColumn, endColumn, numEmails, option1, option2, option3, option4, option5, option6){
    console.log("script executing");
    // getting column values
    let colList = [option1, option2, option3, option4, option5, option6];

    if (colList.every(col => col === 'None')) {
        console.log("Column Values are all none -- setting to default values")
        colList = ['Date', 'Job Title', 'Company', 'Location', 'Link', 'Source'];
    }
    

    console.log("AAAA");
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if  (tabs.length > 0 &&
        tabs[0].url &&
        !tabs[0].url.startsWith("chrome://") &&
        (
            tabs[0].url.includes("workday") ||
            tabs[0].url.includes("workforcenow") ||
            tabs[0].url.includes("eightfold") ||
            tabs[0].url.includes("ultipro") ||
            tabs[0].url.includes("jobs") ||
            tabs[0].url.includes("career"))
        ){
            let parsingFunction = determineParsingFunction(tabs);
            if (parsingFunction) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: parsingFunction,
                    args: [tabs]
                }, function(result) {
                console.log(result);
                let outputElement = document.getElementById('output')
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    outputElement.textContent = 'An error occurred. Please try again.';
                }
                else if (result[0].result.jobTitles.length === 0){
                    outputElement.textContent = 'No Jobs can be Found on This Page';
                }
                else {
                    let data = result[0].result;
                    
                    // Create table
                    let table = document.createElement('table');
                    table.style.borderCollapse = 'collapse'; // Apply collapsed borders

                    const topRow = table.insertRow();
                    createSendButtonForTable(topRow,sheetsURL, sheetsTab, startColumn, endColumn);
                    createCopyButtonForTable(topRow); 

                    let headerRow = table.insertRow();
                    let headers = [''].concat(colList);

                    // Add bolded headers
                    for (let header of headers) {
                        let cell = headerRow.insertCell();
                        cell.textContent = header !== 'none' ? header : '';
                        cell.style.fontWeight = 'bold'; // Make headers bold
                        cell.style.textAlign = 'center'; // Center align text
                        cell.style.color = 'white';
                        cell.style.backgroundColor = header !== '' ? '#8B5A2B' : 'none';
                        cell.style.border = header !== '' ? '1px solid #ddd' : 'none';
                    }
                    let companyNameInput = document.getElementById("companyName").value
                    //1) see what type it is
                    //2) see what it looks like wtih multiple things
                    //3) rewrite to handle 1 phrase, 0phrase, 2+ phrase
                    if (ignorePhrases === ""){
                        ignorePhrases = "ABABABABABAB,BABABABAB"
                    }
                    let phrasesToIgnore = ignorePhrases.split(',').map(phrase => phrase.trim()).filter(phrase => phrase !== '');
                    // Add data rows
                    for (let i = 0; i < data.jobTitles.length; i++) {
                        let jobTitle = data.jobTitles[i];
                        if (phrasesToIgnore.length === 0 || !phrasesToIgnore.some(phrase => jobTitle.toLowerCase().includes(phrase.toLowerCase()))) {
                            let newRow = table.insertRow();
                            let cellContainer = newRow.insertCell();

                            // Create a div to contain the buttons
                            let buttonContainer = document.createElement('div');
                            buttonContainer.style.display = 'flex'; // Use flexbox to align buttons horizontally
                            // Create the send to spreadsheet button
                            sendButtonForRow(buttonContainer);

                            // Create the delete button
                            createDeleteButton(newRow,buttonContainer);
                            cellContainer.appendChild(buttonContainer); // Append the button container to the cell
                            newRow.style.backgroundColor = (newRow.previousElementSibling && newRow.previousElementSibling.style.backgroundColor === 'white') ? '' : 'white';

                            colList.forEach((col, index) => {
                                switch (col) {
                                    case 'Date':
                                        let dateCell = newRow.insertCell(); // Adding 1 to index to skip deleteCell
                                        dateCell.textContent = formatDate(new Date()); 
                                        dateCell.style.border = '1px solid #ddd';
                                        break;
                                    case 'Job Title':
                                        let titleCell = newRow.insertCell();
                                        titleCell.textContent = jobTitle;
                                        titleCell.style.border = '1px solid #ddd';
                                        break;
                                    case 'Company':
                                        let compCell = newRow.insertCell();
                                        let companyName = "";
                                        if (companyNameInput) {
                                            companyName = companyNameInput;
                                        } else if (tabs[0].url.match(/workforcenow/i)) {
                                            companyName = "N/A";
                                        } else if (tabs[0].url.match(/ultipro/i)) {
                                            companyName = "N/A";
                                        } else {
                                            const jobCareerMatch = tabs[0].url.match(/(?:jobs?|careers?)\.(.+?)(?:\.|\/|$)/i);
                                            if (jobCareerMatch) {
                                                companyName = jobCareerMatch[1].charAt(0).toUpperCase() + jobCareerMatch[1].slice(1);
                                            } else {
                                                const domainMatch = tabs[0].url.match(/https?:\/\/([^./]+)/);
                                                companyName = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
                                            }
                                        }
                                        compCell.textContent = companyName;
                                        compCell.style.border = '1px solid #ddd';
                                        break;
                                    case 'Location':
                                        let locaCell = newRow.insertCell();
                                        locaCell.textContent = data.locations[i];
                                        locaCell.style.border = '1px solid #ddd';
                                        break;
                                    case 'Link':
                                        let linkCell = newRow.insertCell();
                                        let link = document.createElement('a');
                                        link.href = data.links[i];
                                        link.textContent = 'Link';
                                        link.title = 'Click to open';
                                        link.target = '_blank'; // Set target attribute to _blank
                                        linkCell.style.border = '1px solid #ddd';
                                        linkCell.appendChild(link);
                                        break;
                                    case 'Source':
                                        let sourceCell = newRow.insertCell();
                                        sourceCell.textContent = "Company Website";
                                        sourceCell.style.border = '1px solid #ddd';
                                        sourceCell.style.width = '50px';
                                        break;
                                    case 'None':
                                        let noneCell = newRow.insertCell();
                                        noneCell.style.border = '1px solid #ddd';
                                        noneCell.style.width = '50px';
                                        break;
                                }
                            })
                        }
                        else{
                            console.log(jobTitle + " was not included");
                        }
                    }

                    // Replace output content with table
                    outputElement.innerHTML = '';
                    outputElement.appendChild(table);


                    }
                });
            }
            else {
                document.getElementById('output').textContent = 'Parsing function for this website is not functional';
            }
        }
        else
        {
            document.getElementById('output').textContent = 'Unable to access tab information or invalid URL';
        }
    });
}

function createDeleteButton(row,container) {
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '\u2716'; // Use HTML entity for 'x' symbol
    deleteButton.id = "delete"; // Set the ID for the button
    deleteButton.title = "Delete Row";
    deleteButton.addEventListener('click', () => {
        row.remove();
    });
    container.appendChild(deleteButton);
}

function sendButtonForRow(container) {
    const sendToSpreadsheetButton = document.createElement('button');
    sendToSpreadsheetButton.innerHTML = '&#10148;'; // Right arrow HTML entity
    sendToSpreadsheetButton.id = "delete";
    sendToSpreadsheetButton.title = "Send Row To Spreadsheet";
    sendToSpreadsheetButton.addEventListener('click', (event) => {
        const selectedRow = event.target.closest('tr'); // Get the closest row to the button
        let selectedText = "";
        const cells = selectedRow.querySelectorAll('td, th');
        for (let j = 1; j < cells.length; j++) {
            const cell = cells[j];
            if (cell.querySelector('a')) {
                // If cell contains a link, get the href attribute
                selectedText += cell.querySelector('a').href + "\t";
            } else {
                selectedText += cell.innerText + "\t";
            }
        }
        selectedText += "\n";
        getSheetData(selectedText); // This function needs to be defined elsewhere in your code
        sendToSpreadsheetButton.innerHTML = '&#x2713';
        sendToSpreadsheetButton.title = "Sent!"
        sendToSpreadsheetButton.id += '-sent'; // Add the 'sent' class
    });

    container.appendChild(sendToSpreadsheetButton);
}

function workforceParse(tabs){
    let jobTitles = [];
    let locations = [];
    let links = [];
    jobTitleElementsRaw = document.querySelectorAll('span[class="current-opening-title"]');
    locationElementsRaw = document.querySelectorAll('div[class="current-opening-locations"]');
    for (let element of jobTitleElementsRaw) {
        jobTitles.push(element.innerText.trim());
        links.push(tabs[0].url);
    }
    for (let element of locationElementsRaw) {
        locations.push(element.innerText.trim());
    }
    return {"tabId":tabs[0].id, "jobTitles":jobTitles, "locations":locations, 'links':links};
}

function workdayParse(tabs) {
    let jobTitles = [];
    let locations = [];
    let links = [];
    jobTitleElementsRaw = document.querySelectorAll('a[data-automation-id="jobTitle"]');
    locationElementsRaw = document.querySelectorAll('div[data-automation-id="locations"] dd');
    for (let element of jobTitleElementsRaw) {
        jobTitles.push(element.innerText.trim());
        links.push(tabs[0].url.match(/^(https?:\/\/[^\/]+)/)[1] + element.getAttribute('href'));
        //links.push(tabs[0].url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+\.com)/)[1] + "/" + element.getAttribute('href'));
    }
    for (let element of locationElementsRaw) {
        locations.push(element.innerText.trim());
    }
    return {"tabId":tabs[0].id, "jobTitles":jobTitles, "locations":locations, 'links':links};
}

function eightfoldParse(tabs) {
    let jobTitles = [];
    let locations = [];
    let links = [];
    jobTitleElementsRaw = document.querySelectorAll('.position-title');
    locationElementsRaw = document.querySelectorAll('.position-location');
    for (let element of jobTitleElementsRaw) {
        jobTitles.push(element.innerText.trim());
        links.push(tabs[0].url+'?query='+element.innerText.trim());
    }
    for (let element of locationElementsRaw) {
        locations.push(element.innerText.trim());
    }
    return {"tabId":tabs[0].id, "jobTitles":jobTitles, "locations":locations, "links":links};
}

function determineParsingFunction(tabs) {
    console.log("AAAAAAAAAAAAAAAAA");
    if (tabs.length > 0 && tabs[0].url && !tabs[0].url.startsWith("chrome://")) {
        if (tabs[0].url.includes("workday")) {
            console.log("workday");
            return workdayParse;
        } else if (tabs[0].url.includes("workforcenow")) {
            console.log("workforcenow");
            return workforceParse;
        } else if (tabs[0].url.includes("eightfold")){
            console.log("eightfold");
            return eightfoldParse;
        } else if (tabs[0].url.includes("ultipro")){
            console.log("ultipro")
            return ultiproParse;
        } else{
            console.log("eightfold last check")
            return checkIfEightfold;
        }
    }
    return "No Parsing Qualification";
}
function checkIfEightfold(tabs){
    console.log("checking if eightfold")
    if (!!document.querySelector('a[title="Visit Eightfold.ai homepage"]')){
        console.log("is eightfold related", !!document.querySelector('a[title="Visit Eightfold.ai homepage"]'))
        console.log(eightfoldParse(tabs))
        function eightfoldParse(tabs) {
            let jobTitles = [];
            let locations = [];
            let links = [];
            jobTitleElementsRaw = document.querySelectorAll('.position-title');
            locationElementsRaw = document.querySelectorAll('.position-location');
            for (let element of jobTitleElementsRaw) {
                jobTitles.push(element.innerText.trim());
                links.push(tabs[0].url+'?query='+element.innerText.trim());
            }
            for (let element of locationElementsRaw) {
                locations.push(element.innerText.trim());
            }
            return {"tabId":tabs[0].id, "jobTitles":jobTitles, "locations":locations, "links":links};
        }
        return eightfoldParse(tabs)
    }
    else{
        console.log("is not eightfold related", !!document.querySelector('a[title="Visit Eightfold.ai homepage"]'))
        
        return "None"
    }
    
}

function ultiproParse(tabs){
    let jobTitles = [];
    let locations = [];
    let links = [];
    opportunities = document.querySelectorAll('div[data-automation="opportunity"]');

    opportunities.forEach(opportunity => {
    // Extract job title from the current opportunity
        const jobTitleElement = opportunity.querySelector('a[data-automation="job-title"]');
        if (jobTitleElement) {
            const jobTitle = jobTitleElement.innerText.trim();
            jobTitles.push(jobTitle);
            links.push(tabs[0].url); // Assuming tabs is defined in the surrounding context
        }

        // Extract the first location from the current opportunity
        const locationElement = opportunity.querySelector('address[data-automation="physical-location"]');
        if (locationElement) {
            const location = locationElement.innerText.trim();
            locations.push(location);
        }
    });
    return {"tabId":tabs[0].id, "jobTitles":jobTitles, "locations":locations, 'links':links};
}


function createSendButtonForTable(sendRow,sheetsURL, sheetsTab, startColumn, endColumn) {
    
    const sendCell = sendRow.insertCell(0);
    sendCell.colSpan = 3;
    const sendToSpreadsheetButton = document.createElement('button');
    sendToSpreadsheetButton.innerText = 'Send to Sheet';
    sendToSpreadsheetButton.id = 'email-actions';
    sendToSpreadsheetButton.style.width = '100%';
    sendToSpreadsheetButton.style.fontSize = '12px';
    sendCell.appendChild(sendToSpreadsheetButton);

    sendToSpreadsheetButton.addEventListener('click', (event) => {
        const table = event.target.closest('table');
        const selectedRows = Array.from(table.querySelectorAll('tr:not(.deleted)'));  // Exclude deleted rows
        const selectedText = getSelectedTableText(selectedRows);
        sendToGoogleSheet(selectedText,sheetsURL, sheetsTab, startColumn, endColumn)
        sendToSpreadsheetButton.innerText = 'Sent!';
        setTimeout(() => {
            sendToSpreadsheetButton.innerText = 'Send to Spreadsheet';
        }, 3000);
    });
}


function parseCsv(csvData) {
    return csvData.split('\n').map(row => row.split('~~'));
  }

async function appendValuesFromCSV(spreadsheetId, range, valueInputOption, csvData, callback) {
    const sheetsAPIURL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=${valueInputOption}`;
    try {
        const token = await getOAuthToken(); // Wait for the token to resolve
        const body = {
            values: parseCsv(csvData)
        };
        const response = await fetch(sheetsAPIURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            throw new Error('Failed to append values to Google Sheets.');
        }
        const result = await response.json();
        console.log(`${result.updates.updatedCells} cells appended.`);
        if (callback) callback(result);
    } catch (error) {
        console.error('Error appending values to Google Sheets:', error);
    }
}

function getSelectedTableText(table) {
    let selectedText = "";
    for (let i = 2 ; i < table.length; i++) {
        const cells = table[i].querySelectorAll('td, th');
        for (let j = 1; j < cells.length; j++) {
            const cell = cells[j];
            if (cell.querySelector('a')) {
                // If cell contains a link, get the href attribute
                selectedText += cell.querySelector('a').href + "\t";
            } else {
                selectedText += cell.innerText + "\t";
            }
        }
        selectedText += "\n";
    }
    return selectedText;
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    return formattedDate;
}

function sortRowsByColumn(table, columnIndex, ascending) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        const cellA = a.cells[columnIndex].innerText;
        const cellB = b.cells[columnIndex].innerText;

        // Compare cells content based on the sorting order
        const comparison = ascending ? cellA.localeCompare(cellB, undefined, { numeric: true }) :
                                        cellB.localeCompare(cellA, undefined, { numeric: true });
        return comparison;
    });

    // Rearrange rows in the table according to the sorted array
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));
}


// Function to extract the spreadsheet ID from the sheetsURL
function getSpreadsheetId(sheetsURL) {
    const regex = /\/spreadsheets\/d\/(.*?)(\/|$)/;
    const match = sheetsURL.match(regex);
    return match ? match[1] : null;
}

// Function to get the highest empty row in specified columns
async function getHighestEmptyRow(spreadsheetId, sheetName, startColumn, endColumn) {
    const columnData = await fetchColumnsData(spreadsheetId, sheetName, startColumn, endColumn);
    // Combine data from all columns into a single array
    let maxLength = 0;
    for (let i = 0; i < columnData.length; i++) {
        if (columnData[i].length > maxLength) {
            maxLength = columnData[i].length;
        }
    }
    return maxLength
}

async function fetchColumnsData(spreadsheetId, sheetName, startColumn, endColumn) {
    const sheetsAPIURL = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetName}'!${startColumn}:${endColumn}`;
    const token = await getOAuthToken();
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    try {
        const response = await fetch(sheetsAPIURL, { headers });
        if (!response.ok) {
            throw new Error('Failed to fetch data from Google Sheets');
        }
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        throw error;
    }
}
document.getElementById("companyName").addEventListener('input', function() {
    // Reload the list when companyNameInput changes
    getWebsiteInfo();
});

// Function to decode URL-safe base64 string
function urlSafeBase64Decode(base64) {
    // Replace '-' with '+' and '_' with '/'
    const modifiedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  
    // Add padding if needed
    const paddedBase64 = modifiedBase64 + '==='.slice(0, (4 - modifiedBase64.length % 4) % 4);
  
    // Decode base64
    return atob(paddedBase64);
  }


function tableToCSV(htmlTable) {
    const rows = htmlTable.trim().split('\n');

    // Split each row into cells and replace tabs with ~~
    const csvRows = rows.map(row => row.split('\t').map(cell => cell.replace(/\t/g, '~~')));
    // Combine rows into CSV format
    const csv = csvRows.map(row => row.join('~~')).join('\n');
    return csv;
}

function sendToGoogleSheet(jobs,sheetsURL, sheetsTab, startColumn, endColumn) {
    // Check if the sheetsURL and sheetsTab are provided
    if (!sheetsURL || !sheetsTab) {
    console.error('Sheets URL and Tab Name are required');
    return;
    }
    // Construct the Google Sheets API URL
    const spreadsheetId = getSpreadsheetId(sheetsURL);
    
    // Convert HTML table to CSV format
    const csvData = tableToCSV(jobs);
    getHighestEmptyRow(spreadsheetId, sheetsTab, startColumn, endColumn).then(highestEmptyRow => {
        // Calculate the range for the update starting from the highest empty row
        const startRange = `${sheetsTab}!${startColumn}${highestEmptyRow + 1}`;
        // Send a POST request to update the Google Sheet
        // Callback function to handle the response
        const callback = (response) => {
            console.log('Values appended successfully:', response);
        };
        
        // Call the appendValuesFromCSV function
        appendValuesFromCSV(spreadsheetId, startRange, 'RAW', csvData, callback);
    })
}

async function getOAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(token);
            }
        });
    });
}

function getSelectedTableText(table) {
    let selectedText = "";
    for (let i = 2 ; i < table.length; i++) {
        const cells = table[i].querySelectorAll('td, th');
        for (let j = 1; j < cells.length; j++) {
            const cell = cells[j];
            if (cell.querySelector('a')) {
                // If cell contains a link, get the href attribute
                selectedText += cell.querySelector('a').href + "\t";
            } else {
                selectedText += cell.innerText + "\t";
            }
        }
        selectedText += "\n";
    }
    return selectedText;
}


function createCopyButtonForTable(headerRow) {
    const copyCell = headerRow.insertCell(0);
    copyCell.colSpan = 3;
    const copyButton = document.createElement('button');
    copyButton.innerText = 'Copy Table';
    copyButton.id = 'email-actions';
    copyButton.style.width = '100%';
    copyButton.style.fontSize = '12px';
    copyButton.addEventListener('click', (event) => {
        const table = event.target.closest('table');
        const selectedRows = Array.from(table.querySelectorAll('tr:not(.deleted)')); // Exclude deleted rows
        const selectedText = getSelectedTableText(selectedRows);
        copyToClipboard(selectedText);
        copyButton.innerText = 'Copied Table!';
        setTimeout(() => {
            copyButton.innerText = 'Copy Table';
        }, 3000);
    });
    copyCell.appendChild(copyButton);
}

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
    const sheetsURL = sheetData[0];
    const sheetsTab = sheetData[1];
    // Check if the sheetsURL and sheetsTab are provided
    if (!sheetsURL || !sheetsTab) {
    console.error('Sheets URL and Tab Name are required');
    return;
    }
    // Construct the Google Sheets API URL
    const spreadsheetId = getSpreadsheetId(sheetsURL);
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
    
        // Send a POST request to update the Google Sheet
        // Callback function to handle the response
        const callback = (response) => {
            console.log('Values appended successfully:', response);
        };
        
        // Call the appendValuesFromCSV function
        appendValuesFromCSV(spreadsheetId, startRange, 'RAW', csvData, callback);

    })
}