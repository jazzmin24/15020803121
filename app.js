const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876;

const windowSize = 10;
let numberStore = [];
const testServerUrls = {
  'p': 'http://20.244.56.144/test/primes',
  'f': 'http://20.244.56.144/test/fibo',
  'e': 'http://20.244.56.144/test/even',
  'r': 'http://20.244.56.144/test/rand'
};

async function fetchNumbers(url) {
    const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwMTU3NzM3LCJpYXQiOjE3MjAxNTc0MzcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA1NjFiMDY4LWI4YWItNDIzMy05ZGU4LTk3NTI3MDdkOTEwOSIsInN1YiI6Imphc21pbmJhamFqODBAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiQWZmb3JkbWVkIiwiY2xpZW50SUQiOiIwNTYxYjA2OC1iOGFiLTQyMzMtOWRlOC05NzUyNzA3ZDkxMDkiLCJjbGllbnRTZWNyZXQiOiJvbVRTUkJKaGNMVGt6UkdpIiwib3duZXJOYW1lIjoiSmFzbWluIiwib3duZXJFbWFpbCI6Imphc21pbmJhamFqODBAZ21haWwuY29tIiwicm9sbE5vIjoiMTUwMjA4MDMxMjEifQ.2j07QSQO0fo5J0s-n8IhHNzBmyNPRTWTGI0mG2go-sw'; // Replace with actual token
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: authHeader
        },
        timeout: 500
      });
      return response.data.numbers || [];
    } catch (error) {
      console.error('Error fetching numbers:', error.message);
      return [];
    }
  }

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

app.get('/numbers/:numberId', async (req, res) => {
  const numberId = req.params.numberId;
  if (!testServerUrls[numberId]) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const url = testServerUrls[numberId];
  const newNumbers = await fetchNumbers(url);

  const windowPrevState = [...numberStore];
  const uniqueNewNumbers = newNumbers.filter(num => !numberStore.includes(num));

  numberStore.push(...uniqueNewNumbers);
  if (numberStore.length > windowSize) {
    numberStore = numberStore.slice(-windowSize);
  }

  const windowCurrState = [...numberStore];
  const average = calculateAverage(windowCurrState);

  res.json({
    numbers: newNumbers,
    windowPrevState: windowPrevState,
    windowCurrState: windowCurrState,
    avg: average.toFixed(2)
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
