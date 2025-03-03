import httpx
import json
from datetime import datetime
import pandas as pd
from fredapi import Fred
from app.config import FRED_API_KEY

class FREDService:
    """Service for interacting with the FRED API."""
    
    def __init__(self):
        self.api_key = FRED_API_KEY
        self.base_url = "https://api.stlouisfed.org/fred"
        self.fred = Fred(api_key=self.api_key) if self.api_key else None
        
    async def get_series_data(self, series_id, start_date, end_date, frequency=None):
        """
        Get time series data for a specific indicator.
        
        Args:
            series_id (str): FRED series ID
            start_date (str): Start date in YYYY-MM-DD format
            end_date (str): End date in YYYY-MM-DD format
            frequency (str, optional): Data frequency (e.g., 'm' for monthly)
            
        Returns:
            dict: Series data with metadata
        """
        if not self.api_key:
            raise Exception("FRED API key not configured")
            
        try:
            # Use async HTTP client for API requests
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/series/observations"
                params = {
                    "series_id": series_id,
                    "api_key": self.api_key,
                    "file_type": "json",
                    "observation_start": start_date,
                    "observation_end": end_date,
                }
                
                if frequency:
                    params["frequency"] = frequency
                
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                series_info_url = f"{self.base_url}/series"
                series_params = {
                    "series_id": series_id,
                    "api_key": self.api_key,
                    "file_type": "json"
                }
                
                series_response = await client.get(series_info_url, params=series_params)
                series_response.raise_for_status()
                series_info = series_response.json()
                
                # processing and formatting the data
                observations = data.get("observations", [])
                
                #  using pandas DataFrame
                df = pd.DataFrame(observations)
                if not df.empty and "date" in df.columns and "value" in df.columns:
                    df["date"] = pd.to_datetime(df["date"])
                    df["value"] = pd.to_numeric(df["value"], errors="coerce")
                    
                    df = df.sort_values("date")
                    
                    formatted_data = []
                    for _, row in df.iterrows():
                        if not pd.isna(row["value"]):
                            formatted_data.append({
                                "date": row["date"].strftime("%Y-%m-%d"),
                                "value": float(row["value"])
                            })
                    
                    return {
                        "series_id": series_id,
                        "title": series_info.get("seriess", [{}])[0].get("title", ""),
                        "units": series_info.get("seriess", [{}])[0].get("units", ""),
                        "frequency": series_info.get("seriess", [{}])[0].get("frequency_short", ""),
                        "data": formatted_data
                    }
                
                return {
                    "series_id": series_id,
                    "data": []
                }
                
        except Exception as e:
            print(f"Error fetching FRED data: {str(e)}")
            raise Exception(f"Error fetching data from FRED: {str(e)}")
    
    async def get_latest_value(self, series_id):
        """Get the latest value for a specific indicator."""
        if not self.api_key:
            raise Exception("FRED API key not configured")
            
        try:
            # use async HTTP client for API requests
            async with httpx.AsyncClient() as client:
                url = f"{self.base_url}/series/observations"
                params = {
                    "series_id": series_id,
                    "api_key": self.api_key,
                    "file_type": "json",
                    "sort_order": "desc",
                    "limit": 1
                }
                
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                
                series_info_url = f"{self.base_url}/series"
                series_params = {
                    "series_id": series_id,
                    "api_key": self.api_key,
                    "file_type": "json"
                }
                
                series_response = await client.get(series_info_url, params=series_params)
                series_response.raise_for_status()
                series_info = series_response.json()
                
                observations = data.get("observations", [])
                if observations:
                    latest = observations[0]
                    
                    return {
                        "series_id": series_id,
                        "title": series_info.get("seriess", [{}])[0].get("title", ""),
                        "units": series_info.get("seriess", [{}])[0].get("units", ""),
                        "frequency": series_info.get("seriess", [{}])[0].get("frequency_short", ""),
                        "date": latest.get("date", ""),
                        "value": float(latest.get("value", 0)) if latest.get("value", "").strip() else None
                    }
                
                return {
                    "series_id": series_id,
                    "value": None,
                    "date": None
                }
                
        except Exception as e:
            print(f"Error fetching latest FRED data: {str(e)}")
            raise Exception(f"Error fetching latest data from FRED: {str(e)}")