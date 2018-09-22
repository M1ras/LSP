# LSP
A Bluetooth Low Energy inspector for the command line.

## Dependencies
LSP uses [noble 1.9.1](https://github.com/noble/noble/tree/2afa49a798e067d84970f97778a14aa07b986ad8) and [blessed 0.1.81](https://github.com/chjj/blessed/commit/a45575fee63fac158fd467087ec172f657bfec6b), so these dependencies are inferred from noble and blessed's dependencies.

### Mac OS
- Node.js (I've only tested on Node.js 8.X.X LTS)
- npm or Yarn
- Xcode

### Linux
- Linux 3.16+
- Node.js (I've only tested on Node.js 8.X.X LTS)
- npm or Yarn

#### Debian and derivatives
`sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev libcap2-bin`

#### RHEL and derivatives
`sudo dnf install systemd-devel bluez bluez-libs bluez-libs-devel libcap`

### FreeBSD
In theory, LSP should work on FreeBSD, but I haven't tried it out. Checkout [noble 1.9.1's documentation on FreeBSD](https://github.com/noble/noble/tree/2afa49a798e067d84970f97778a14aa07b986ad8#freebsd) to try it out.

### Windows
I've never been able to get LSP to work on Windows (10). Checkout [noble 1.9.1's documentation on Windows](https://github.com/noble/noble/tree/2afa49a798e067d84970f97778a14aa07b986ad8#windows) to try it out.

## Downloading
1. Download LSP  
  `git clone git@gitlab.com:Miras/LSP.git`  
  `cd LSP`
2. Reset LSP to a stable version  
  `git reset --hard '0.1.2'`

## Running
### Mac OS
`npm install` or `yarn`  
`bin/lsp.js`

### Linux
`npm install` or `yarn`  
`sudo bin/lsp.js`

If you don't want to run `sudo` every time you use LSP, you can grant Node.js raw network capabilities with the following command...  
`sudo setcap cap_net_raw+eip $(readlink -f $(which node))`  
You may have to rerun this command if Node.js is upgraded.

## Using
I wrote LSP to help expose and understand all the Bluetooth Low Energy Services, Characteristics, and Descriptors a Boosted board v2 Dual+ exposes, so I didn't code LSP with UX in mind. Here's a quick guide on how to use it...

After running `lsp.js`  
**If you see a black screen**  
Make sure bluetooth is turned on and no other program is scanning for bluetooth devices.

**If you see a list of MAC Addresses and Names**  
You can scroll through the list with the up and down buttons on your keyboard, the scroll wheel on your mouse, or a scrolling gesture on your trackpad.  
You can select a device with the enter button your keyboard, or by clicking on it with your mouse or trackpad.

**If you see a black screen again**  
Your computer is connecting to the device you selected. Be patient.

**If you see a list of services, characteristics, and descriptors**  
You're in! This part is pretty self explanatory; you have a tree view of all the services, characteristics, and descriptors exposed by the device you selected.

Each has a UUID, Type, and Name.  
Characteristics also have Properties and a Value.  
Descriptors also have a value.

Printing each property a characteristic has would take a lot of space, so I've abbreviated each into a single letter. Here's what they mean...

B = Broadcast  
R = Read  
A = Write without Response  
W = Write  
N = Notify  
I = Indicate  
B = Authenticated Signed Writes (this is a duplicate and should be fixed)  
C = Extended Properties

If a characteristic has the notify or indicate properties, LSP will automatically listen to that characteristic for changes, and update its displayed value.

**I'm done using LSP, and Ctrl-C isn't working, how do I get out?!**  
Q or escape on your keyboard.
