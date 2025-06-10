import os
import re
import sys
import json
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

# 크롬 드라이버 설정
chrome_options = Options()
chrome_options.add_argument("--headless=new")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--disable-software-rasterizer")
chrome_options.add_argument("--disable-features=VizDisplayCompositor")
chrome_options.add_argument("--disable-3d-apis")
chrome_options.add_argument("--log-level=3")
chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])

def get_team_rankings():
    driver = webdriver.Chrome(options=chrome_options)
    team_rankings_list = []
    try:
        driver.get("https://www.koreabaseball.com/Record/TeamRank/TeamRank.aspx")
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "tData")))
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        table = soup.find('table', {'class': 'tData'})

        if table:
            rows = table.find_all('tr')[1:] # Skip header row
            for row in rows:
                columns = row.find_all('td')
                if len(columns) >= 10:
                    team_rankings_list.append({
                        "rank": columns[0].get_text(strip=True),
                        "team": columns[1].get_text(strip=True),
                        "games": columns[2].get_text(strip=True),
                        "win": columns[3].get_text(strip=True),
                        "draw": columns[4].get_text(strip=True),
                        "lose": columns[5].get_text(strip=True),
                        "rate": columns[6].get_text(strip=True),
                        "games_behind": columns[7].get_text(strip=True),
                        "streak": columns[8].get_text(strip=True),
                        "last_10": columns[9].get_text(strip=True)
                    })
    finally:
        driver.quit()
    return team_rankings_list

if __name__ == "__main__":
    try:
        data = get_team_rankings()
        output = json.dumps(data, ensure_ascii=False)
        sys.stdout.buffer.write(output.encode("utf-8"))

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1) 