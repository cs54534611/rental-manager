import os

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
            print(f"Skip (already has): {f}")
            continue
        
        lines = content.split('\n')
        new_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            new_lines.append(line)
            stripped = line.strip()
            
            # Only target these selectors - NOT 'page'
            if stripped in ('.container {', '.list {', '.page {'):
                new_lines.append(padding_line)
                print(f"Added: {f} -> {stripped}")
            
            i += 1
        
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write('\n'.join(new_lines))
