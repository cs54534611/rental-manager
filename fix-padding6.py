import os
import re

pages_dir = r"C:\Users\Administrator\.openclaw\workspace\rental-manager\miniprogram\pages"
padding_line = "  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n"

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
        
        # Fix single-line blocks like "page { background: #f5f7fa; }"
        def fix_single_line(match):
            selector = match.group(1)
            props = match.group(2)
            if 'padding-bottom' in props:
                return match.group(0)
            return f"{selector} {{\n{padding_line}{props}\n}}"
        
        new_content = re.sub(r'(\w[\w\-\.]*)\s*\{([^}]+)\}', fix_single_line, content)
        
        # Fix multi-line blocks - add padding after first opening brace
        if new_content == content:
            lines = content.split('\n')
            new_lines = []
            first_block_done = False
            for line in lines:
                new_lines.append(line)
                stripped = line.strip()
                if not first_block_done and stripped == '{':
                    new_lines.append(padding_line)
                    first_block_done = True
            new_content = '\n'.join(new_lines)
        
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write(new_content)
        
        print(f"Fixed: {f}")
