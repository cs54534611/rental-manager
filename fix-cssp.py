import re
import os

CSS_PADDING = "  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n  box-sizing: border-box;\n"
TARGET_SELECTORS = ['.container', '.list', '.page']

def process_css(content):
    result = []
    i = 0
    changed = False
    
    while i < len(content):
        # Skip comments
        if content[i:i+2] == '/*':
            end = content.find('*/', i+2)
            if end >= 0:
                result.append(content[i:end+2])
                i = end + 2
                continue
        
        # Find selector + opening brace
        m = re.match(r'([^{}]+){', content[i:])
        if not m:
            result.append(content[i])
            i += 1
            continue
        
        selector = m.group(1).strip()
        selector_end = i + m.end()
        result.append(content[i:selector_end])
        i = selector_end
        
        # Find matching closing brace
        depth = 1
        block_start = i
        while i < len(content) and depth > 0:
            c = content[i]
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
            i += 1
            if depth == 0:
                break
        
        block = content[block_start:i-1]  # exclude closing }
        
        # Check if this selector needs padding
        needs_padding = any(selector.startswith(t) for t in TARGET_SELECTORS)
        has_padding = 'padding-bottom' in block
        
        if needs_padding and not has_padding:
            result.append('\n' + CSS_PADDING + block + '\n}')
            changed = True
        else:
            result.append('\n' + block + '\n}')
    
    return ''.join(result), changed

pages_dir = r"C:\Users\Administrator\.openclaw\workspace\rental-manager\miniprogram\pages"

for root, dirs, files in os.walk(pages_dir):
    for f in files:
        if not f.endswith('.wxss'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8') as fp:
            content = fp.read()
        
        if 'safe-area-inset-bottom' in content:
            print(f"OK: {f}")
            continue
        
        new_content, changed = process_css(content)
        
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write(new_content)
        
        if changed:
            print(f"Fixed: {f}")
        else:
            print(f"Skip: {f}")
