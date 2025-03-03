import httpx
from bs4 import BeautifulSoup
import pandas as pd
import json
from datetime import datetime

class ScraperService:
    """Service for scraping economic data from various government websites."""
    
    async def scrape_treasury_yields(self):
        """
        Scrape current Treasury yield curve data from the U.S. Treasury website.
        Returns daily Treasury yield curve rates.
        """
        try:
            url = "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/all/all?type=daily_treasury_yield_curve&field_tdr_date_value=all&page&_format=csv"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
            
                df = pd.read_csv(pd.StringIO(response.text))
                
                latest_date = df['Date'].max()
                latest_data = df[df['Date'] == latest_date]
                
                yield_data = {}
                for column in latest_data.columns:
                    if column != 'Date':
                        yield_data[column] = float(latest_data[column].iloc[0]) if not pd.isna(latest_data[column].iloc[0]) else None
                
                return {
                    "date": latest_date,
                    "yields": yield_data
                }
                
        except Exception as e:
            print(f"Error scraping Treasury yields: {str(e)}")
            return {"error": str(e)}
    
    async def scrape_fomc_statements(self):
        """
        Scrape recent FOMC statements from the Federal Reserve website.
        Returns links to the most recent FOMC statements.
        """
        try:
            url = "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                statements = []
                
                # looking for links containing "statement"
                statement_links = soup.find_all('a', href=lambda href: href and 'statement' in href.lower())
                
                for link in statement_links[:5]:  # Get the 5 most recent statements
                    statement_url = link['href']
                    if not statement_url.startswith('http'):
                        if statement_url.startswith('/'):
                            statement_url = f"https://www.federalreserve.gov{statement_url}"
                        else:
                            statement_url = f"https://www.federalreserve.gov/{statement_url}"
                    
                    date_text = None
                    parent = link.parent
                    for _ in range(3):
                        if parent and parent.text:
                            text = parent.text.strip()
                            if text and len(text) > 5:
                                date_text = text[:50]  # limit the length
                                break
                        if parent:
                            parent = parent.parent
                    
                    statements.append({
                        "title": link.text.strip() or "FOMC Statement",
                        "url": statement_url,
                        "date_context": date_text
                    })
                
                return {"statements": statements}
                
        except Exception as e:
            print(f"Error scraping FOMC statements: {str(e)}")
            return {"error": str(e)}