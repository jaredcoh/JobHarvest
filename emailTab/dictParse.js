//all generic file names on smallFunctions.js (use Cntrl + F)

function dictionaryParser(resultContainer, jobDetails, colList, phrasesToIgnore) {
    console.log("Start Parsing");
    //do not do all the crazy stuff below if nothing exists
    let numJobs = 0;
    if (jobDetails.length === 0){
        resultContainer.innerHTML = 'No Jobs to show';
        updateQuantity(jobDetails, numJobs);
        return;
    }        
    document.getElementById("number").textContent = "Email Search Results"

    //edge case when user doesnt want anything or wants default
    if (colList.every(col => col === 'none')) {
        console.log("Column Values are all none -- setting to default values")
        colList = ['Date', 'Job Title', 'Company', 'Location', 'Link', 'Source'];
    }

    //remove the JSON from before
    resultContainer.innerHTML = '';
    let ignorePhrases = [];
    if (phrasesToIgnore){
        ignorePhrases = phrasesToIgnore.split(',').map(phrase => phrase.trim());
    }
    
    //if unchecked.. (all jobs separated by email)
    jobDetails.forEach((entry, entryIndex) => {
        const headerElement = document.createElement('div');
            headerElement.innerHTML = `
            <h2 style="font-size: 1.5em; margin-bottom: 0; display: inline;">${toTitleCase(entry.jobSite)}</h2>
            <p style="font-size: 1em; margin-top: 0; margin-bottom: 3px;">${entry.subject.substring(0, 50)}...</p>
            <p style="font-size: 1em; margin-top: 0;">${convertToTimezone(entry.date)}</p>`;
            resultContainer.appendChild(headerElement);
        numJobs += entry.jobs.length;
        if (entry.jobs.length > 0){
            jobsTable = createAndPrepJobTable(colList, entry)
            forEachEntry(entry, jobsTable, colList, resultContainer, ignorePhrases)
        }
        else{
            headerElement.innerHTML += `<p>This entry contains a keyword but is not a job alert</p>`;
            const jobsTable = document.createElement('table');
            jobsTable.style.borderCollapse = 'collapse';
            jobsTable.style.overflowX = 'hidden';
            jobsTable.style.width = '100%';
            const topRow = jobsTable.insertRow();
            createDeleteEmailButton(topRow, entry);
            createOpenEmailButtonForTable(topRow, entry);
            resultContainer.appendChild(jobsTable); 
        }
        const lineBreak1 = document.createElement('br');
        resultContainer.appendChild(lineBreak1);

        // Add a horizontal line
        const horizontalLine = document.createElement('hr');
        resultContainer.appendChild(horizontalLine);

        const lineBreak3 = document.createElement('br');
        resultContainer.appendChild(lineBreak3); 
    });
    updateQuantity(jobDetails, numJobs);
}
