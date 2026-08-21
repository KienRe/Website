$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

New-Item -ItemType Directory -Force -Path "static\videos\posters" | Out-Null

function Encode-Clip {
  param(
    [string]$InFile,
    [string]$OutName,
    [int]$MaxWidth
  )
  $in = "videos-src\$InFile"
  if (-not (Test-Path $in)) { throw "missing source: $in" }

  $vf = "scale='min(${MaxWidth},iw)':-2:flags=lanczos,fps=30"
  $poster = "static\videos\posters\$OutName.webp"
  $mp4 = "static\videos\$OutName.mp4"

  Write-Host "Poster $OutName"
  & ffmpeg -y -ss 0.4 -i $in -an -frames:v 1 -vf "scale='min(${MaxWidth},iw)':-2:flags=lanczos" -c:v libwebp -quality 72 $poster
  if ($LASTEXITCODE -ne 0) { throw "poster failed: $OutName" }

  Write-Host "H.264 $OutName"
  & ffmpeg -y -i $in -an -vf $vf -c:v libx264 -crf 28 -preset medium -pix_fmt yuv420p -movflags +faststart $mp4
  if ($LASTEXITCODE -ne 0) { throw "h264 failed: $OutName" }
}

Encode-Clip -InFile "CurseBreakers.mp4" -OutName "CurseBreakers" -MaxWidth 1280
Encode-Clip -InFile "Outerstellar.webm" -OutName "Outerstellar" -MaxWidth 1280
Encode-Clip -InFile "AnimalSquad.mp4" -OutName "AnimalSquad" -MaxWidth 854
Encode-Clip -InFile "Jumper.mp4" -OutName "Jumper" -MaxWidth 854
Encode-Clip -InFile "KittenSmack.mp4" -OutName "KittenSmack" -MaxWidth 854
Encode-Clip -InFile "BeatPiston.mp4" -OutName "BeatPiston" -MaxWidth 854

Write-Host "Done encoding."
Get-ChildItem static\videos, static\videos\posters -File | Sort-Object Length -Descending | Format-Table Name, @{N='MB';E={[math]::Round($_.Length/1MB,2)}}
