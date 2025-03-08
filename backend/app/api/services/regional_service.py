import httpx
import pandas as pd
from fredapi import Fred
import json
import random
from datetime import datetime, timedelta
from app.config import FRED_API_KEY

class RegionalService:
    """Service for handling regional economic data from FRED."""
    
    def __init__(self):
        self.api_key = FRED_API_KEY
        self.fred = Fred(api_key=self.api_key) if self.api_key else None
        self.base_url = "https://api.stlouisfed.org/fred"
        
        # State code to name mapping
        self.state_codes = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
            'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
            'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
            'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
            'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
            'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
            'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
            'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
            'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
            'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
            'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
            'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
            'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
        }
        
        # Mapping of indicators to their state-level series ID patterns
        self.regional_indicators = {
            'UNRATE': {
                'pattern': '{state_code}UR',  # e.g., CAUR for California Unemployment Rate
                'name': 'Unemployment Rate',
                'units': 'percent'
            },
            'MSPUS': {
                'pattern': 'MEDLISPRI{state_code}',  # Median Listing Price
                'name': 'Median House Price',
                'units': 'dollars'
            },
            'PCPI': {
                'pattern': '{state_code}PCPI',  # Per Capita Personal Income
                'name': 'Per Capita Personal Income',
                'units': 'dollars'
            }
        }
    
    async def get_regional_data(self, indicator):
        """Get data for all states for a given indicator."""
        if not self.api_key:
            raise Exception("FRED API key not configured")
        
        if indicator not in self.regional_indicators:
            raise Exception(f"Indicator {indicator} not supported for regional data")
            
        indicator_info = self.regional_indicators[indicator]
        states_data = []
        
        # For the map visualization, we need data for all states
        # If we can't get real data, we'll use simulated data to demonstrate the UI
        use_simulated_data = False
        
        if indicator == 'MSPUS':
            # FRED doesn't have median house prices for all states in the same format
            # We'll simulate this data for demonstration purposes
            use_simulated_data = True
            
            # Get national median house price as a baseline
            try:
                async with httpx.AsyncClient() as client:
                    url = f"{self.base_url}/series/observations"
                    params = {
                        "series_id": "MSPUS",  # Median Sales Price of Houses Sold for US
                        "api_key": self.api_key,
                        "file_type": "json",
                        "sort_order": "desc",
                        "limit": 1
                    }
                    
                    response = await client.get(url, params=params)
                    response.raise_for_status()
                    data = response.json()
                    
                    observations = data.get("observations", [])
                    if observations:
                        latest = observations[0]
                        national_value = float(latest.get("value", 350000))
                        date = latest.get("date", datetime.now().strftime("%Y-%m-%d"))
                    else:
                        # Default if no data available
                        national_value = 350000
                        date = datetime.now().strftime("%Y-%m-%d")
                        
                    # Generate simulated data for each state
                    for state_code, state_name in self.state_codes.items():
                        # Adjust national value by a random factor to simulate regional differences
                        adjustment = random.uniform(0.7, 1.5)
                        state_value = national_value * adjustment
                        
                        states_data.append({
                            "code": state_code,
                            "name": state_name,
                            "value": round(state_value),
                            "date": date,
                            "overview": self._get_state_overview(state_code, round(state_value), indicator)
                        })
            except Exception as e:
                print(f"Error fetching national house price data: {str(e)}")
                # If we can't get national data, use a default value
                for state_code, state_name in self.state_codes.items():
                    adjustment = random.uniform(0.7, 1.5)
                    state_value = 350000 * adjustment
                    
                    states_data.append({
                        "code": state_code,
                        "name": state_name,
                        "value": round(state_value),
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "overview": self._get_state_overview(state_code, round(state_value), indicator)
                    })
        
        # For UNRATE and PCPI, try to get real data from FRED
        if not use_simulated_data:
            for state_code, state_name in self.state_codes.items():
                # The pattern is sometimes {state_code}INDICATOR and sometimes INDICATOR{state_code}
                # Make sure it matches your actual FRED series IDs
                series_id = indicator_info['pattern'].format(state_code=state_code)
                
                try:
                    # Use async HTTP client for API requests
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
                        
                        # Some state-level series might not exist, so handle 404s gracefully
                        if response.status_code == 404:
                            # If the series doesn't exist with this pattern, try alternative pattern
                            alternative_series_id = indicator_info['pattern'].replace('{state_code}', '')
                            alternative_series_id = f"{state_code}{alternative_series_id}"
                            
                            params["series_id"] = alternative_series_id
                            response = await client.get(url, params=params)
                            
                            if response.status_code == 404:
                                # If still not found, add empty data for this state
                                states_data.append({
                                    "code": state_code,
                                    "name": state_name,
                                    "value": None,
                                    "date": None,
                                    "overview": None
                                })
                                continue
                        
                        response.raise_for_status()
                        data = response.json()
                        
                        observations = data.get("observations", [])
                        if observations:
                            latest = observations[0]
                            value = float(latest.get("value", 0)) if latest.get("value", "").strip() else None
                            date = latest.get("date", "")
                            
                            states_data.append({
                                "code": state_code,
                                "name": state_name,
                                "value": value,
                                "date": date,
                                "overview": self._get_state_overview(state_code, value, indicator)
                            })
                        else:
                            states_data.append({
                                "code": state_code,
                                "name": state_name,
                                "value": None,
                                "date": None,
                                "overview": None
                            })
                except Exception as e:
                    print(f"Error fetching data for {state_code}: {str(e)}")
                    # If there's an error, add the state with null data
                    states_data.append({
                        "code": state_code,
                        "name": state_name,
                        "value": None,
                        "date": None,
                        "overview": None
                    })
        
        return {
            "indicator": indicator,
            "name": indicator_info['name'],
            "units": indicator_info['units'],
            "states": states_data
        }
    
    async def get_state_data(self, indicator, state_code):
        """Get detailed data for a specific state."""
        if not self.api_key:
            raise Exception("FRED API key not configured")
        
        if indicator not in self.regional_indicators:
            raise Exception(f"Indicator {indicator} not supported for regional data")
            
        if state_code not in self.state_codes:
            raise Exception(f"Invalid state code: {state_code}")
            
        indicator_info = self.regional_indicators[indicator]
        series_id = indicator_info['pattern'].format(state_code=state_code)
        
        try:
            # Use async HTTP client for API requests
            async with httpx.AsyncClient() as client:
                # Get the latest value
                url = f"{self.base_url}/series/observations"
                params = {
                    "series_id": series_id,
                    "api_key": self.api_key,
                    "file_type": "json",
                    "sort_order": "desc",
                    "limit": 1
                }
                
                response = await client.get(url, params=params)
                
                # If not found with this pattern, try alternative pattern
                if response.status_code == 404:
                    alternative_series_id = indicator_info['pattern'].replace('{state_code}', '')
                    alternative_series_id = f"{state_code}{alternative_series_id}"
                    
                    params["series_id"] = alternative_series_id
                    response = await client.get(url, params=params)
                
                # If it's still 404 and we're looking for house prices, use simulated data
                if response.status_code == 404 and indicator == 'MSPUS':
                    # Generate synthetic data for demonstration
                    national_value = 350000  # Default national median
                    adjustment = random.uniform(0.7, 1.5)
                    value = national_value * adjustment
                    value = round(value)
                    date = datetime.now().strftime("%Y-%m-%d")
                    
                    # Get additional metrics for this state
                    additional_metrics = await self._get_additional_metrics(state_code)
                    
                    # Get a simple economic overview for the state
                    overview = self._get_state_overview(state_code, value, indicator)
                    
                    return {
                        "code": state_code,
                        "name": self.state_codes[state_code],
                        "indicator": indicator,
                        "indicator_name": indicator_info['name'],
                        "value": value,
                        "date": date,
                        "additionalMetrics": additional_metrics,
                        "overview": overview,
                        "note": "Simulated data for demonstration purposes"
                    }
                
                response.raise_for_status()
                data = response.json()
                
                observations = data.get("observations", [])
                if not observations:
                    raise Exception(f"No data available for {state_code}")
                    
                latest = observations[0]
                value = float(latest.get("value", 0)) if latest.get("value", "").strip() else None
                date = latest.get("date", "")
                
                # Get additional metrics for this state
                additional_metrics = await self._get_additional_metrics(state_code)
                
                # Get a simple economic overview for the state
                overview = self._get_state_overview(state_code, value, indicator)
                
                return {
                    "code": state_code,
                    "name": self.state_codes[state_code],
                    "indicator": indicator,
                    "indicator_name": indicator_info['name'],
                    "value": value,
                    "date": date,
                    "additionalMetrics": additional_metrics,
                    "overview": overview
                }
                
        except Exception as e:
            print(f"Error fetching state data: {str(e)}")
            raise Exception(f"Error fetching data for {state_code}: {str(e)}")
    
    async def _get_additional_metrics(self, state_code):
        """Get additional economic metrics for a state."""
        metrics = []
        
        # Define which additional metrics to get for each state
        additional_indicators = [
            # Additional metrics to show when a state is selected
            # Each would have its own FRED series ID pattern
            {
                'id': 'GDP',
                'name': 'Gross State Product',
                'pattern': 'RGSP{state_code}',
                'formatter': 'currency'
            },
            {
                'id': 'POPGROWTH',
                'name': 'Population Growth',
                'pattern': 'SPPOP{state_code}',
                'formatter': 'percent'
            }
        ]
        
        for indicator in additional_indicators:
            series_id = indicator['pattern'].format(state_code=state_code)
            
            try:
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
                    
                    # Skip if series doesn't exist
                    if response.status_code == 404:
                        # For demonstration, add simulated data
                        if indicator['id'] == 'GDP':
                            value = random.uniform(200000, 2000000)
                            formatted_value = f"${value:,.0f} million"
                        elif indicator['id'] == 'POPGROWTH':
                            value = random.uniform(-0.5, 2.0)
                            formatted_value = f"{value:.1f}%"
                        else:
                            continue
                            
                        metrics.append({
                            "id": indicator['id'],
                            "name": indicator['name'],
                            "value": value,
                            "formattedValue": formatted_value,
                            "date": datetime.now().strftime("%Y-%m-%d"),
                            "note": "Simulated data"
                        })
                        continue
                        
                    response.raise_for_status()
                    data = response.json()
                    
                    observations = data.get("observations", [])
                    if observations:
                        latest = observations[0]
                        value = float(latest.get("value", 0)) if latest.get("value", "").strip() else None
                        
                        # Format the value based on the indicator type
                        formatted_value = value
                        if value is not None:
                            if indicator['formatter'] == 'percent':
                                formatted_value = f"{value:.1f}%"
                            elif indicator['formatter'] == 'currency':
                                formatted_value = f"${value:,.0f}"
                        
                        metrics.append({
                            "id": indicator['id'],
                            "name": indicator['name'],
                            "value": value,
                            "formattedValue": formatted_value,
                            "date": latest.get("date", "")
                        })
            except Exception as e:
                print(f"Error fetching additional metric for {state_code}: {str(e)}")
                # Continue with other metrics if one fails
                continue
        
        return metrics
    
    def _get_state_overview(self, state_code, current_value, indicator):
        """Generate a simple economic overview for the state based on current data."""
        # This would typically come from a database or external API
        # For demonstration, we'll generate a simple overview based on the indicator value
        
        state_name = self.state_codes[state_code]
        
        if indicator == 'UNRATE':
            if current_value is None:
                return f"Economic data for {state_name} is currently unavailable."
            elif current_value < 4.0:
                return f"{state_name} is currently experiencing a strong labor market with unemployment below 4%, which is lower than the national average. The state's economy appears to be performing well in terms of job creation and employment opportunities."
            elif current_value < 6.0:
                return f"{state_name} has a moderate unemployment rate around {current_value:.1f}%, which is in line with typical economic conditions. The labor market is relatively stable but may have some sectors that are underperforming."
            else:
                return f"{state_name} is facing some challenges in its labor market with an unemployment rate of {current_value:.1f}%. This is higher than the national average, suggesting potential economic difficulties or industry-specific downturns affecting the state."
                
        elif indicator == 'MSPUS':
            if current_value is None:
                return f"Housing market data for {state_name} is currently unavailable."
            elif current_value > 500000:
                return f"{state_name} has a high-cost housing market with median home prices above $500,000. This suggests strong demand and potentially challenging affordability conditions for many residents."
            elif current_value > 300000:
                return f"{state_name}'s housing market shows moderate prices with median home values around ${current_value:,.0f}. This suggests a balanced market with reasonable affordability for many residents."
            else:
                return f"{state_name} has relatively affordable housing with median home prices around ${current_value:,.0f}. This could be attractive for new residents and first-time homebuyers, but may also reflect lower economic growth or population decline in some areas."
                
        elif indicator == 'PCPI':
            if current_value is None:
                return f"Income data for {state_name} is currently unavailable."
            elif current_value > 70000:
                return f"{state_name} has a high per capita personal income of ${current_value:,.0f}, which is above the national average. This suggests a strong economy with high-wage jobs and opportunities for skilled workers."
            elif current_value > 50000:
                return f"{state_name} has a moderate per capita personal income of ${current_value:,.0f}, which is in line with the national average. The state's economy provides reasonable income levels for residents."
            else:
                return f"{state_name}'s per capita personal income of ${current_value:,.0f} is below the national average. This may reflect challenges in the local economy, including lower-wage industries or economic transitions."
        
        return f"Economic overview for {state_name} is not available for the selected indicator."
    
    async def get_available_indicators(self):
        """Get list of available regional indicators."""
        indicators = []
        
        for indicator_id, info in self.regional_indicators.items():
            indicators.append({
                "id": indicator_id,
                "name": info["name"],
                "category": "Regional" 
            })
            
        return {
            "indicators": indicators
        }