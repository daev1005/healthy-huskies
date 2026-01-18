const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Prevent function from waiting for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('Menu function called with:', event.queryStringParameters);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { date, period, location } = event.queryStringParameters || {};
  
  console.log('Received date:', date, 'period:', period, 'locdation:', location);
  
  if (!date || !period || !location) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Date and period are required' })
    };
  }

  const apiUrl = `https://apiv4.dineoncampus.com/locations/${location}/menu?date=${date}&period=${period}`;
  
  console.log('Fetching menu from:', apiUrl);
  
  try {
    let response;
    let data;
    
    // Try direct API call first (same as periods.js)
    try {
      response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://dining.ucsb.edu/',
          'Origin': 'https://dining.ucsb.edu'
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Direct menu API response status:', response.status);
      
      if (response.ok) {
        data = await response.json();
        console.log('Successfully fetched menu via direct API');
      } else {
        throw new Error('Direct API failed, trying proxy');
      }
    } catch (directError) {
      // Fallback to proxy
      console.log('Direct API failed, trying proxy:', directError.message);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
      
      response = await fetch(proxyUrl, {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Proxy response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Proxy failed with status: ${response.status}`);
      }
      
      const text = await response.text();
      
      try {
        data = JSON.parse(text);
        console.log('Successfully fetched menu via proxy');
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        throw new Error('Invalid JSON response from API');
      }
    }
    
    // Return success
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      },
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error('Error fetching menu:', error.message);
    
    return {
      statusCode: 503,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Retry-After': '5'
      },
      body: JSON.stringify({ 
        error: 'Service temporarily unavailable',
        message: error.message,
        retry: true
      })
    };
  }
};