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
            print(f"OK: {f}")
            continue
        
        lines = content.split('\n')
        new_lines = []
        first_block_done = False
        
        for line in lines:
            new_lines.append(line)
            stripped = line.strip()
            
            # Insert padding after first opening brace
            if not first_block_done and stripped == '{':
                new_lines.append(padding_line)
                first_block_done = True
        
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write('\n'.join(new_lines))
        
        print(f"Fixed: {f}")
