
## IoT Queue System

### Disable Serial

`sudo raspi-config`

`9 Advanced Options             Configure advanced settings`

`A7 Serial       Enable/Disable shell and kernel messages on the serial connection`

`Would you like a login shell to be accessible over serial?` `No`

### Enable Audio Jack

`sudo raspi-config`

`9 Advanced Options             Configure advanced settings`

`A8 Audio        Force audio out through HDMI or 3.5mm jack`

`1 Force 3.5mm ('headphone') jack`

### Control RPi audio volume

refs: http://www.dronkert.net/rpi/vol.html

`sudo nano /usr/local/bin/vol`

```sh
#!/bin/bash

MIX=amixer
declare -i LO=0     # Minimum volume; try 10 to avoid complete silence
declare -i HI=100   # Maximum volume; try 95 to avoid distortion
declare -i ADJ=3    # Volume adjustment step size

usage ()
{
	echo "Usage: `basename $0` [ - | + | N ]" >&2
	echo "  where N is a whole number between $LO and $HI, inclusive." >&2
	exit 1
}

# Zero or one argument
[ $# -le 1 ] || usage

# Argument must be one of: empty, -, +, number
[[ $1 == ?(-|+|+([0-9])) ]] || usage

ARG="$1"

# Number argument
if [[ $ARG == +([0-9]) ]]; then
	# Strip leading zeros
	while [[ $ARG == 0+([0-9]) ]]; do
		ARG=${ARG#0}
	done
	# Must be between LO and HI
	(( ARG >= LO && ARG <= HI )) || usage
fi

EXE=$(which $MIX)
if [ -z "$EXE" ]; then
	echo "Error: $MIX not found. Try \"sudo apt-get install alsa-utils\" first." >&2
	exit 2
fi

GET=$($EXE cget numid=1)
declare -i MIN=$(echo $GET | /bin/grep -E -o -e ',min=[^,]+' | /bin/grep -E -o -e '[0-9-]+')
declare -i MAX=$(echo $GET | /bin/grep -E -o -e ',max=[^,]+' | /bin/grep -E -o -e '[0-9-]+')
declare -i VAL=$(echo $GET | /bin/grep -E -o -e ': values=[0-9+-]+' | /bin/grep -E -o -e '[0-9-]+')

if (( MIN >= MAX || VAL < MIN || VAL > MAX )); then
	echo "Error: could not get the right values from $MIX output." >&2
	exit 3
fi

declare -i LEN=0
(( LEN = MAX - MIN ))

declare -i ABS=0
(( ABS = VAL - MIN ))

declare -i PCT=0
(( PCT = 100 * ABS / LEN ))

if [ ! -z "$ARG" ]; then

	declare -i OLD=$PCT

	if [[ "$ARG" == "+" ]]; then
		(( PCT += ADJ ))
	elif [[ "$ARG" == "-" ]]; then
		(( PCT -= ADJ ))
	else
		PCT=$ARG
	fi

	if [[ "$PCT" != "$OLD" ]]; then
		(( ABS = PCT * LEN / 100 ))
		(( VAL = MIN + ABS ))
		$EXE -q cset numid=1 -- $VAL
	fi
fi

echo $PCT
exit 0
```

`sudo chmod a+x /usr/local/bin/vol`

```
vol     # Outputs the current volume as a number between 0 and 100
vol +   # Turn up the volume by 3
vol -   # Turn down the volume by 3
vol 85  # Set the volume to 85
```

### Installation

1. `sudo apt-get install build-essential libudev-dev festival festvox-kallpc16k`

2. `git clone https://github.com/natsu90/baeque-pi.git`

3. `cd baeque-pi && npm install`

4. update `HOST` & `PORT` in `client.js`

5. `node client.js`

### Troubleshoot

1. If you receive `LIBUSB_ERROR_ACCESS` when try to connect the printer, most probably you have to use `sudo` when starting the script.

