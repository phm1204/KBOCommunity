from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import traceback
import sys

def get_team_rankings():
    print("프로그램 시작...")
    try:
        print("크롬 드라이버 설정 중...")
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service)
        print("크롬 드라이버 설정 완료")

        print("KBO 팀 순위 페이지 접속 중...")
        driver.get("https://www.koreabaseball.com/Record/TeamRank/TeamRank.aspx")
        driver.implicitly_wait(5)
        print("페이지 접속 완료")

        print("페이지 소스 가져오는 중...")
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        print("페이지 소스 가져오기 완료")

        print("순위 테이블 찾는 중...")
        table = soup.find('table', {'class': 'tData'})

        if table is not None:
            print("테이블을 찾았습니다. 데이터 추출 시작...")
            rows = table.find_all('tr')[1:]  # 헤더 제외하고 데이터 행만 가져오기

            print("\n=== KBO 팀 순위 ===")
            print("순위 | 팀명 | 경기수 | 승 | 무 | 패 | 승률 | 게임차 | 연속 | 최근10경기")
            print("-" * 80)

            for row in rows:
                columns = row.find_all('td')
                if len(columns) >= 10:  # 필요한 모든 컬럼이 있는지 확인
                    rank = columns[0].get_text(strip=True)
                    team = columns[1].get_text(strip=True)
                    games = columns[2].get_text(strip=True)
                    wins = columns[3].get_text(strip=True)
                    draws = columns[4].get_text(strip=True)
                    losses = columns[5].get_text(strip=True)
                    win_rate = columns[6].get_text(strip=True)
                    games_behind = columns[7].get_text(strip=True)
                    streak = columns[8].get_text(strip=True)
                    last_10 = columns[9].get_text(strip=True)

                    print(f"{rank:2} | {team:6} | {games:4} | {wins:2} | {draws:2} | {losses:2} | {win_rate:5} | {games_behind:6} | {streak:4} | {last_10:10}")
        else:
            print("팀 순위 테이블을 찾을 수 없습니다.")

    except Exception as e:
        print(f"\n오류가 발생했습니다:")
        print(f"에러 메시지: {str(e)}")
        print("\n상세 에러 정보:")
        traceback.print_exc()
        sys.exit(1)

    finally:
        print("\n프로그램 종료 중...")
        driver.quit()
        print("프로그램이 종료되었습니다.")

if __name__ == "__main__":
    get_team_rankings()
