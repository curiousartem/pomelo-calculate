const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const currentDate = new Date();

const calculate = (accCreationMonth, accCreationYear, hasNitro) => {
  const baseNitroDate = new Date(2015, 4, 1); // May 2015 (zero-based month index)
  const baseNormalDate = new Date(2015, 4, 1); // May 2015 (zero-based month index)

  const accountDate = new Date(accCreationYear, accCreationMonth - 1); // Subtract 1 from month since JavaScript months are zero-based

  const daysElapsed = Math.ceil((currentDate - new Date(2023, 5, 5)) / (1000 * 60 * 60 * 24)); // June 5th, 2023 (zero-based month index)
  const nitroMonthsToAdd = hasNitro ? daysElapsed * 8 : 0;
  const normalMonthsToAdd = daysElapsed * 2;

  const eligibleNitroDate = new Date(baseNitroDate.getFullYear(), baseNitroDate.getMonth() + nitroMonthsToAdd, 1);
  const eligibleNormalDate = new Date(baseNormalDate.getFullYear(), baseNormalDate.getMonth() + normalMonthsToAdd, 1);

  if (hasNitro && accountDate <= eligibleNitroDate) {
    return 0;
  }

  if (!hasNitro && accountDate <= eligibleNormalDate) {
    return 0;
  }

  let monthsUntilEligible;

  if (hasNitro) {
    // Calculate the difference between the eligible nitro date and the account creation date
    monthsUntilEligible = (eligibleNitroDate.getFullYear() - accountDate.getFullYear()) * 12 + (eligibleNitroDate.getMonth() - accountDate.getMonth() - 5); //account for wave #6 where discord gave nitro users 9 months instead of 4
  } else {
    // Calculate the difference between the eligible normal date and the account creation date
    monthsUntilEligible = (eligibleNormalDate.getFullYear() - accountDate.getFullYear()) * 12 + (eligibleNormalDate.getMonth() - accountDate.getMonth() - 1);//account for wave #6 where discord gave nitro users 2 months instead of 1
  }

  const rolloutSpeed = hasNitro ? 4 : 1; // 4 months per wave for nitro users, 1 month per wave for non-nitro users

  const wavesUntilEligible = Math.ceil(monthsUntilEligible / rolloutSpeed);
  const days = Math.ceil(wavesUntilEligible / 2);
  return days;
};

// Function to prompt the user and return a promise with the input value
const promptInput = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Prompt the user for input
const getUserInput = async () => {
  const accountCreationMonth = parseInt(await promptInput('Enter the month your account was created (e.g., 1 for January): '));
  const accountCreationYear = parseInt(await promptInput('Enter the year your account was created: '));
  const hasNitro = (await promptInput('Do you have Nitro since before March 1st? (yes/no): ')).toLowerCase() === 'yes';

  const daysUntilRollout = Math.abs(calculate(accountCreationMonth, accountCreationYear, hasNitro));
  let eligibleDate = currentDate.getDate() + daysUntilRollout;

  if (isNaN(daysUntilRollout)) {
    console.log('The update rollout date cannot be determined for the given inputs.');
  } else if (daysUntilRollout === 0) {
    console.log('You are already eligible for the update!');
  } else if (currentDate.getUTCHours() != 17 && currentDate.getUTCMinutes() != 30 && daysUntilRollout === 0) 
  {
    console.log(`The update is rolling out for you today! The next wave should be in approximately ${17 - currentDate.getUTCHours()} hours.`)
  }
  else {
    const updatedDate = new Date();
    updatedDate.setDate(currentDate.getDate() + daysUntilRollout);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = updatedDate.toLocaleDateString('en-US', options);
    console.log('The update is estimated to roll out to your account on:', formattedDate);
  }

  rl.close();
};

// Call the function to start the input process
getUserInput();