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
            continue
        
        # Find the first CSS rule block and add padding inside it
        # Pattern: selector {\n  property: value;\n  ... }
        # We want to add padding after the opening brace of the first rule
        
        # Match first selector { ... }
        match = re.search(r'(\w[\w\-\.]*)\s*\{([^}]+)\}', content, re.DOTALL)
        if match:
            selector = match.group(1)
            block_content = match.group(2)
            
            # Check if this block already has padding-bottom
            if 'padding-bottom' not in block_content:
                # Insert padding as second line of the block
                lines = content.split('\n')
                new_lines = []
                inserted = False
                for i, line in enumerate(lines):
                    new_lines.append(line)
                    # After the opening { line of first block
                    if not inserted and line.strip() == '{':
                        new_lines.append(padding_line)
                        inserted = True
                        print(f"Added to {f} in .{selector}")
                
                with open(path, 'w', encoding='utf-8') as fp:
                    fp.write('\n'.join(new_lines))
            else:
                print(f"Has padding: {f}")
        else:
            print(f"No block found: {f}")
