const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
  Referer: "https://dining.ucsb.edu/",
  Origin: "https://dining.ucsb.edu",
};

const fetchJsonWithProxyFallback = async (apiUrl) => {
  try {
    const directResponse = await fetch(apiUrl, { headers: DEFAULT_HEADERS });
    if (!directResponse.ok) {
      throw new Error(`Direct request failed with status ${directResponse.status}`);
    }
    return await directResponse.json();
  } catch (directError) {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
    const proxyResponse = await fetch(proxyUrl);

    if (!proxyResponse.ok) {
      throw new Error(`Proxy request failed with status ${proxyResponse.status}`);
    }

    return await proxyResponse.json();
  }
};

// @desc    Fetch dining periods for a location/date
// @route   GET /api/dining/periods?date=YYYY-MM-DD&location=<id>
// @access  Public
const getDiningPeriods = async (req, res) => {
  const { date, location } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  try {
    const apiUrl = `https://apiv4.dineoncampus.com/locations/${location}/periods?date=${date}`;
    const data = await fetchJsonWithProxyFallback(apiUrl);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to fetch periods",
      message: error.message,
    });
  }
};

// @desc    Fetch dining menu for location/date/period
// @route   GET /api/dining/menu?date=YYYY-MM-DD&period=<id>&location=<id>
// @access  Public
const getDiningMenu = async (req, res) => {
  const { date, period, location } = req.query;

  if (!date || !period || !location) {
    return res.status(400).json({ error: "Date, period, and location are required" });
  }

  try {
    const apiUrl = `https://apiv4.dineoncampus.com/locations/${location}/menu?date=${date}&period=${period}`;
    const data = await fetchJsonWithProxyFallback(apiUrl);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(503).json({
      error: "Service temporarily unavailable",
      message: error.message,
      retry: true,
    });
  }
};

module.exports = { getDiningPeriods, getDiningMenu };
