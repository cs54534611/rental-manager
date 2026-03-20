import os
import re

pages_dir = r"C:\Users\Administrator\.openclaw\workspace\rental-manager\miniprogram\pages"
padding_line = "  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n"
target_classes = {'.container', '.page', '.list'}

for root, dirs, files in os.walk(pages_dir):
    for f in files:
        if not f.endswith('.wxss'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8') as fp:
            lines = fp.readlines()
        
        new_lines = []
        i = 0
        modified = False
        while i < len(lines):
            line = lines[i]
            new_lines.append(line)
            
            # Check if this line opens a target block
            stripped = line.strip()
            if stripped.endswith('{'):
                selector = stripped[:-1].strip()
                if selector in target_classes:
                    # Insert padding after this line
                    new_lines.append(padding_line)
                    modified = True
            
            i += 1
        
        if modified:
            with open(path, 'w', encoding='utf-8') as fp:
                fp.writelines(new_lines)
            print(f"Fixed: {f}")
        else:
            print(f"OK: {f}")
