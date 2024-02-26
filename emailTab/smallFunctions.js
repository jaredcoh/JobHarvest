function convertToTimezone(dateString) {
    const options = {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };
  
    return new Date(dateString).toLocaleString('en-US', options);
  }

function convertToTimezone2(dateString) {
    const options = {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
  
    return new Date(dateString).toLocaleString('en-US', options);
  }


document.addEventListener('DOMContentLoaded', function () {
    // Check if the JSON format header exists before hiding it
    const jsonHeader = document.getElementById('jsonHeader');
    if (jsonHeader) {
        jsonHeader.style.display = 'none';
    }

    // Check if the textarea exists before hiding it
    const resultTextArea = document.getElementById('result');
    if (resultTextArea) {
        resultTextArea.style.display = 'none';
    }
});



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

function forEachEntry(entry, jobsTable, colList, resultContainer, phrasesToIgnore){
    entry.jobs.forEach(job => {
        if (shouldAddJob(job, phrasesToIgnore)){
            addData(job, jobsTable, colList, entry)
        };
    
    });
    resultContainer.appendChild(jobsTable);
}

function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    // Separate the first three rows (headers) from the data rows
    const numberRows = 2
    const headers = rows.slice(0, numberRows);
    const dataRows = rows.slice(numberRows);
    // Check the current sorting order
    const currentOrder = table.getAttribute('data-sort-order');
    let ascending = true;
    if (currentOrder === 'desc') {
        ascending = false;
        table.setAttribute('data-sort-order', 'asc');
    } else {
        table.setAttribute('data-sort-order', 'desc');
    }

    if (currentOrder === 'desc') {
        ascending = false;
        indicator = '&#x25BE;'; // Downward triangle for descending
        table.setAttribute('data-sort-order', 'asc');
    } else {
        indicator = '&#x25B4;'; // Upward triangle for ascending
        table.setAttribute('data-sort-order', 'desc');
    }
    
    if (currentOrder === 'none') {
        indicator = '&#x25C8;'; // Square for neither ascending nor descending
        table.setAttribute('data-sort-order', 'asc'); // Default to ascending on first click
    }

    // Sort only the data rows
    dataRows.sort((a, b) => {
        const cellA = a.cells[columnIndex+1] ? a.cells[columnIndex+1].innerText : '';
        const cellB = b.cells[columnIndex+1] ? b.cells[columnIndex+1].innerText : '';
        return ascending ? cellA.localeCompare(cellB) :
            cellB.localeCompare(cellA);
    });
    // Rearrange rows in the table with sorted data rows followed by headers
    tbody.innerHTML = '';

    headers[numberRows-1].querySelectorAll('th').forEach((headerCell, index) => {
        if (index === 0) {_=0}
        else if (index === columnIndex+1) {
            headerCell.innerHTML = `<strong>${headerCell.innerText.slice(0, -1)}${indicator}</strong>`;
        }
        else{
            headerCell.innerHTML = `<strong>${headerCell.innerText.slice(0, -1)}&#x25C8;</strong>`;
        }
    });


    [...headers, ...dataRows].forEach(row => tbody.appendChild(row));
}


function addColHeader(colList, headerRow){
    headerRow.appendChild(document.createElement('th'));
    colList.forEach((col, index) => {
        if (col.toLowerCase() !== 'none') {
            const headerCell = document.createElement('th');
            headerCell.innerHTML = `<strong>${col}&#x25C8;</strong>`;
            headerCell.style.border = '1px solid #ddd';
            headerCell.style.cursor = 'pointer'; // Add cursor style
            headerCell.addEventListener('click', () => {
                sortTable(headerRow.parentElement.parentElement, index);
            });
            headerRow.appendChild(headerCell);
    }});
}

function addData(job, jobsTable, colList, entry){
    const row = jobsTable.insertRow();
    colList.forEach((col, index) => {
    switch (col) {
        case 'Date':
            const dateCell = row.insertCell(-1); // Adding 1 to index to skip deleteCell
            dateCell.innerHTML = convertToTimezone2(entry.date);
            dateCell.style.border = '1px solid #ddd';
            break;
        case 'Job Title':
            const titleCell = row.insertCell(-1);
            titleCell.innerHTML = `<strong>${job.jobTitle}</strong>`;
            titleCell.style.border = '1px solid #ddd';
            break;
        case 'Company':
            const companyCell = row.insertCell(-1);
            companyCell.innerHTML = job.companyName;
            companyCell.style.border = '1px solid #ddd';
            break;
        case 'Location':
            const locationCell = row.insertCell(-1);
            locationCell.innerHTML = job.locationName;
            locationCell.style.border = '1px solid #ddd';
            break;
        case 'Link':
            const hrefCell = row.insertCell(-1);
            const linkElement = document.createElement('a');
            linkElement.href = job.href;
            linkElement.innerText = 'Link';
            linkElement.target = '_blank';
            linkElement.title = 'Click to Open';
            // Append the anchor element to the hrefCell
            hrefCell.appendChild(linkElement);
            hrefCell.style.border = '1px solid #ddd';
            break;
        case 'Source':
            const sourceCell = row.insertCell(-1);
            sourceCell.innerHTML = capitalizeFirstLetter(entry.jobSite);
            sourceCell.style.border = '1px solid #ddd';
            break;
        default:
            break;
    }})
    createDeleteButton(row);
}

