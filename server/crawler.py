import os
import re
import sys
import json
import datetime
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

# 팀 로고 URL
TEAM_LOGOS = {
    '두산': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/doosan.png',
    'LG': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/lg.png',
    'SSG': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/ssg.png',
    'NC': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/nc.png',
    '키움': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/kiwoom.png',
    'KIA': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/kia.png',
    '롯데': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/lotte.png',
    '삼성': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/samsung.png',
    '한화': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/hanwha.png',
    'KT': 'https://lgcxydabfbch3774324.cdn.ntruss.com/KBO_IMAGE/emblem/regular/kt.png'
}

# 팀 이름 숫자 제거
def clean_team_name(name):
    return re.sub(r'\d+', '', name).strip()

# 오늘 날짜
today = datetime.datetime.today()
weekday_map = ['월', '화', '수', '목', '금', '토', '일']
today_weekday = weekday_map[today.weekday()]
target_date = today.strftime("%Y%m%d")
display_date = today.strftime("%m.%d") + f"({today_weekday})"

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

try:
    driver = webdriver.Chrome(options=chrome_options)
    games_list = []

    driver.get("https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, "game-cont")))
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    game_items = soup.find_all('li', class_='game-cont')

    for game in game_items:
        game_date = game.get('g_dt')
        if game_date != target_date: continue  # 오늘 경기만

        # 상태 텍스트 추출
        status_tag = game.find("p", class_="status")
        status = status_tag.get_text(strip=True) if status_tag else "-"

        # 구장, 시간
        info_items = game.find_all('li')
        stadium = info_items[0].get_text(strip=True) if len(info_items) > 0 else ""
        time = info_items[2].get_text(strip=True) if len(info_items) > 2 else "-"

        # 팀 및 점수 정보
        away_elem = game.find('div', class_='team away')
        home_elem = game.find('div', class_='team home')

        if not away_elem or not home_elem: continue

        # 팀 이름 추출
        away_team = away_elem.find('div', class_='emb').find('img')['alt'] if away_elem.find('div', class_='emb') else ""
        home_team = home_elem.find('div', class_='emb').find('img')['alt'] if home_elem.find('div', class_='emb') else ""
        
        # 점수 추출
        away_score = away_elem.find('div', class_='score')
        home_score = home_elem.find('div', class_='score')
        away_score_text = away_score.get_text(strip=True) if away_score else "N/A"
        home_score_text = home_score.get_text(strip=True) if home_score else "N/A"
        
        # 투수 정보 추출
        away_pitcher = away_elem.find('div', class_='today-pitcher')
        home_pitcher = home_elem.find('div', class_='today-pitcher')
        away_pitcher_text = away_pitcher.get_text(strip=True) if away_pitcher else ""
        home_pitcher_text = home_pitcher.get_text(strip=True) if home_pitcher else ""

        # 팀 이름 정리
        away_team = clean_team_name(away_team)
        home_team = clean_team_name(home_team)

        games_list.append({
            "date": display_date,
            "time": time,
            "stadium": stadium,
            "status": status,
            "away_team": away_team,
            "home_team": home_team,
            "away_score": away_score_text,
            "home_score": home_score_text,
            "away_pitcher": away_pitcher_text,
            "home_pitcher": home_pitcher_text,
            "away_logo": TEAM_LOGOS.get(away_team, ""),
            "home_logo": TEAM_LOGOS.get(home_team, "")
        })

    driver.quit()

    # JSON 출력
    output = json.dumps(games_list, ensure_ascii=False)
    sys.stdout.buffer.write(output.encode("utf-8"))

except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
