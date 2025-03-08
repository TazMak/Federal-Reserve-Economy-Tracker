from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from app.api.services.fred_service import FREDService
from app.api.services.regional_service import RegionalService  # Import for regional data
from app.api.services.scraper_service import ScraperService  # Added for completeness
import random

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
    

@router.get("/forecasts/{indicator}")
async def get_economic_forecasts(indicator: str):
    """
    Get economic forecasts for a specific indicator from various institutions.
    
    - indicator: The economic indicator to forecast (gdp, inflation, unemployment, interest)
    """
    try:
        # Validate the indicator
        valid_indicators = ["gdp", "inflation", "unemployment", "interest"]
        if indicator not in valid_indicators:
            raise HTTPException(status_code=400, detail=f"Invalid indicator: {indicator}")
        
        # In a production environment, you would fetch this data from:
        # 1. An external API (e.g., Federal Reserve Economic Data)
        # 2. A database where you store scraped forecast data
        # 3. Direct scraping of forecasts from institutions' websites
        
        # For demonstration purposes, we'll generate simulated forecast data
        forecasts = generate_simulated_forecasts(indicator)
        
        return forecasts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_simulated_forecasts(indicator: str):
    """Generate simulated forecast data for demonstration purposes."""
    current_year = datetime.now().year
    years = [current_year, current_year + 1, current_year + 2]
    
    # Different base values and variations for each indicator
    if indicator == "gdp":
        base_value = 2.0
        variance = 1.0
        title = "GDP Growth"
        units = "%"
    elif indicator == "inflation":
        base_value = 3.0
        variance = 1.2
        title = "Inflation Rate"
        units = "%"
    elif indicator == "unemployment":
        base_value = 4.5
        variance = 0.7
        title = "Unemployment Rate"
        units = "%"
    elif indicator == "interest":
        base_value = 5.25
        variance = 0.5
        title = "Federal Funds Rate"
        units = "%"
    else:
        base_value = 2.0
        variance = 1.0
        title = "Economic Indicator"
        units = "%"
    
    # Generate forecasts for each institution
    institutions = ["fed", "imf", "cbo", "oecd"]
    forecasts = {}
    
    for institution in institutions:
        # Each institution has slightly different forecasts
        institution_variance = random.random() * 0.5
        
        institution_forecasts = []
        for i, year in enumerate(years):
            # Each year progresses from the previous with some random variation
            random_factor = (random.random() - 0.5) * variance
            value = base_value + random_factor + (i * institution_variance)
            
            # Ensure values make sense (no negative unemployment, etc.)
            if indicator == "unemployment" and value < 2:
                value = 2
            if indicator == "interest" and value < 0:
                value = 0
            
            institution_forecasts.append({
                "year": str(year),
                "value": round(value, 1)
            })
        
        forecasts[institution] = institution_forecasts
    
    # Calculate consensus (average) forecast
    consensus = []
    for i, year in enumerate(years):
        year_forecasts = [forecasts[inst][i]["value"] for inst in institutions]
        avg_value = sum(year_forecasts) / len(year_forecasts)
        
        consensus.append({
            "year": str(year),
            "value": round(avg_value, 1)
        })
    
    forecasts["consensus"] = consensus
    
    return {
        "indicator": indicator,
        "title": title,
        "units": units,
        "forecasts": forecasts
    }
