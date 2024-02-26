function linkedinParser(tempDocument){
    // Find all job title anchor elements
    const jobTitleAnchors = tempDocument.querySelectorAll('a.font-bold.text-md.leading-regular.text-system-blue-50');

    const jobLocationParagraphs = tempDocument.querySelectorAll('p.text-system-gray-100');
    
    // Initialize an array to store job details
    const jobDetails = [];
    
    // Iterate over each job title element
    jobTitleAnchors.forEach((jobTitleAnchor, index) => {
        // Access the text content of the job title element
        const jobTitle = jobTitleAnchor.textContent.trim();
        const href = jobTitleAnchor.getAttribute('href');
        // Check if there is a corresponding job location
        
        if (jobLocationParagraphs.length > index) {
            const jobLocationComp = jobLocationParagraphs[index].textContent.trim();
            const splitArray = jobLocationComp.split(/[·•⸱∙・]/);
            // Trim whitespace from both the company and location strings
            const companyName = splitArray[0].trim();
            const locationName = splitArray[1].trim();
            // Push job details to the array
            jobDetails.push({
            jobTitle,
            companyName,
            locationName,
            href
            });
        } else {
            console.log(`LinkedIn: Job location not found for Job ${index + 1}.`);
        }
    });
    return jobDetails;
}