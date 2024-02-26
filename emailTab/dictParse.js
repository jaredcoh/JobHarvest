//all generic file names on smallFunctions.js (use Cntrl + F)

function dictionaryParser(resultContainer, jobDetails, colList, phrasesToIgnore) {
    console.log("Start Parsing");
    //do not do all the crazy stuff below if nothing exists
    if (jobDetails.length === 0){
        resultContainer.innerHTML = 'No Jobs to show';
        return;
    }        

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
    });
}
