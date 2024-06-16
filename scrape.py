import requests
import time
import logging
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

logging.basicConfig(level=logging.INFO, filename='upload_log.log', filemode='a', format='%(asctime)s - %(levelname)s - %(message)s')

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.binary_location = '/home/jwodon/Springboard/jobSearch/Trieve/chrome-linux64/chrome'

driver_path = '/home/jwodon/Springboard/jobSearch/Trieve/chromedriver-linux64/chromedriver'
webdriver_service = Service(driver_path)

driver = webdriver.Chrome(service=webdriver_service, options=chrome_options)

url = 'https://www.buildlist.xyz/'
driver.get(url)
logging.info("Page fetched successfully")
print("Page fetched successfully")

def click_see_more():
    while True:
        try:
            see_more_button = driver.find_element(By.XPATH, "//button[contains(text(),'See more')]")
            driver.execute_script("arguments[0].click();", see_more_button)
            time.sleep(2)
        except Exception as e:
            logging.info("No more 'See More' button found or other error: %s", e)
            print("No more 'See More' button found or other error:", e)
            break

click_see_more()

scraped_data = []
list_container = driver.find_element(By.CSS_SELECTOR, "div.list-container")
list_items = list_container.find_elements(By.CSS_SELECTOR, "div.list-item-wrapper")

for item in list_items:
    try:
        title = item.find_element(By.CSS_SELECTOR, "h3").text
        description = item.find_element(By.CSS_SELECTOR, "p").text
        tag_elements = item.find_elements(By.CSS_SELECTOR, "div.MuiChip-root span.MuiChip-label")
        tags = [tag.text for tag in tag_elements]
        
        logo_element = item.find_element(By.CSS_SELECTOR, "div.static-image")
        logo_style = logo_element.get_attribute("style")
        logo_url = logo_style.split('url("')[1].split('");')[0]
        
        scraped_data.append({'title': title, 'description': description, 'tags': tags, 'logo': logo_url})
    except Exception as e:
        logging.error("Error scraping item: %s", e)
        print("Error scraping item:", e)

driver.quit()

logging.info("Scraped data: %s", scraped_data)
print("Scraped data:", scraped_data)

with open('scraped_data.json', 'w') as json_file:
    json.dump(scraped_data, json_file, indent=4)

def upload_chunks_to_trieve(chunks, dataset_id, api_key):
    url = "https://api.trieve.ai/api/chunk"
    headers = {
        "TR-Dataset": dataset_id,
        "Authorization": api_key,
        "Content-Type": "application/json"
    }
    
    chunk_data = []
    for chunk in chunks:
        chunk_html = f"Title: {chunk['title']}\nDescription: {chunk['description']}\nTags: {', '.join(chunk['tags'])}"
        chunk_data.append({
            "chunk_html": chunk_html,
            "tracking_id": chunk['title'],
            "tag_set": chunk['tags'],
            "metadata": {"source": "BuildList", "logo": chunk['logo']},
            "upsert_by_tracking_id": True
        })
    
    batch_size = 20
    for i in range(0, len(chunk_data), batch_size):
        batch = chunk_data[i:i + batch_size]
        for attempt in range(5):
            try:
                response = requests.post(url, headers=headers, json=batch)
                if response.status_code == 200:
                    logging.info(f"Successfully uploaded batch {i // batch_size + 1}")
                    print(f"Successfully uploaded batch {i // batch_size + 1}")
                    break
                else:
                    logging.error(f"Failed to upload batch {i // batch_size + 1}: {response.text}")
                    print(f"Failed to upload batch {i // batch_size + 1}: {response.text}")
            except requests.exceptions.RequestException as e:
                logging.error(f"Attempt {attempt + 1} failed: {e}")
                print(f"Attempt {attempt + 1} failed:", e)
                time.sleep(5)
        else:
            logging.error(f"Failed to upload batch {i // batch_size + 1} after 5 attempts")
            print(f"Failed to upload batch {i // batch_size + 1} after 5 attempts")

dataset_id = "58e9cb2c-786f-452b-ba07-290e3bd7356a"
api_key = "tr-PxHAevwDu8cQbpz4kIgaVVcmuuekOHWY"

upload_chunks_to_trieve(scraped_data, dataset_id, api_key)
