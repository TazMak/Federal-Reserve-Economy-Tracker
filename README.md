# Federal Reserve Economic Tracker

## Overview

The Federal Reserve Economic Tracker is a comprehensive web application that provides real-time visualization and analysis of key U.S. economic indicators. By leveraging data from the Federal Reserve Economic Data (FRED) API, this tool enables users to monitor critical economic metrics such as interest rates, inflation, unemployment, GDP, and regional economic data.

**Live Website**: [Federal Reserve Economic Tracker](https://67ccd05c3d47f6de34579fd8--federal-reserve-economic-tracker.netlify.app/)

## Features

- **Interactive Dashboard**: Central hub displaying key economic metrics with real-time updates
- **Economic Indicators**: Detailed visualizations for:
  - Interest Rates (Federal Funds Rate, Treasury Yield Spread)
  - Inflation (CPI, PCE Price Index)
  - Unemployment Rate and Nonfarm Payrolls
  - GDP Growth
- **Time Series Analysis**: Historical trend visualization with adjustable time ranges
- **Financial Calculators**: Tools for financial planning based on current economic conditions

## Tech Stack

### Frontend
- React.js
- Chart.js for data visualization
- React Router for navigation
- Axios for API requests

### Backend
- FastAPI (Python)
- FRED API integration
- BeautifulSoup for web scraping additional data

## Installation to run Locally

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- FRED API key ([Get one here](https://fred.stlouisfed.org/docs/api/api_key.html))

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/TazMak/Federal-Reserve-Economy-Tracker.git
cd Federal-Reserve-Economy-Tracker/backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "FRED_API_KEY=your_api_key_here" > .env
echo "DEBUG=True" >> .env

# Start the backend server
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/indicators` | List all available economic indicators |
| `/api/indicator/{series_id}` | Get data for a specific indicator |
| `/api/latest/{series_id}` | Get the latest value for an indicator |
| `/api/dashboard` | Get summary data for the dashboard |
| `/api/regional/{indicator}` | Get regional data for all states |
| `/api/treasury-yields` | Get current Treasury yield curve data |

## Deployment

This application is deployed using:
- **Backend**: Render (Web Service)
- **Frontend**: Netlify

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Federal Reserve Economic Data (FRED) for providing the economic data API
- Federal Reserve Bank of St. Louis for their economic research resources
- Chart.js for the powerful visualization library

## Contact

Project Link: [https://github.com/TazMak/Federal-Reserve-Economy-Tracker](https://github.com/TazMak/Federal-Reserve-Economy-Tracker)

Email: Tasmak1806@gmail.com

---

*This project is for educational purposes and is not affiliated with the Federal Reserve System or any government entity.*
