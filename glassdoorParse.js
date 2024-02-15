function glassdoorParser(tempDocument) {
    // Find all job tables with class ending in "jobTable"
    const jobTables = tempDocument.querySelectorAll('table[class$="jobTable"]');

    // Initialize an array to store all job details
    const allJobDetails = [];

    // Iterate over each job table
    jobTables.forEach((jobTable, tableIndex) => {
        // Find all job title anchor elements within the current job table
        const jobTitleAnchors = jobTable.querySelectorAll('a[class*="gd-ytumd6"]');
        const LocationAnchors = jobTable.querySelectorAll('span[class*="gd-1paj1yl"]');
        const CompanyAnchors = jobTable.querySelectorAll('span[class*="gd-y6uhzt"]');
        // Initialize an array to store job details for the current table
        const jobDetails = [];

        // Iterate over each job title element within the current table
        jobTitleAnchors.forEach((jobTitleAnchor, index) => {
            // Access the text content of the job title element
            const jobTitle = jobTitleAnchor.textContent.trim();
            const href = jobTitleAnchor.getAttribute('href');

            // Check if there is a corresponding job location and company
            if (LocationAnchors.length > index && CompanyAnchors.length > index) {
                const locationName = LocationAnchors[index].textContent.trim();
                const companyName = CompanyAnchors[index].textContent.trim();

                // Push job details to the array for the current table
                jobDetails.push({
                    jobTitle,
                    companyName,
                    locationName, 
                    href
                }); 
            }
        });

        // Add the job details for the current table to the overall array
        allJobDetails.push(...jobDetails);
    });

    return allJobDetails;
}
