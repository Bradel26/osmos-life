param(
  [string]$InputPath  = "assets/img/hero-familia.jpg",
  [string]$OutputPath = "assets/img/hero-familia.webp",
  [int]$Quality = 82
)

function Get-ExePath($name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $null
}

if (-not (Test-Path $InputPath)) {
  Write-Error "Arquivo de entrada não encontrado: $InputPath"
  exit 1
}

$cwebp  = Get-ExePath "cwebp"
$magick = Get-ExePath "magick"

if ($cwebp) {
  & $cwebp -q $Quality $InputPath -o $OutputPath
  Write-Host "WebP gerado via cwebp: $OutputPath"
}
elseif ($magick) {
  & $magick $InputPath -quality $Quality $OutputPath
  Write-Host "WebP gerado via ImageMagick: $OutputPath"
}
else {
  Write-Warning "Nenhum conversor encontrado. Instale um deles antes de continuar:"
  Write-Warning "  winget install ImageMagick.ImageMagick"
  Write-Warning "  (ou baixe o cwebp em https://developers.google.com/speed/webp/download)"
  Write-Warning "Sem instalar nada: converta manualmente em https://squoosh.app e salve como $OutputPath"
  exit 1
}
