# Flash drive prep (investigation drives)

`tools/PrepDrive.ps1` wipes a USB flash drive and loads one team's files onto it (exFAT, labelled `team-N`).

## Use
1. Team files live in `C:\Drives\team-1` … `team-9` (outside the repo).
2. Plug in ONE flash drive, unplug other USB storage.
3. Admin PowerShell: `Set-ExecutionPolicy -Scope Process Bypass`, then `.\tools\PrepDrive.ps1`.
4. Enter team 1-9, check the listed disk (name/size), type its disk number to confirm.

## Behaviour
- Only lists USB, non-boot/system disks under 256 GB; you must type the disk number back.
- Locked BitLocker drive with a letter: prompts for the password, unlocks, `Format-Volume` (removes encryption). If that fails or there is no letter: `diskpart clean` + format.
- A locked drive with no letter can't be unlocked: format it once in Disk Management, then rerun.
- The BitLocker password is never stored in the script or repo.

## Status
Untested end to end on a real drive. The 2 GB test drive failed repeatedly (BitLocker lock); check one drive with `manage-bde -status X:` after a run.
