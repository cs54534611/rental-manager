import os

pages_dir = r"C:\Users\Administrator\.openclaw\workspace\rental-manager\miniprogram\pages"
padding = "  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n  box-sizing: border-box;\n"
targets = {'.container', '.list', '.page'}

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
        i = 0
        fixed = False
        
        while i < len(lines):
            line = lines[i]
            new_lines.append(line)
            stripped = line.strip()
            
            # Check if this line ends a selector block AND we haven't added padding yet
            if stripped == '}' and not fixed:
                # Look back to find the selector for this block
                for j in range(len(new_lines) - 1, -1, -1):
                    prev = new_lines[j].strip()
                    if prev.startswith('{'):
                        # Find the selector line before this {
                        for k in range(j - 1, -1, -1):
                            sel = new_lines[k].strip()
                            # Skip blank lines
                            if not sel:
                                continue
                            # Check if it's a target selector
                            for t in targets:
                                if sel.startswith(t) and '{' in sel:
                                    # Check if this block already has padding-bottom
                                    block_lines = new_lines[k:j+2]
                                    block_text = '\n'.join(block_lines)
                                    if 'padding-bottom' not in block_text:
                                        new_lines.insert(j + 1, padding)
                                        fixed = True
                                        print(f"Fixed: {f} -> {sel}")
                                    break
                            break
                    elif prev == '}':
                        break
                i += 1
                continue
            
            i += 1
        
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write('\n'.join(new_lines))
        
        if not fixed:
            print(f"Kept: {f}")
