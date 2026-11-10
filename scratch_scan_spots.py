import re

with open('frontend/src/App.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

output = []
for idx, line in enumerate(lines, 1):
    stripped = line.strip()
    
    # check for strings like 'Not Provided', 'Karnataka', 'Rice', etc.
    if any(k in stripped for k in [
        "'Not Provided'", "'Karnataka'", "'Farmer'", "'Kasaba'", "'Taluk'", "'District'",
        "'Laterite'", "'Laterite Soil'", "'24.5 Quintals'", "Margin: ~", "ID: ",
        "Source: data.gov.in", "Botanical Genus:", "RTC Record", "Open-Meteo",
        "Please enter your survey", "No varieties match", "Click to view",
        "INR", "Quintals", "kg", "acres", "guntas", "per acre",
        "Standard Regional Variety"
    ]):
        output.append(f"L{idx}: {stripped}")

with open('scratch_spots_out.txt', 'w', encoding='utf-8') as f:
    f.write("\n".join(output))

print(f"Done, wrote {len(output)} lines to scratch_spots_out.txt")
