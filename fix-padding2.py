import os

pages_dir = r"C:\Users\Administrator\.openclaw\workspace\rental-manager\miniprogram\pages"
padding = "  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n"
target = ".container"

for root, dirs, files in os.walk(pages_dir):
    for f in files:
        if not f.endswith('.wxss'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8') as fp:
            content = fp.read()
        
        # Check for duplicates
        if content.count("safe-area-inset-bottom") > 1:
            # Fix duplicates and broken formatting
            lines = []
            for line in content.splitlines():
                stripped = line.strip()
                # Skip duplicate padding lines
                if "safe-area-inset-bottom" in line and "padding-bottom" in line:
                    if lines and "safe-area-inset-bottom" in lines[-1]:
                        continue
                lines.append(line)
            
            # Check if container block is broken (padding inside brace)
            new_content = '\n'.join(lines)
            
            # Fix broken .container { ... padding... }
            # Pattern: .container {\npadding...}\n} padding: X
            new_content = new_content.replace(
                ".container {\n  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\npadding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n} padding: 30rpx; padding-bottom: 120rpx; }",
                ".container {\n  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n  padding: 30rpx;\n  padding-bottom: 120rpx;\n}"
            )
            
            with open(path, 'w', encoding='utf-8') as fp:
                fp.write(new_content)
            print(f"Fixed duplicates: {f}")
        elif "safe-area-inset-bottom" not in content:
            # Need to add padding
            if '.container {' in content or '.page {' in content or '.list {' in content:
                lines = content.split('\n')
                new_lines = []
                for line in lines:
                    new_lines.append(line)
                    stripped = line.strip()
                    if stripped.endswith('{'):
                        selector = stripped[:-1].strip()
                        if selector in ['.container', '.page', '.list']:
                            new_lines.append(padding)
                with open(path, 'w', encoding='utf-8') as fp:
                    fp.write('\n'.join(new_lines))
                print(f"Added padding: {f}")
            else:
                print(f"No container: {f}")
        else:
            print(f"OK: {f}")
