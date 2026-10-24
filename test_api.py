import requests
import json

API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

r = requests.get(URL, params={
    'api-key': API_KEY,
    'format': 'json',
    'limit': '50',
    'filters[state]': 'Karnataka'
}, timeout=15)
data = r.json()

with open('api_test_output.txt', 'w') as f:
    f.write(f"Total records today: {data['total']}\n")
    f.write(f"Records returned: {data['count']}\n\n")
    
    districts = {}
    commodities = set()
    for rec in data['records']:
        d = rec['district']
        m = rec['market']
        if d not in districts:
            districts[d] = set()
        districts[d].add(m)
        commodities.add(rec['commodity'])
    
    f.write("Districts and their Markets:\n")
    for d in sorted(districts):
        f.write(f"  {d}:\n")
        for m in sorted(districts[d]):
            f.write(f"    - {m}\n")
    
    f.write(f"\nCommodities ({len(commodities)}):\n")
    for c in sorted(commodities):
        f.write(f"  {c}\n")
    
    f.write(f"\nAll records:\n")
    for rec in data['records']:
        f.write(f"  {rec['district']} | {rec['market']} | {rec['commodity']} | {rec['variety']} | Min:{rec['min_price']} Max:{rec['max_price']} Modal:{rec['modal_price']} | {rec['arrival_date']}\n")

print("Done - see api_test_output.txt")
