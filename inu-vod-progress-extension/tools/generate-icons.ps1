param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\icons')
)

Add-Type -AssemblyName System.Drawing

function New-RoundedRectanglePath {
  param(
    [System.Drawing.RectangleF]$Rectangle,
    [float]$Radius
  )

  $diameter = $Radius * 2
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.AddArc($Rectangle.X, $Rectangle.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($Rectangle.X, $Rectangle.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

[System.IO.Directory]::CreateDirectory($OutputDirectory) | Out-Null

foreach ($size in 16, 32, 48, 128) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $padding = [float]($size * 0.125)
  $rect = [System.Drawing.RectangleF]::new($padding, $padding, $size - (2 * $padding), $size - (2 * $padding))
  $path = New-RoundedRectanglePath -Rectangle $rect -Radius ([float]($size * 0.18))
  $startColor = [System.Drawing.Color]::FromArgb(255, 20, 83, 137)
  $endColor = [System.Drawing.Color]::FromArgb(255, 0, 166, 126)
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new($rect, $startColor, $endColor, 45)
  $graphics.FillPath($brush, $path)

  $fontSize = [Math]::Max(7, $size * 0.47)
  $font = [System.Drawing.Font]::new('Arial', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textRect = [System.Drawing.RectangleF]::new(0, [float](-$size * 0.015), $size, $size)
  $graphics.DrawString('%', $font, [System.Drawing.Brushes]::White, $textRect, $format)

  $outputPath = Join-Path $OutputDirectory "icon$size.png"
  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $format.Dispose()
  $font.Dispose()
  $brush.Dispose()
  $path.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}
