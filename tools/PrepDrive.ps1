$n = Read-Host "Team (1-9)"
if ($n -notmatch '^[1-9]$') { throw "Pick 1-9" }
$Team = "team-$n"
if (-not (Test-Path "C:\Drives\$Team")) { throw "Missing folder C:\Drives\$Team" }

$cands = @(Get-Disk | Where-Object { $_.BusType -eq 'USB' -and -not $_.IsBoot -and -not $_.IsSystem -and $_.Size -lt 256GB })
if (-not $cands) { throw "No eligible USB drive found" }
$cands | ForEach-Object {
  $vols = (Get-Partition -DiskNumber $_.Number -ErrorAction SilentlyContinue | Get-Volume -ErrorAction SilentlyContinue |
           ForEach-Object { "$($_.DriveLetter): $($_.FileSystemLabel)" }) -join ', '
  "Disk $($_.Number) | $($_.FriendlyName) | $([int]($_.Size/1GB)) GB | $vols"
}
$dn = Read-Host "Type the disk number to WIPE and load '$Team'"
$disk = $cands | Where-Object Number -eq ([int]$dn)
if (-not $disk) { throw "Not an eligible disk, nothing done" }

# Locked BitLocker volumes block diskpart's clean; unlock first (prompts for the password).
foreach ($p in @(Get-Partition -DiskNumber $disk.Number -ErrorAction SilentlyContinue | Where-Object DriveLetter)) {
  if ((manage-bde -status "$($p.DriveLetter):") -match 'Lock Status:\s+Locked') { manage-bde -unlock "$($p.DriveLetter):" -Password }
}

$existing = Get-Partition -DiskNumber $disk.Number -ErrorAction SilentlyContinue | Where-Object DriveLetter | Select-Object -First 1
$ok = $false
if ($existing) {
  # Same as Disk Management's Format: works on an unlocked BitLocker volume and removes the encryption.
  try { Format-Volume -DriveLetter $existing.DriveLetter -FileSystem exFAT -NewFileSystemLabel $Team -Force -Confirm:$false -ErrorAction Stop | Out-Null; $ok = $true } catch { "Format-Volume failed, trying diskpart" }
}
if (-not $ok) {
@"
select disk $($disk.Number)
attributes disk clear readonly
clean
create partition primary
format fs=exfat quick label=$Team
assign
"@ | diskpart
}

Start-Sleep 3
Update-HostStorageCache
$letter = (Get-Partition -DiskNumber $disk.Number | Where-Object DriveLetter).DriveLetter
if (-not $letter) { throw "Format failed, nothing copied. If the drive is still BitLocker-locked with no letter, format it in Disk Management once, then rerun" }
Copy-Item "C:\Drives\$Team\*" "${letter}:\" -Recurse
"Done: $Team on ${letter}:"
