$pagesDir = "C:\Users\Administrator\.openclaw\workspace\rental-manager\miniprogram\pages"
$padding = "padding-bottom: calc(120rpx + env(safe-area-inset-bottom));`n}"

Get-ChildItem $pagesDir -Recurse -Filter "*.wxss" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -and $content -notmatch "safe-area-inset-bottom") {
        if ($content -match "(container|page|list)\s*\{") {
            $newContent = $content -replace "(container|page|list)\s*\{", "`$1 {`n$padding"
            Set-Content -Path $_.FullName -Value $newContent -NoNewline
            Write-Host ("Updated: " + $_.Name)
        } else {
            Write-Host ("No match: " + $_.Name)
        }
    } else {
        Write-Host ("Already has: " + $_.Name)
    }
}
