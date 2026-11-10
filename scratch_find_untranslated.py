import re

with open('frontend/src/App.tsx', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

output_lines = []
for idx, line in enumerate(lines, 1):
    # Search for hardcoded English text in JSX (> Text <)
    # or hardcoded strings without t(...)
    matches = re.findall(r'>\s*([A-Za-z][A-Za-z0-9 \(\)\/,\.\-:–—\?\'\"&]{2,})\s*<', line)
    for m in matches:
        m_clean = m.strip()
        # Filter out common code keywords or css classes
        if not m_clean.startswith('var(') and not m_clean in ['div', 'span', 'strong', 'button']:
            output_lines.append(f"L{idx}: >{m_clean}<")
            
    # Also search for placeholder="..." or title="..."
    attrs = re.findall(r'(placeholder|title|aria-label)=["\']([^"\']*[A-Za-z]{3,}[^"\']*)["\']', line)
    for attr, val in attrs:
        output_lines.append(f"L{idx}: attr {attr}=\"{val}\"")

with open('scratch_untranslated.txt', 'w', encoding='utf-8') as out:
    out.write("\n".join(output_lines))

print(f"Total found: {len(output_lines)}")
