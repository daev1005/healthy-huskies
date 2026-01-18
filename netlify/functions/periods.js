const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  console.log('Periods function called with:', event.queryStringParameters);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') { //external browser asking what is allowed
    return {
      statusCode: 200, //gives the OK response
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }, //what my browser allows from other browsers
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') { //if not a GET request return error
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { date, location } = event.queryStringParameters || {};
  
  if (!date) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Date is required' })
    };
  }

  if (!location) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Location is required' })
    };
  }

  try {
    // API endpoint to get all periods for a location on a given date
    const apiUrl = `https://apiv4.dineoncampus.com/locations/${location}/periods?date=${date}`;
    
    console.log('Fetching periods from:', apiUrl);
    
    let response;
    let data;
    
    // Try direct API call with headers
    try {
      response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://dining.ucsb.edu/',
          'Origin': 'https://dining.ucsb.edu'
        }
      });
      
      console.log('Direct periods API response status:', response.status);
      
      if (response.ok) {
        data = await response.json();
      } else {
        throw new Error('Direct API failed, trying proxy');
      }
    } catch (directError) {
      // Fallback to proxy
      console.log('Direct API failed, trying proxy');
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
      
      response = await fetch(proxyUrl);
      console.log('Proxy response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Proxy failed with status: ${response.status}`);
      }
      
      data = await response.json();
    }
    
    console.log('Successfully fetched periods');
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate' // Don't cache periods!
      },
      body: JSON.stringify(data)
    };
    
  } catch (error) {
    console.error('Error in periods function:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch periods',
        message: error.message
      })
    };
  }
};