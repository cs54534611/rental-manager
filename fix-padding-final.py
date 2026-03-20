import os
import re

pages_dir = r"C:\Users\Administrator\.openclaw\workspace\rental-manager\miniprogram\pages"
padding = "  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n  box-sizing: border-box;\n"
targets = ['.container', '.list', '.page']

for root, dirs, files in os.walk(pages_dir):
    for f in files:
        if not f.endswith('.wxss'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8') as fp:
            content = fp.read()
        
        if 'safe-area-inset-bottom' in content:
            continue
        
        # For single-line blocks like "selector { props }"
        # Expand them to multi-line AND add padding
        def expand_block(m):
            selector = m.group(1)
            props = m.group(2).strip()
            if selector in targets:
                # Keep existing properties, add our padding
                return f"{selector} {{\n{padding}{props}\n}}"
            else:
                return f"{selector} {{\n  {props}\n}}"
        
        new_content = re.sub(r'(\w[\w\-\.]*)\s*\{\s*([^}]+?)\s*\}', expand_block, content)
        
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write(new_content)
        print(f"Fixed: {f}")
