import re

def add_padding_to_css(content):
    padding = "padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n  box-sizing: border-box;"
    padding_block = "\n  " + padding + "\n"
    
    # Split into rules (handling nested braces for complex rules)
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
        
        # Find selector
        m = re.match(r'([^{}]+){', content[i:])
        if m:
            selector = m.group(1).strip()
            result.append(content[i:i+m.end()])
            i += m.end()
            
            # Parse the block content (handling nested braces)
            depth = 1
            block_start = i
            while i < len(content) and depth > 0:
                if content[i] == '{':
                    depth += 1
                elif content[i] == '}':
                    depth -= 1
                    if depth == 0:
                        break
                i += 1
            
            block_content = content[block_start:i]
            block_end = content[i] if i < len(content) else ''
            
            # Check if this is a target selector
            targets = ['.container', '.list', '.page']
            is_target = any(selector.startswith(t) for t in targets)
            
            # Check if padding-bottom already exists
            has_padding_bottom = 'padding-bottom' in block_content
            
            if is_target and not has_padding_bottom:
                # Insert padding after opening brace
                new_block = '{' + padding_block + block_content[1:]
                result.append(new_block)
                changed = True
            else:
                result.append(block_content)
                result.append(block_end)
            i += 1
        else:
            result.append(content[i])
            i += 1
    
    return ''.join(result), changed

import os

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
        
        new_content, changed = add_padding_to_css(content)
        
        if changed:
            with open(path, 'w', encoding='utf-8') as fp:
                fp.write(new_content)
            print(f"Fixed: {f}")
        else:
            print(f"Skip: {f}")
