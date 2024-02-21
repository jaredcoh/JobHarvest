//all generic file names on smallFunctions.js (use Cntrl + F)

function dictionaryParser(resultContainer, jobDetails) {
    console.log("Start Parsing");
    chrome.action.setBadgeText({ text: jobDetails.length.toString() });
    //do not do all the crazy stuff below if nothing exists
    if (jobDetails.length === 0){
        resultContainer.innerHTML = 'No Jobs to show';
        return;
    }        
    let colList = [];
    // getting column values
    for (let i = 1; i <= 6; i++) {
        const colValue = document.getElementById(`option${i}`).value;
        colList.push(colValue);
    }

    //edge case when user doesnt want anything or wants default
    if (colList.every(col => col === 'none')) {
        console.log("Column Values are all none -- setting to default values")
        colList = ['Date', 'Job Title', 'Company', 'Location', 'Link', 'Source'];
    }

    //remove the JSON from before
    resultContainer.innerHTML = '';

    const combineJobsCheckbox = document.getElementById("combineJobs");

    const phrasesToIgnore = document.getElementById("phrasesToIgnore").value
    ? document.getElementById("phrasesToIgnore").value.toLowerCase().split(',').map(phrase => phrase.trim()).filter(phrase => phrase !== "") : [];
    
    // if checked... (all jobs in one big table)
    if (combineJobsCheckbox.checked) {
        jobsTable = createAndPrepJobTable(colList, "")
        jobDetails.forEach(entry => {
            forEachEntry(entry, jobsTable, colList, resultContainer, phrasesToIgnore)
        });
        resultContainer.appendChild(jobsTable);
    } else {
        //if unchecked.. (all jobs separated by email)
        jobDetails.forEach((entry, entryIndex) => {
            console.log(entry)
            const headerElement = document.createElement('div');
                headerElement.innerHTML = `
                <h2 style="font-size: 1.5em; margin-bottom: 0; display: inline;">${toTitleCase(entry.jobSite)}</h2>
                <p style="font-size: 1em; margin-top: 0; margin-bottom: 3px;">${entry.subject.substring(0, 50)}...</p>
                <p style="font-size: 1em; margin-top: 0;">${convertToTimezone(entry.date)}</p>`;
                resultContainer.appendChild(headerElement);
            if (entry.jobs.length > 0){
                console.log(entry.jobs)
                

                jobsTable = createAndPrepJobTable(colList, entry)
                forEachEntry(entry, jobsTable, colList, resultContainer, phrasesToIgnore)
            }
            else{
                headerElement.innerHTML += `<p>This entry contains a keyword but is not a job alert</p>`;
            }
        });
    }
    console.log("FINISHED");
}
