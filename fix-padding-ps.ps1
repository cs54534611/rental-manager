$oldPadding = "padding: 20rpx;"
$newPadding = "padding: 20rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;"

$oldPage = "page { background: #f5f7fa; }"
$newPage = "page { background: #f5f7fa; }"

$dir = "C:\Users\Administrator\.openclaw\workspace\rental-manager\miniprogram\pages"

Get-ChildItem $dir -Recurse -Filter "*.wxss" | ForEach-Object {
    $path = $_.FullName
    $content = Get-Content $path -Raw
    
    if ($content -match "safe-area-inset-bottom") {
        Write-Host "OK: $($_.Name)"
        return
    }
    
    $newContent = $content
    
    # Fix page block if it's single-line
    if ($newContent -match "page \{ background: #f5f7fa; \}") {
        $newContent = $newContent -replace "page \{ background: #f5f7fa; \}", "page { background: #f5f7fa; }"
    }
    
    # Fix .container { padding: 20rpx; }
    if ($newContent -match "\.container \{ padding: 20rpx; \}") {
        $newContent = $newContent -replace "\.container \{ padding: 20rpx; \}", ".container {
  padding: 20rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}"
        Write-Host "Fixed .container: $($_.Name)"
    }
    
    # Fix .container { padding: 30rpx; }
    if ($newContent -match "\.container \{ padding: 30rpx; \}") {
        $newContent = $newContent -replace "\.container \{ padding: 30rpx; \}", ".container {
  padding: 30rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}"
        Write-Host "Fixed .container 30: $($_.Name)"
    }
    
    # Fix .list { padding: 20rpx; }
    if ($newContent -match "\.list \{ padding: 20rpx; \}") {
        $newContent = $newContent -replace "\.list \{ padding: 20rpx; \}", ".list {
  padding: 20rpx;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}"
        Write-Host "Fixed .list: $($_.Name)"
    }
    
    # Fix single-line page block with padding inside
    if ($newContent -match "page \{[^}]*\}") {
        $newContent = $newContent -replace "page \{(.*?)\}", {
            param($m)
            $inner = $m.Groups[1].Value
            if ($inner -notmatch "padding-bottom") {
                "page {
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;$inner
}"
            } else {
                $m.Value
            }
        }
        Write-Host "Fixed page block: $($_.Name)"
    }
    
    if ($newContent -ne $content) {
        Set-Content -Path $path -Value $newContent -NoNewline
    }
}
