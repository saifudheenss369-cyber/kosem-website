$extensions = @("*.js", "*.mjs", "*.css", "*.md", "*.json")
$files = Get-ChildItem -Path . -Recurse -Include $extensions | Where-Object { -not $_.PSIsContainer }

$replacements = @(
    @{ Regex = "AL JUMAN FRAGRANCES"; Replace = "KOSEM PERFUMES" }
    @{ Regex = "Al Juman Fragrances"; Replace = "Kosem Perfumes" }
    @{ Regex = "AL JUMAN FRAGRANCE"; Replace = "KOSEM PERFUME" }
    @{ Regex = "Al Juman Fragrance"; Replace = "Kosem Perfume" }
    
    @{ Regex = "ALJUMAN FRAGRANCES"; Replace = "KOSEM PERFUMES" }
    @{ Regex = "Aljuman Fragrances"; Replace = "Kosem Perfumes" }
    @{ Regex = "ALJUMAN FRAGRANCE"; Replace = "KOSEM PERFUME" }
    @{ Regex = "Aljuman Fragrance"; Replace = "Kosem Perfume" }
    
    @{ Regex = "AL JUMAN"; Replace = "KOSEM" }
    @{ Regex = "Al Juman"; Replace = "Kosem" }
    
    @{ Regex = "ALJUMAN"; Replace = "KOSEM" }
    @{ Regex = "Aljuman"; Replace = "Kosem" }
    
    @{ Regex = "aljumanfragrance\.com"; Replace = "kosemperfume.com" }
    @{ Regex = "aljuman\.com"; Replace = "kosemperfume.com" }
    @{ Regex = "aljuman\.vercel\.app"; Replace = "kosem.vercel.app" }
    @{ Regex = "aljuman\.in"; Replace = "kosemperfume.in" }
    @{ Regex = "aljumanfragrance"; Replace = "kosemperfume" }
)

$utf8NoBom = New-Object System.Text.UTF8Encoding $False

foreach ($file in $files) {
    if ($file.FullName -match "\\node_modules\\" -or $file.FullName -match "\\\.git\\" -or $file.FullName -match "\\\.next\\") {
        continue
    }

    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $original = $content
        
        $content = $content -replace "aljuman-a1a29", "__FIREBASE_ID__"
        $content = $content -replace "aljuman-admin", "__FIREBASE_ADMIN__"
        
        foreach ($r in $replacements) {
            $content = $content -creplace $r.Regex, $r.Replace
        }
        
        $content = $content -replace "__FIREBASE_ID__", "aljuman-a1a29"
        $content = $content -replace "__FIREBASE_ADMIN__", "aljuman-admin"

        if ($content -cne $original) {
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            Write-Host "Updated: $($file.FullName)"
        }
    } catch {
        Write-Warning "Could not process $($file.FullName): $($_.Exception.Message)"
    }
}
