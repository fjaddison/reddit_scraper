from flask import Flask
from flask import render_template
import requests
import time
from collections import Counter
import re
import praw
from bs4 import BeautifulSoup
import pandas_datareader.data as web
import os
from dotenv import load_dotenv
load_dotenv()

reddit = praw.Reddit(
    user_agent=os.getenv('USER_AGENT'),
    client_id=os.getenv('CLIENT_ID'),
    client_secret=os.getenv('CLIENT_SECRET')
)

sub_dict = {'titles': [], 'selftexts': [], 'comments': []}

for submission in reddit.subreddit('wallstreetbets').hot(limit=25):
    sub_dict['titles'].append(submission.title)
    sub_dict['selftexts'].append(submission.title)
    for comment in submission.comments:
      sub_dict['comments'].append(comment)

def get_symbols():
    stocks = []
    url = 'https://finance.yahoo.com/most-active?offset=0&count=100'
    url_two = 'https://finance.yahoo.com/most-active?offset=100&count=100'
    HTML = requests.get(url)
    HTML_two = requests.get(url_two)
    soup = BeautifulSoup(HTML.content, 'lxml')
    more_soup = BeautifulSoup(HTML_two.content, 'lxml')
    soup_list = soup.find_all('a', attrs={'class': 'Fw(600) C($linkColor)'})
    soup_list += more_soup.find_all('a', attrs={'class': 'Fw(600) C($linkColor)'})
    for stock in soup_list:
        stocks.append({'title': stock.attrs['title'], 'symbol': stock.text})
    return stocks

stock_list = get_symbols()

def count_occurences(text_list, match_list):
    count_list = []
    for text in text_list:
        if type(text) == praw.models.reddit.comment.Comment:
            for pattern in match_list:
                split_list = text.body.split()
                split_list = [re.sub('[^a-zA-Z]+', '', _) for _ in split_list]
                match = re.compile(f"\\b{pattern['symbol']}\\b")
                filtered_list = list(filter(match.match, split_list))
                if len(filtered_list) > 0:
                    count_list += filtered_list
    return count_list

symbol_count = count_occurences(sub_dict['comments'], stock_list)
sym_count = Counter(symbol_count)

print(list(sym_count))

labels = []
chart_symbols = []
for x in list(sym_count.items()):
  if x[0] == 'DD':
    pass
  else:
    chart_symbols.append(x[1])
    labels.append(x[0])

app = Flask(__name__)

@app.route('/')
def start():
    return render_template('layout.html', count=symbol_count)

app.run(debug=True, port=8000, host='0.0.0.0')
