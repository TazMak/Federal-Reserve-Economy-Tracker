# Federal Reserve Economic Tracker

## Overview

The Federal Reserve Economic Tracker is a comprehensive web application that provides real-time visualization and analysis of key U.S. economic indicators. By leveraging data from the Federal Reserve Economic Data (FRED) API, this tool enables users to monitor critical economic metrics such as interest rates, inflation, unemployment, GDP, and regional economic data.

**Live Website**: [Federal Reserve Economic Tracker](https://federal-reserve-economic-tracker.netlify.app/)
(Note: Data may take a minute or two to load, if website states "Failed to load data", please wait a minute or two, then refresh the page and try again"
## Features

- **Interactive Dashboard**: Central hub displaying key economic metrics with real-time updates

![image](https://github.com/user-attachments/assets/56eeb3f1-6ec4-4555-8e0c-c6745071687a)

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

### Developed Using:
- Node.js (v14 or higher)
- Python 3.8+
- FRED API key ([Get one here](https://fred.stlouisfed.org/docs/api/api_key.html))


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

## Acknowledgments

- Federal Reserve Economic Data (FRED) for providing the economic data API
- Federal Reserve Bank of St. Louis for their economic research resources
- Chart.js for the powerful visualization library

## Contact

Project Link: [https://github.com/TazMak/Federal-Reserve-Economy-Tracker](https://github.com/TazMak/Federal-Reserve-Economy-Tracker)

Email: Tasmak1806@gmail.com

---

*This project is for educational purposes and is not affiliated with the Federal Reserve System or any government entity.*
