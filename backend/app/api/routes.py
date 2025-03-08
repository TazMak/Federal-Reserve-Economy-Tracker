from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from app.api.services.fred_service import FREDService
from app.api.services.regional_service import RegionalService  # Import for regional data
from app.api.services.scraper_service import ScraperService  # Added for completeness

router = APIRouter()
fred_service = FREDService()
regional_service = RegionalService()  # Initialize the regional service
scraper_service = ScraperService()  # Added for completeness

@router.get("/indicators")
async def get_available_indicators():
    """Get a list of available economic indicators."""
    return {
        "indicators": [
            {"id": "FEDFUNDS", "name": "Federal Funds Effective Rate", "category": "Interest Rates"},
            {"id": "DFF", "name": "Federal Funds Rate (Daily)", "category": "Interest Rates"},
            {"id": "UNRATE", "name": "Unemployment Rate", "category": "Labor Market"},
            {"id": "CPIAUCSL", "name": "Consumer Price Index for All Urban Consumers", "category": "Inflation"},
            {"id": "GDPC1", "name": "Real Gross Domestic Product", "category": "National Accounts"},
            {"id": "PAYEMS", "name": "All Employees, Total Nonfarm", "category": "Labor Market"},
            {"id": "T10Y2Y", "name": "10-Year Treasury Constant Maturity Minus 2-Year Treasury", "category": "Interest Rates"},
            {"id": "SP500", "name": "S&P 500", "category": "Financial Markets"},
        ]
    }

@router.get("/indicator/{series_id}")
async def get_indicator(
    series_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    frequency: Optional[str] = None
):
    """
    Get data for a specific economic indicator.
    
    - series_id: FRED series ID (e.g., UNRATE, CPIAUCSL)
    - start_date: Start date (YYYY-MM-DD)
    - end_date: End date (YYYY-MM-DD)
    - frequency: Data frequency (e.g., 'm' for monthly, 'd' for daily)
    """
    # sets the default time period if it's not yet provided (for last 5 years)
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    
    if not start_date:
        start = datetime.now() - relativedelta(years=5)
        start_date = start.strftime("%Y-%m-%d")
    
    try:
        data = await fred_service.get_series_data(series_id, start_date, end_date, frequency)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest/{series_id}")
async def get_latest_value(series_id: str):
    """Get the latest value for a specific indicator."""
    try:
        latest = await fred_service.get_latest_value(series_id)
        return latest
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def get_dashboard_data():
    """Get summary data for the main dashboard."""
    try:
        indicators = ["FEDFUNDS", "UNRATE", "CPIAUCSL", "GDPC1"]
        results = {}
        
        for indicator in indicators:
            latest = await fred_service.get_latest_value(indicator)
            results[indicator] = latest
            
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoints for regional data
@router.get("/regional/{indicator}")
async def get_regional_data(indicator: str):
    """
    Get regional economic data for all states for a specific indicator.
    
    - indicator: Indicator ID (e.g., UNRATE, MSPUS, PCPI)
    """
    try:
        data = await regional_service.get_regional_data(indicator)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/regional/{indicator}/{state_code}")
async def get_state_data(indicator: str, state_code: str):
    """
    Get detailed economic data for a specific state.
    
    - indicator: Indicator ID (e.g., UNRATE, MSPUS, PCPI)
    - state_code: Two-letter state code (e.g., CA, NY, TX)
    """
    try:
        data = await regional_service.get_state_data(indicator, state_code)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to get available regional indicators
@router.get("/regional-indicators")
async def get_regional_indicators():
    """Get a list of available regional economic indicators."""
    return {
        "indicators": [
            {"id": "UNRATE", "name": "Unemployment Rate", "category": "Labor Market"},
            {"id": "MSPUS", "name": "Median House Price", "category": "Housing"},
            {"id": "PCPI", "name": "Per Capita Personal Income", "category": "Income"}
        ]
    }

# Treasury yield data from scraper service
@router.get("/treasury-yields")
async def get_treasury_yields():
    """Get current Treasury yield curve data."""
    try:
        data = await scraper_service.scrape_treasury_yields()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# FOMC statements from scraper service
@router.get("/fomc-statements")
async def get_fomc_statements():
    """Get recent FOMC statements."""
    try:
        data = await scraper_service.scrape_fomc_statements()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))