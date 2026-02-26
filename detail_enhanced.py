import requests
import ddddocr
import base64
import time
from typing import Optional, Dict, Any, Tuple

urltogetcaptcha="https://gateway-voters.eci.gov.in/api/v1/captcha-service/generateCaptcha"
urltogetdetails="https://gateway-voters.eci.gov.in/api/v1/elastic/search-by-epic-from-national-display"
proxies={
    "http": "http://bcnkcfeo:iuj01wt7i00z@216.10.27.159:6837/",
    "https": "http://bcnkcfeo:iuj01wt7i00z@216.10.27.159:6837/"
}

headers = {"Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"}

ocr = ddddocr.DdddOcr()

def solve_with_ddddocr(image_path: str) -> str:
    """Solve captcha using ddddOCR"""
    with open(image_path, 'rb') as f:
        image_bytes = f.read()
    
    res = ocr.classification(image_bytes)
    return res


def extract_voter_data(epNo: str, state_code: str = "S08", max_retries: int = 5) -> Tuple[str, Optional[Dict[str, Any]], int]:
    """
    Extract voter data from ECI portal
    
    Returns:
        Tuple of (status, data, attempts)
        status: 'success', 'failed', 'error'
        data: voter data dict if successful, None otherwise
        attempts: number of attempts made
    """
    
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.get(urltogetcaptcha, proxies=proxies, timeout=10)

            if response.status_code == 200:
                data = response.json()
                captcha_value = data["captcha"]
                captcha_id = data["id"]

                image_bytes = base64.b64decode(captcha_value)
                with open("captcha.jpg", "wb") as f:
                    f.write(image_bytes)
                    
                captcha_ans = solve_with_ddddocr("captcha.jpg")
                print(f"Attempt {attempt}: Captcha solved: {captcha_ans}")

                if len(captcha_ans) != 6:
                    print(f"Invalid captcha length: {len(captcha_ans)}")
                    continue

                payload = {
                    "captchaData": captcha_ans,
                    "captchaId": captcha_id,
                    "epicNumber": epNo,
                    "isPortal": "true",
                    "securityKey": "na",
                    "stateCd": state_code
                }
                
                response2 = requests.post(urltogetdetails, json=payload, headers=headers, proxies=proxies, timeout=15)
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    if data2 and isinstance(data2, list) and len(data2) > 0:
                        content = data2[0].get("content")
                        if content:
                            print(f"✓ Successfully extracted data for {epNo}")
                            return ("success", content, attempt)
                    else:
                        print(f"Empty response from API")
                        continue

                elif response2.status_code == 400:
                    print(f"Wrong captcha (400 error)")
                    continue
                else:
                    print(f"Unexpected status code: {response2.status_code}")
                    continue
            else:
                print(f"Failed to get captcha: {response.status_code}")
                continue
                
        except requests.exceptions.Timeout:
            print(f"Request timeout on attempt {attempt}")
            continue
        except requests.exceptions.RequestException as e:
            print(f"Network error on attempt {attempt}: {str(e)}")
            continue
        except Exception as e:
            print(f"Unexpected error on attempt {attempt}: {str(e)}")
            continue
        
        # Small delay between retries
        if attempt < max_retries:
            time.sleep(0.5)
    
    print(f"✗ Failed to extract data for {epNo} after {max_retries} attempts")
    return ("failed", None, max_retries)


def main(epNo: str, state_code: str = "S08") -> str:
    """
    Main function for backward compatibility with existing code
    Returns: 'sahi' or 'galat'
    """
    status, data, attempts = extract_voter_data(epNo, state_code)
    
    if status == "success":
        if data:
            print(data)
        return "sahi"
    else:
        return "galat"


if __name__ == "__main__":
    # Test with a sample EPIC number
    test_epic = "HP/04/020/174079"
    status, data, attempts = extract_voter_data(test_epic)
    
    if status == "success":
        print(f"\n✓ Successfully extracted in {attempts} attempts")
        print(f"Voter: {data.get('fullName')} ({data.get('age')} years, {data.get('gender')})")
    else:
        print(f"\n✗ Failed after {attempts} attempts")
