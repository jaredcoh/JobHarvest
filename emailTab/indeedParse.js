function indeedParser(tempDocument) {
    console.log(tempDocument)
    const jobAnchorLetters = ['l', 'k'];
    const locAnchorLetters = ['q', 'v'];
    const comAnchorLetters = ['p', 'u'];
    
    let jobTitleAnchors, LocationAnchors, CompanyAnchors;
    
    for (let i = 0; i < jobAnchorLetters.length; i++) {
        const jobLetter = jobAnchorLetters[i];
        const locLetter = locAnchorLetters[i];
        const comLetter = comAnchorLetters[i];
    
        const jobSelector = `td[class*=r-${jobLetter}] a`;
        const locSelector = `span[class*="r-${locLetter}"]`;
        const comSelector = `span[class*="r-${comLetter}"]`;
    
        jobTitleAnchors = tempDocument.querySelectorAll(jobSelector);
        LocationAnchors = tempDocument.querySelectorAll(locSelector);
        CompanyAnchors = tempDocument.querySelectorAll(comSelector);
        console.log(jobLetter, jobTitleAnchors.length)
        console.log(locLetter, LocationAnchors.length)
        console.log(comLetter, CompanyAnchors.length)
        // Check if all elements are found and have the same quantity
        if (jobTitleAnchors.length > 0 && LocationAnchors.length > 0 && CompanyAnchors.length > 0 &&
            jobTitleAnchors.length === LocationAnchors.length && LocationAnchors.length === CompanyAnchors.length) {
            
            console.log('breaking out of loop')
            break;
        }
    }
    
    // Initialize an array to store job details
    const jobDetails = [];

    // Iterate over each job title element
    jobTitleAnchors.forEach((jobTitleAnchor, index) => {
        // Access the text content of the job title element
        const jobTitle = jobTitleAnchor.textContent.trim();
        const href = jobTitleAnchor.getAttribute('href');
        // Check if there is a corresponding job location and company
        if (LocationAnchors.length > index && CompanyAnchors.length > index) {
            const locationName = LocationAnchors[index].textContent.trim().replace("- ", "");
            const companyName = CompanyAnchors[index].textContent.trim().replace(/\u00C2/, "");
            // Push job details to the array
            jobDetails.push({
                jobTitle,
                companyName,
                locationName,
                href
            });
        } 
        else 
        {
            console.log(`Indeed: Job location or company not found for Job ${index + 1}.`);
        }
    })
    return jobDetails;
};
        

    
