$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
node scripts/social-data.mjs
node scripts/create-logo.mjs
$logoArtwork = Get-Content data/logo.json -Raw -Encoding UTF8 | ConvertFrom-Json
$socialPages = Get-Content artifacts/social-data.json -Raw -Encoding UTF8 | ConvertFrom-Json
$socialDirectory = Join-Path $PWD 'public/assets/social'
New-Item -ItemType Directory -Force $socialDirectory | Out-Null
function New-Brush([string]$color) { return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($color)) }
$ink = New-Brush '#242923'
$gold = New-Brush '#dfc58f'
$paper = New-Brush '#f8f7f2'
$muted = New-Brush '#c8cfbd'
$goldPen = [System.Drawing.Pen]::new($gold,1.8)
function Draw-Emblem($graphics, [single]$left, [single]$top, [single]$size) {
  $saved = $graphics.Save()
  $graphics.TranslateTransform($left,$top)
  $graphics.ScaleTransform($size/100,$size/100)
  foreach ($shape in $logoArtwork.shapes) {
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    [single]$px = 0; [single]$py = 0
    foreach ($command in $shape.commands) {
      switch ($command[0]) {
        'M' { $path.StartFigure(); $px = $command[1]; $py = $command[2] }
        'L' { $path.AddLine($px,$py,[single]$command[1],[single]$command[2]); $px = $command[1]; $py = $command[2] }
        'C' { $path.AddBezier($px,$py,[single]$command[1],[single]$command[2],[single]$command[3],[single]$command[4],[single]$command[5],[single]$command[6]); $px = $command[5]; $py = $command[6] }
        'Z' { $path.CloseFigure() }
      }
    }
    if ($shape.fill -ne 'none') { $fillBrush = New-Brush $shape.fill; $graphics.FillPath($fillBrush,$path); $fillBrush.Dispose() }
    if ($shape.stroke) { $strokeBrush = New-Brush $shape.stroke; $strokePen = [System.Drawing.Pen]::new($strokeBrush,[single]$shape.width); $strokePen.StartCap = 'Round'; $strokePen.EndCap = 'Round'; $strokePen.LineJoin = 'Round'; $graphics.DrawPath($strokePen,$path); $strokePen.Dispose(); $strokeBrush.Dispose() }
    $path.Dispose()
  }
  $graphics.Restore($saved)
}
$logo = [System.Drawing.Bitmap]::new(512,512)
$logoGraphics = [System.Drawing.Graphics]::FromImage($logo)
$logoGraphics.SmoothingMode = 'AntiAlias'
$logoGraphics.Clear([System.Drawing.Color]::Transparent)
Draw-Emblem $logoGraphics 0 0 512
$logo.Save((Join-Path $PWD 'public/assets/landscaping-logo.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$logoGraphics.Dispose(); $logo.Dispose()
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$encoder = [System.Drawing.Imaging.EncoderParameters]::new(1)
$encoder.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality,[long]85)
foreach ($socialPage in $socialPages) {
  $bitmap = [System.Drawing.Bitmap]::new(1200,630)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = 'AntiAlias'
  $graphics.TextRenderingHint = 'AntiAliasGridFit'
  $graphics.InterpolationMode = 'HighQualityBicubic'
  $graphics.FillRectangle($ink,0,0,1200,630)
  $photograph = [System.Drawing.Image]::FromFile((Join-Path $PWD ('public/assets/' + $socialPage.photo)))
  $ratio = [Math]::Max(490/$photograph.Width,582/$photograph.Height)
  $sourceWidth = 490/$ratio; $sourceHeight = 582/$ratio
  $graphics.DrawImage($photograph,[System.Drawing.RectangleF]::new(686,24,490,582),[System.Drawing.RectangleF]::new(($photograph.Width-$sourceWidth)/2,($photograph.Height-$sourceHeight)/2,$sourceWidth,$sourceHeight),[System.Drawing.GraphicsUnit]::Pixel)
  Draw-Emblem $graphics 48 42 78
  $wordmarkFont = [System.Drawing.Font]::new('Segoe UI',23,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $smallFont = [System.Drawing.Font]::new('Segoe UI',12,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $bodyFont = [System.Drawing.Font]::new('Segoe UI',16,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $headlineFont = [System.Drawing.Font]::new('Georgia',57,[System.Drawing.FontStyle]::Regular,[System.Drawing.GraphicsUnit]::Pixel)
  $graphics.DrawString('M O H F A M',$wordmarkFont,$paper,142,50)
  $graphics.DrawString('L A N D S C A P I N G',$smallFont,$gold,143,87)
  $graphics.DrawString('A NEW CHAPTER IN THE MOHFAM FAMILY',$smallFont,$gold,52,175)
  $headlineRectangle = [System.Drawing.RectangleF]::new(48,215,605,235)
  $headlineFormat = [System.Drawing.StringFormat]::new()
  $headlineFormat.Trimming = 'Word'
  $graphics.DrawString($socialPage.heading,$headlineFont,$paper,$headlineRectangle,$headlineFormat)
  $graphics.DrawLine($goldPen,52,475,107,475)
  $graphics.DrawString('Proposed landscape care. Start a conversation.',$bodyFont,$muted,52,500)
  $graphics.DrawString('MohFam Landscaping',$bodyFont,$gold,52,566)
  $graphics.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(190,36,41,35)),706,550,210,31)
  $graphics.DrawString('Illustrative photography',$smallFont,$paper,718,556)
  $bitmap.Save((Join-Path $socialDirectory ($socialPage.key + '.jpg')),$jpegCodec,$encoder)
  $photograph.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
Write-Output 'Created 11 dedicated 1200 x 630 social cards and separate organization logo.'
