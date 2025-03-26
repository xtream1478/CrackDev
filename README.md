# Password Brute Force Tool

A simple Node.js script to brute force 5-digit number combinations for a specific API endpoint.

## Setup

1. Install dependencies:
```
npm install
```

2. Run the script:
```
npm start
```

## Command Line Arguments

You can specify a range of numbers to try:

```
node password-brute.js [startNumber] [endNumber]
```

Examples:
- Try all combinations: `node password-brute.js`
- Try 10000 to 20000: `node password-brute.js 10000 20000`
- Try 50000 to end: `node password-brute.js 50000`

This is useful if you want to split the workload across multiple instances.

## Progress Tracking and Resume Functionality

The script automatically saves progress every 10 attempts to a `progress.json` file. If the script is interrupted (Ctrl+C), it will save the current progress before exiting.

When restarting, the script will automatically resume from the last saved point. If you want to start from the beginning or a specific point regardless of saved progress, use:

```
RESUME=false node password-brute.js [startNumber] [endNumber]
```

If a successful password is found, it will be saved to a `success.txt` file.

## How it works

The script will send requests to the specified API endpoint with 5-digit number passwords (from 00000 to 99999). It includes a small delay between requests to avoid rate limiting.

If a successful response is received, the script will log the working password and stop the brute force process. 