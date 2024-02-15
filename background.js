// Function to periodically check for new job-related emails
const checkForJobEmails = async () => {
    console.log("Checking for job emails...");
    // Get OAuth token using Chrome Identity API
    const token = await getOAuthToken(); 
    const apiKey = "AIzaSyDGj6fCXhfKER_ZCknY6dHBHt7k4w8e_fM"
    // Call the getEmailSubjects function to fetch emails
    const jobEmails = await getEmailinfo(apiKey, token);
    console.log(jobEmails.length, "email(s) with key information" );
    if (jobEmails.length > 0){
        chrome.action.setBadgeText({ text: jobEmails.length.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#FFD9A0' });
        chrome.action.setBadgeTextColor({ color: '#111111' });
    }
    else{
        chrome.action.setBadgeText({ text:"" });
    }
};

// Call checkForJobEmails initially and then based on user-selected interval
(async () => {
    try {
        await checkForJobEmails(); // Check initially
        // Check every selected interval (in minutes)
        const selectedValue = await fetchSelectedValue();
        setInterval(checkForJobEmails, 2 * 60 * 1000);
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();

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

async function fetchNumEmails() {
    return new Promise((resolve) => {
        chrome.storage.local.get("numEmails", (result) => {
            resolve(result.numEmails || 10); // Default number of 10
        });
    });
};

async function fetchSelectedValue() {
    return new Promise((resolve) => {
        chrome.storage.local.get("autoEmailChecksDropdown", (result) => {
            resolve(result.autoEmailChecksDropdown || 10); // Default interval of 5 minutes
        });
    });
};

async function getEmailinfo(apiKey, token) {
    // Get the selected value from the dropdown
    const numEmails = await fetchNumEmails();
    const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=in:inbox&maxResults=${numEmails}&key=${apiKey}`;
  
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (response.ok) {
        const jsonResponse = await response.json();
        const messageIds = jsonResponse.messages.map(message => message.id);
        const emailDetails = [];
        for (const messageId of messageIds) {
            const url2 = `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?key=${apiKey}`;
            const response2 = await fetch(url2, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
  
        if (response2.ok) {
            const result = await response2.json();
            const fromHeader = result.payload.headers.find(header => header.name.toLowerCase() === 'from');
            const jobSiteList = ['linkedin job', 'glassdoor job' , 'indeed'];
            let jobSite = '';
          
            for (const keyword of jobSiteList) {
                if (fromHeader.value.toLowerCase().includes(keyword)) {
                jobSite = keyword.replace(' job', ''); // Extract the job site name
                break;
                }
            }
  
            if (!jobSite) {
                // Do not continue with this email
                continue;
            }
            emailDetails.push(jobSite)
             
            console.log(emailDetails)
        }
      }
  
      return emailDetails;
    } else {
      console.error("Was not ok'd");
      return [];
    }
}


function urlSafeBase64Decode(base64) {
// Replace '-' with '+' and '_' with '/'
    const modifiedBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    const paddedBase64 = modifiedBase64 + '==='.slice(0, (4 - modifiedBase64.length % 4) % 4);

    // Decode base64
    return atob(paddedBase64);
}

