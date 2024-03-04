function getroParser(tempDocument){
    console.log(tempDocument);
    // Find all job title anchor elements
    const jobTitleAnchors = tempDocument.querySelectorAll('strong');
    console.log(jobTitleAnchors);
    const jobCompAnchors = tempDocument.querySelectorAll('td[style*="color: #6B778E; font-size: 14px;"]');
    console.log(jobCompAnchors);
    const jobLocationAnchors = tempDocument.querySelectorAll('td[style*="color: #6B778E; font-size: 13px;"]');;
    console.log(jobLocationAnchors);
    // Initialize an array to store job details
    const jobDetails = [];
    
    // Iterate over each job title element
    jobTitleAnchors.forEach((jobTitleAnchor, index) => {
        // Access the text content of the job title element
        const href = jobTitleAnchor.querySelector('a').getAttribute('href');
        // Check if there is a corresponding job location
        if (jobLocationAnchors.length > index) {
            const jobTitle = jobTitleAnchors[index].textContent.trim();
            const locationName = jobLocationAnchors[index].textContent.trim();
            const companyName = jobCompAnchors[index].textContent.trim();
            console.log(jobTitle,href,locationName,companyName);
            // Push job details to the array
            jobDetails.push({
            jobTitle,
            companyName,
            locationName,
            href
            });
        } else {
            console.log(`Getro: Job location not found for Job ${index + 1}.`);
        }
    });
    return jobDetails;
}