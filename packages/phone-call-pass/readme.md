# Phone Call Pass

A project that lets you initiate a call to somebody who can then enter a passcode on their phone that gets inputted into your computer.

## Purpose

I highly value accountability, especially during times where my self-control/willpower is limited. I've tried using apps like [Cold Turkey Blocker](https://getcoldturkey.com) and other programs, but being a programmer with admin access to my computer allows me to easily bypass their blocks.

Thus, on my computer, I purposely removed admin permissions from my account and gave the admin password to my parents. This way, when I'm craving for distraction, I have no way to disable Cold Turkey Blocker and I'm forced to do something productive (or at least not distracting).

> And in case they forget the password, [I've used bcyrpt to hash the original passcode with 15 rounds](https://github.com/leonzalion/hashed-out/blob/main/src/utils/four-digit.ts#L49) which takes around 5 seconds to compute on my computer and stored the hash in my passcode manager. Since it's a 4-digit passcode, cracking the hash through brute force (by testing all 4-number combinations from 0000-9999) takes around 14 hours, so it's theoretically recoverable, but I'm not willing to wait 14 hours to disable Cold Turkey for a few distracting videos on YouTube.

However, there are times when I need the admin password, such as installing a new program or updating an existing one. Making my parents walk to my computer and manually type the password every time gets a bit unwieldly, so as a programmer, I decided to come up with a way that they can remotely input the password on my computer.

I was going to initially develop an app, but then publishing the app onto my parents phones' would've been too much of a hassle (especially since they use a phone where installing apps from Google Play is an incredibly tedious task). There's also other friction involved with an app, such as needing an internet connection (in order to send the password to my computer), me needing to contact them beforehand and tell them to open the app and input the password (which can get annoying), etc.

So, I thought, since I'll need to contact them anyways via phone or SMS, why not just make that the primary method of communication for the passcode?

SMS wouldn't fit too well for my use case because it doesn't immediately capture their attention, and I don't want to have to wait for their reply before I receive the passcode (especially in situations where I need the passcode right away).

So, I decided to use Twilio's Voice API to programatically call my parents when I run a command, who then enter that passcode using their phone's keypad, and then those numbers will be inputted into my computer via keystrokes.

## Flow

1. I run a command from my terminal.
2. My command starts a Node.js server and spins up an ngrok server that allows my local server to be accessed from the Internet via a URL.
3. My command starts a voice call to my parents' phone number, which is preprogrammed to say some short message about entering the 4-digit passcode into their keypad.
4. They pick up the phone, hear the message, and type those 4 digits.
5. Twilio will then send a request to my ngrok URL at the `/voice` endpoint with their input.
6. I then run an AppleScript script that inputs keystrokes based on their passcode input on my computer (I configured my code such that the AppleScript only executes when the user is focused on a secure textbox so that the password isn't accidentally leaked).

## Usage

Clone this repository to a folder and navigate to it:

```bash
git clone https://github.com/leonzalion/phone-call-pass
cd phone-call-pass
```

Install the dependencies using your favourite package manager (I recommend [pnpm](https://pnpm.io)):

```bash
pnpm install
```

Then, add an `.env` file to the root of the project with the following keys:

```env
TWILIO_ACCOUNT_SID= # Your Twilio account ID
TWILIO_AUTH_TOKEN= # Your Twilio auth token
PHONE_NUMBER_TO_CALL= # The number you want to call
ORIGIN_PHONE_NUMBER= # Your Twilio number
PORT= # The port you want to run the server on (optional, default: 5050)
```

To initiate a call to the number you specified in your `.env` file, run:

```bash
pnpm start
```
