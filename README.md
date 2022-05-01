# WinAutoInstaller

My applications list for automatize auto-installing after fresh installation of any Windows 10+

## Requires

- chocolatey
- Node.js v17.5+

## Backup

_This feature is currently not impelemnted, format was already made_

## Installation

- Clone this repo and go-to directory
- Run Powershell with administator right
- Run `node ./install.mjs`
- In a few minutes your apps will be installed

## Unavailable / Uninstallable apps

> Some of these apps canoot be installed due of bug in `winget`, see [here](https://github.com/microsoft/winget-cli/issues/248)

- Mail and Calendar
- 3uTools
- Paragon APFS
- AdGuard
- Logitech LogiTune
- NVIDIA Broadcast
- Intel Graphics Driver

## Recommended commands

### SSH Fixes

Run in PowerShell with Administrator rights

```powershell
Set-Service ssh-agent -StartupType Automatic
git config --global core.sshCommand C:/Windows/System32/OpenSSH/ssh.exe
```

Run in Command Prompt with Administrator rights

```cmd
sc config ssh-agent start=auto && net start ssh-agent
```

### Improve network speed

```powershell
netsh winsock reset
netsh int tcp set global autotuninglevel=normal
```