function createDeleteEmailButton(delEmailRow, entry) {
    const delEmailCell = delEmailRow.insertCell(0);
    delEmailCell.colSpan = 2;
    const delEmailButton = document.createElement('button');
    delEmailButton.style.fontSize = '12px';
    delEmailButton.style.width = '100%';
    delEmailButton.innerText = 'Trash Email';
    delEmailButton.addEventListener('click', (event) => {
        deleteEmail(entry.id);
        delEmailButton.innerText = 'Email Trashed!';
    });
    delEmailCell.appendChild(delEmailButton);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createAndPrepJobTable(colList, entry){
    const jobsTable = document.createElement('table');
    jobsTable.style.borderCollapse = 'collapse';
    jobsTable.style.overflowX = 'auto';
    const topRow = jobsTable.insertRow();
    createDeleteEmailButton(topRow, entry);
    createSendButtonForTable(topRow);
    createOpenEmailButtonForTable(topRow, entry); 
    createCopyButtonForTable(topRow); 
    
    const headerRow = jobsTable.insertRow();
            
    addColHeader(colList, headerRow);
    return jobsTable
}

function createOpenEmailButtonForTable(topRow, entry){
    const openCell = topRow.insertCell(0);
    openCell.colSpan = 1;
    const openButton = document.createElement('button');
    openButton.innerText = 'Open Email';
    openButton.style.width = '100%';
    openButton.style.fontSize = '12px';
    openCell.appendChild(openButton);
    openButton.addEventListener('click', (event) => {
        window.open('https://mail.google.com/mail/u/0/#inbox/' + entry.threadId, '_blank');
        openButton.innerText = 'Opening!';
        setTimeout(() => {
            openButton.innerText = 'Open Email';
        }, 3000);
    });
}

function shouldAddJob(job, phrasesToIgnore) {
    return !phrasesToIgnore.length || !phrasesToIgnore.some(phrase =>
        job.jobTitle.toLowerCase().includes(phrase) ||
        job.companyName.toLowerCase().includes(phrase) ||
        job.locationName.toLowerCase().includes(phrase)
    );
}

function createSendButtonForTable(sendRow) {
    
    const sendCell = sendRow.insertCell(0);
    sendCell.colSpan = 1;
    const sendToSpreadsheetButton = document.createElement('button');
    sendToSpreadsheetButton.innerText = 'Send to Sheet';
    sendToSpreadsheetButton.style.width = '100%';
    sendToSpreadsheetButton.style.fontSize = '12px';
    sendCell.appendChild(sendToSpreadsheetButton);

    sendToSpreadsheetButton.addEventListener('click', (event) => {
        const table = event.target.closest('table');
        const selectedRows = Array.from(table.querySelectorAll('tr:not(.deleted)'));  // Exclude deleted rows
        const selectedText = getSelectedTableText(selectedRows);
        getSheetData(selectedText); //this fails now
        sendToSpreadsheetButton.innerText = 'Sent!';
        setTimeout(() => {
            sendToSpreadsheetButton.innerText = 'Send to Spreadsheet';
        }, 3000);
    });
}


function createCopyButtonForTable(headerRow) {
    const copyCell = headerRow.insertCell(0);
    copyCell.colSpan = 2;
    const copyButton = document.createElement('button');
    copyButton.innerText = 'Copy Table';
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



function createDeleteButton(row) {
    const deleteCell = row.insertCell(0);
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '\u2716'; // Use HTML entity for 'x' symbol
    deleteButton.style.fontSize = '14px'; // Decrease font size for smaller 'x'
    deleteButton.style.width = '30px'; // Set a fixed width and height for circular shape
    deleteButton.style.height = '30px';
    deleteButton.style.borderRadius = '50%'; // Make the button circular
    deleteButton.id = "delete"; // Set the ID for the button
    deleteButton.title = "Delete Row";
    deleteButton.addEventListener('click', () => {
        row.remove();
    });
    deleteCell.appendChild(deleteButton);
}

async function deleteEmail(emailId) {
    const accessToken = await getOAuthToken(); // Replace with your access token
    
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages/${emailId}/trash`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            console.log('Email deleted successfully.');
            // Optionally, you can update the UI to reflect the deletion
        } else {
            console.error('Failed to delete email:', response.statusText);
            // Handle other response statuses here
        }
    } catch (error) {
        console.error('Error deleting email:', error);
        // Handle errors here
    }
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

