import requests

# 1. Login to get token
login_url = "http://localhost:8000/auth/login"
data = {"username": "MaheshBabu", "password": "password123"}
response = requests.post(login_url, data=data)
print("Login:", response.status_code, response.json())

token = response.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# 2. Call the report endpoint
url = "http://localhost:8000/profile/analytics/report"
resp = requests.get(url, headers=headers)
print("Report Profile:", resp.status_code, resp.text)

# Also test an account
url2 = "http://localhost:8000/ACC-668295/analytics/report"  # I need a valid account number
resp2 = requests.get(url2, headers=headers)
print("Report Account:", resp2.status_code, resp2.text)
