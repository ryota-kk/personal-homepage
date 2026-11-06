$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectDir
try {
  foreach ($directory in @('assets/media', 'assets/posters', 'assets/gallery/previews')) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }
  $clips = @(
    @{ Name = 'scene1'; Input = 'assets/scene11.mp4'; PosterTime = '0.2' },
    @{ Name = 'transition'; Input = 'assets/transition_1_2.mp4'; PosterTime = '1.5' },
    @{ Name = 'scene2'; Input = 'assets/scene2.mp4'; PosterTime = '17' },
    @{ Name = 'scene2-idle'; Input = 'assets/scene2_idle_loop.mp4'; PosterTime = '0.2' },
    @{ Name = 'scene3'; Input = 'assets/scene3.mp4'; PosterTime = '0.2' },
    @{ Name = 'scene3-loop'; Input = 'public/videos/scene3-loop-after.mp4'; PosterTime = '0.2' }
  )
  foreach ($clip in $clips) {
    foreach ($variant in @('desktop', 'mobile')) {
      $width = if ($variant -eq 'mobile') { 1280 } else { 1920 }
      $quality = if ($variant -eq 'mobile') { 27 } else { 25 }
      $maxRate = if ($variant -eq 'mobile') { '2200k' } else { '4500k' }
      $buffer = if ($variant -eq 'mobile') { '4400k' } else { '9000k' }
      $output = "assets/media/$($clip.Name)-$variant.mp4"
      & ffmpeg -hide_banner -loglevel error -y -i $clip.Input -an -vf "scale='min($width,iw)':-2" -c:v libx264 -preset fast -crf $quality -maxrate $maxRate -bufsize $buffer -pix_fmt yuv420p -movflags +faststart $output
      if ($LASTEXITCODE -ne 0) { throw "Video encoding failed: $output" }
      Write-Output "Generated $output"
    }
    & ffmpeg -hide_banner -loglevel error -y -ss $clip.PosterTime -i $clip.Input -frames:v 1 -vf 'scale=1280:-2' -q:v 3 "assets/posters/$($clip.Name).jpg"
    if ($LASTEXITCODE -ne 0) { throw "Poster generation failed: $($clip.Name)" }
  }
  foreach ($number in 1..12) {
    foreach ($variant in @('desktop', 'mobile')) {
      $edge = if ($variant -eq 'mobile') { 960 } else { 1920 }
      $output = "assets/gallery/previews/photo$number-$variant.webp"
      & ffmpeg -hide_banner -loglevel error -y -i "assets/gallery/photo$number.jpg" -frames:v 1 -vf "scale=${edge}:${edge}:force_original_aspect_ratio=decrease:force_divisible_by=2" -c:v libwebp -quality 82 -compression_level 6 $output
      if ($LASTEXITCODE -ne 0) { throw "Photo encoding failed: $output" }
    }
  }
  Write-Output 'Generated delivery media. Original files were retained.'
} finally {
  Pop-Location
}
