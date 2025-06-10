from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# ChromeDriver 설정
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

# KBO 일정 페이지 접속
driver.get("https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx")
driver.implicitly_wait(5)

# 페이지 소스 가져오기
soup = BeautifulSoup(driver.page_source, 'html.parser')

# 테이블 찾기
table = soup.find('table', {'id': 'tblScheduleList'})

if table is not None:
    rows = table.find_all('tr')

    current_date = ""  # 날짜를 추적할 변수

    for row in rows:
        columns = row.find_all('td')
        
        # 최소 7개의 <td>가 있어야 정상적인 경기 데이터로 간주
        if len(columns) >= 7:
            # 날짜 정보가 있는지 확인하고, 있다면 업데이트
            date_column = row.find('td', {'class': 'day'})
            if date_column:
                current_date = date_column.get_text(strip=True)  # 날짜 업데이트

            time = columns[0].get_text(strip=True)  # 경기 시간
            play = columns[1]  # 경기팀 정보
            stadium = columns[6].get_text(strip=True)  # 경기장

            # 경기팀 정보 추출
            teams = play.get_text(strip=True).replace("vs", " ").split()
            if len(teams) < 2:
                continue  # 팀 정보 부족하면 해당 행 건너뛰기

            # 점수 추출 (점수가 없는 경우 대비)
            score = play.find('em')
            if score:
                scores = score.get_text(strip=True).split('vs')
                home_score = scores[0].strip() if len(scores) > 0 else "N/A"
                away_score = scores[1].strip() if len(scores) > 1 else "N/A"
            else:
                home_score = "N/A"
                away_score = "N/A"

            # 날짜와 경기 정보를 출력
            print(f"Date: {current_date}, Time: {time}, Teams: {teams[0]} vs {teams[1]}, Scores: {home_score} - {away_score}, Stadium: {stadium}")

else:
    print("테이블을 찾을 수 없습니다.")

driver.quit()