@router.get("/economic-calendar")
async def get_economic_calendar():
    """
    Get upcoming economic events and data releases.
    """
    try:
        # In a production environment, you would:
        # 1. Scrape economic calendars from sources like Fed, BLS, BEA
        # 2. Store the data in a database and regularly update it
        # 3. Return the stored calendar events
        
        # For demonstration purposes, we'll generate simulated calendar events
        events = generate_calendar_events()
        
        return {"events": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_calendar_events():
    """Generate simulated economic calendar events for demonstration purposes."""
    current_date = datetime.now()
    current_month = current_date.month
    current_year = current_date.year
    
    # Create dates for this month and next two months
    dates = []
    for i in range(3):
        month = (current_month + i - 1) % 12 + 1  # Adjust to 1-12 range
        year = current_year + (current_month + i - 1) // 12
        
        # How many days in this month
        if month in [4, 6, 9, 11]:
            days_in_month = 30
        elif month == 2:
            # Check for leap year
            if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0):
                days_in_month = 29
            else:
                days_in_month = 28
        else:
            days_in_month = 31
        
        for day in range(1, days_in_month + 1):
            dates.append(datetime(year, month, day))
    
    # Create events
    events = []
    
    # FOMC meetings (roughly every 6 weeks)
    fomc_date = datetime(current_year, current_month, 15)
    for i in range(3):
        fomc_date = fomc_date + timedelta(days=42)  # Add ~6 weeks
        
        if fomc_date >= current_date:
            events.append({
                "id": f"fomc-{i}",
                "title": "FOMC Meeting",
                "date": fomc_date.strftime("%Y-%m-%d"),
                "time": "14:00",
                "type": "fomc",
                "category": "fomc",
                "importance": "high",
                "description": "Federal Open Market Committee meeting to set monetary policy.",
                "previousValue": "Federal Funds Rate: 5.25%-5.50%"
            })
            
            # FOMC Minutes come out 3 weeks after the meeting
            minutes_date = fomc_date + timedelta(days=21)
            events.append({
                "id": f"fomc-minutes-{i}",
                "title": "FOMC Minutes",
                "date": minutes_date.strftime("%Y-%m-%d"),
                "time": "14:00",
                "type": "fomc_minutes",
                "category": "fomc",
                "importance": "medium",
                "description": "Minutes from the previous Federal Open Market Committee meeting.",
                "previousValue": None
            })
    
    # Monthly economic indicators
    for i in range(0, len(dates), 28):  # Roughly monthly
        if i < len(dates):
            base_date = dates[i]
            
            # CPI is usually released around the 10th of the month
            if base_date.day <= 10:
                cpi_date = base_date.replace(day=10 + random.randint(0, 2))  # 10th-12th
                
                if cpi_date >= current_date:
                    events.append({
                        "id": f"cpi-{i}",
                        "title": "Consumer Price Index",
                        "date": cpi_date.strftime("%Y-%m-%d"),
                        "time": "08:30",
                        "type": "cpi",
                        "category": "inflation",
                        "importance": "high",
                        "description": "Measures changes in the prices paid by consumers for goods and services.",
                        "previousValue": "+0.2% m/m, +3.1% y/y"
                    })
            
            # Jobs report is released the first Friday of the month
            first_friday = base_date.replace(day=1)
            while first_friday.weekday() != 4:  # 4 is Friday
                first_friday += timedelta(days=1)
            
            if first_friday >= current_date:
                events.append({
                    "id": f"employment-{i}",
                    "title": "Employment Situation",
                    "date": first_friday.strftime("%Y-%m-%d"),
                    "time": "08:30",
                    "type": "employment",
                    "category": "employment",
                    "importance": "high",
                    "description": "Monthly report on employment, unemployment rate, and wages.",
                    "previousValue": "Unemployment Rate: 3.8%, Nonfarm Payrolls: +216K"
                })
            
            # GDP is released near the end of the month
            gdp_date = base_date.replace(day=25 + random.randint(0, 2))  # 25th-27th
            
            # GDP is quarterly, released in Jan, Apr, Jul, Oct
            if gdp_date >= current_date and gdp_date.month in [1, 4, 7, 10]:
                events.append({
                    "id": f"gdp-{i}",
                    "title": "Gross Domestic Product",
                    "date": gdp_date.strftime("%Y-%m-%d"),
                    "time": "08:30",
                    "type": "gdp",
                    "category": "gdp",
                    "importance": "high",
                    "description": "Quarterly report on the total value of goods and services produced.",
                    "previousValue": "+3.2% q/q SAAR"
                })
            
            # Weekly jobless claims on Thursdays
            for j in range(0, 30, 7):
                if i + j < len(dates):
                    claims_date = dates[i + j]
                    if claims_date.weekday() == 3 and claims_date >= current_date:  # 3 is Thursday
                        events.append({
                            "id": f"jobless-claims-{i}-{j}",
                            "title": "Initial Jobless Claims",
                            "date": claims_date.strftime("%Y-%m-%d"),
                            "time": "08:30",
                            "type": "jobless_claims",
                            "category": "employment",
                            "importance": "medium",
                            "description": "Weekly report on the number of new jobless claims filed.",
                            "previousValue": "218K"
                        })
    
    # Sort by date
    events.sort(key=lambda x: f"{x['date']}T{x['time']}")
    
    return events