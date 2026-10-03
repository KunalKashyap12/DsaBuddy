Add-Type -AssemblyName System.Drawing

function Generate-Icon([int]$size, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Clear transparent
    $g.Clear([System.Drawing.Color]::Transparent)

    # Draw rounded rectangle background
    $radius = [Math]::Max(2, [int]($size * 0.22))
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2

    $path.AddArc(0, 0, $diameter, $diameter, 180, 90)
    $path.AddArc($size - $diameter, 0, $diameter, $diameter, 270, 90)
    $path.AddArc($size - $diameter, $size - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc(0, $size - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    # Fill background with dark/black color (#0a0a0c)
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 14))
    $g.FillPath($bgBrush, $path)

    # Subtle inner border for contrast on dark browser bars
    if ($size -ge 32) {
        $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), 1)
        $g.DrawPath($borderPen, $path)
        $borderPen.Dispose()
    }

    # Draw crisp white "D"
    $fontSize = [float]($size * 0.62)
    $fontFamily = "Segoe UI"
    $fontStyle = [System.Drawing.FontStyle]::Bold

    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, $fontStyle, [System.Drawing.GraphicsUnit]::Pixel)
    
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    # Slight vertical offset adjustment because fonts usually sit slightly below center
    $yOffset = [float]($size * 0.01)
    $textRect = New-Object System.Drawing.RectangleF(0, $yOffset, [float]$size, [float]$size)

    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $g.DrawString("D", $font, $textBrush, $textRect, $format)

    # Clean up
    $bgBrush.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
    $format.Dispose()
    $path.Dispose()
    $g.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated $outPath ($size x $size)"
}

$iconDir = Join-Path $PSScriptRoot "..\icons"
if (-not (Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir | Out-Null
}

Generate-Icon 16 (Join-Path $iconDir "icon16.png")
Generate-Icon 32 (Join-Path $iconDir "icon32.png")
Generate-Icon 48 (Join-Path $iconDir "icon48.png")
Generate-Icon 128 (Join-Path $iconDir "icon128.png")
