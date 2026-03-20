import os
import re

pages_dir = r"C:\Users\Administrator\.openclaw\workspace\rental-manager\miniprogram\pages"
padding = "  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));\n  box-sizing: border-box;\n"

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

        new_content = content

        # Pattern 1: .container { padding: 20rpx; }
        new_content = re.sub(
            r'(\.container\s*\{\s*)padding:\s*20rpx;\s*(\})',
            r'\1padding: 20rpx;\n' + padding + r'\2',
            new_content
        )

        # Pattern 2: .container { padding: 30rpx; }
        new_content = re.sub(
            r'(\.container\s*\{\s*)padding:\s*30rpx;\s*(\})',
            r'\1padding: 30rpx;\n' + padding + r'\2',
            new_content
        )

        # Pattern 3: .list { padding: 20rpx; }
        new_content = re.sub(
            r'(\.list\s*\{\s*)padding:\s*20rpx;\s*(\})',
            r'\1padding: 20rpx;\n' + padding + r'\2',
            new_content
        )

        # Pattern 4: page { background: #f5f7fa; }
        new_content = re.sub(
            r'(page\s*\{\s*)background:\s*#[0-9a-f]+;\s*(\})',
            r'\1background: #f5f7fa;\n' + padding + r'\2',
            new_content
        )

        if new_content != content:
            with open(path, 'w', encoding='utf-8') as fp:
                fp.write(new_content)
            print(f"Fixed: {f}")
        else:
            print(f"Skip: {f}")
