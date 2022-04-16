# WinAutoInstaller

My applications list for automatize auto-installing after fresh installation of any Windows 10+

## Requires

- chocolatey
- Node.js v17.5+

## Features

- Uses all power of your CPU
- Uses all power of your network
- Very fast
- Uses already tested and trusted tools

## Backup

_This feature is currently not impelemnted, format was already made_

## Installation

- Clone this repo and go-to directory
- Run Powershell with administator right
- Run `node ./install.mjs`
- In a few minutes your apps will be installed

## Unavailable / Uninstallable apps

> Some of these apps canoot be installed due of bug in `winget`, see [here](https://github.com/microsoft/winget-cli/issues/248)

- 3uTools
- Paragon APFS
- AdGuard
- Logitech LogiTune
- NVIDIA Broadcast
- Intel Graphics Driver

## Recommended commands

### Improve network speed

```powershell
netsh winsock reset
netsh int tcp set global autotuninglevel=normal
```
