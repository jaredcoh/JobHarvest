

chrome.storage.local.get(["ignorePhrases", "numEmails", "sheetsURL", "sheetsTab", "startColumn", "endColumn", "column1", "column2", "column3", "column4", "column5", "column6"], function(data) {
  // Extract constants from the retrieved data
  console.log(data);
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
  const apiKey = "AIzaSyDGj6fCXhfKER_ZCknY6dHBHt7k4w8e_fM";

  console.log("Executing script with constants:");
  console.log("sheetsURL:", sheetsURL);
  console.log("sheetsTab:", sheetsTab);
  console.log("startColumn:", startColumn);
  console.log("endColumn:", endColumn);
  console.log("numEmails:", numEmails);
  console.log("column1:", column1);
  console.log("column2:", column2);
  console.log("column3:", column3);
  console.log("column4:", column4);
  console.log("column5:", column5);
  console.log("column6:", column6);
  console.log("ignorePhrases:", ignorePhrases);
  columnList = [column1, column2, column3, column4, column5, column6]
  // Call your function or execute your code here
  
  if (document.getElementById("search") && document.getElementById("resultsContainer")) {
    let searchButton = document.getElementById("search");
    let resultContainer = document.getElementById("resultsContainer")
    searchButton.onclick = async () => {
      console.log("START");
      console.log(searchButton)
      searchButton.value = "Identifying User...";
      // Get OAuth token using Chrome Identity API
      const token = await getOAuthToken();
      searchButton.value = "Searching...";
      // Call getEmailSubjects and pass apiKey, token, and resultsContainer
      const emailDetails = await getEmailSubjects(apiKey, token, numEmails);
      searchButton.value = "Parsing...";
      // Call dictionaryParser with the output of getEmailSubjects
      dictionaryParser(resultsContainer, emailDetails, columnList, ignorePhrases);
      searchButton.value = "Finished!";
      setTimeout(() => {
        searchButton.value = "Search Your Email";
      }, 2000);
    };
  }
});



async function getEmailSubjects(apiKey, token, numEmails) {
  // Get the selected value from the dropdown
  const url = `https://www.googleapis.com/gmail/v1/users/me/messages?q=in:inbox&maxResults=${numEmails}&key=${apiKey}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (response.ok) {
    const jsonResponse = await response.json();
    console.log(jsonResponse)
    const messageIds = jsonResponse.messages.map(message => message.id);
    const threadIds = jsonResponse.messages.map(message => message.threadId);
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
        const dateHeader = result.payload.headers.find(header => header.name.toLowerCase() === 'date');
        const subjectHeader = result.payload.headers.find(header => header.name.toLowerCase() === 'subject');
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
        
        // Extract HTML content from the payload
        const parts = result.payload.parts || [result.payload];
        let htmlContent = '';

        for (const part of parts) {
          if (part.mimeType === 'text/html' && part.body && part.body.data) {
            htmlContent = urlSafeBase64Decode(part.body.data);
            break; // Stop after finding the first HTML part
          }
        }

        const tempDocument = new DOMParser().parseFromString(htmlContent, 'text/html');

        let jobDetails = [];
        if (jobSite === 'linkedin'){
          jobDetails = linkedinParser(tempDocument);
        } else if (jobSite === 'indeed'){
          jobDetails = indeedParser(tempDocument);
        } else if (jobSite === 'glassdoor'){
          jobDetails = glassdoorParser(tempDocument);
        }

        // Create emailInfo object with job details
        const emailInfo = {
          id: messageId,
          threadId: (jsonResponse.messages.find(msg => msg.id === messageId) || {}).threadId || null,
          from: fromHeader ? fromHeader.value : 'N/A',
          date: dateHeader ? dateHeader.value : 'N/A',
          subject: subjectHeader ? subjectHeader.value : 'N/A',
          jobSite: jobSite,
          jobs: jobDetails
        };
      
        // Push emailInfo to the emailDetails array
        emailDetails.push(emailInfo);
      }
    }

    return emailDetails;
  } else {
    console.error("One or more DOM elements not found.");
    return [];
  }
}
