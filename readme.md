# AdminControl

AdminControl is an open-source application that controls administrator access to your computer, preventing you from abusing it to find workarounds to productivity apps like [Cold Turkey Blocker](https://getcoldturkey.com).

> **Note:** AdminControl currently only supports macOS, but pull requests that add support for other operating systems (if possible) are welcome!

## Why?

I'm an avid fan of productivity apps like [Cold Turkey Blocker](https://getcoldturkey.com) and [Freedom](https://freedom.to). However, as a programmer, I've found ways to easily disable them and work around them. It doesn't take long for me, either; it only takes me around 10 seconds to completely disable these apps (of course, I won't share how I do it so I don't sabotage your productivity).

But, one thing in common about all these workarounds (at least, the ones I've found) is that they all require administrator access to the computer. So, if I could find a way to prevent myself from abusing administrator access (or at least add more friction so it takes significantly longer than 10 seconds to obtain administrator access), it would make these productivity apps significantly more effective.

Thus, AdminControl is my attempt at using my extended computer science knowledge to solve the problem caused by my extended computer science knowledge. ~~Yeah, modern problems require modern solutions.~~

Of course, since there's no way people are going to trust a closed-source program that controls your computer's admin password, AdminControl is open-source!

## How it works

The admin password is always a randomly generated alphanumeric string of *n* characters, where *n* is configurable. It is stored encrypted using a random salt and a secret 4-digit code that only a trusted third-party knows (e.g. a friend or a family member). The random salt is used to increase the decryption time to prevent the 4-digit secret from being quickly discovered through brute-forcing.

> The reason why AdminControl doesn't use the 4-digit code as the admin password is to prevent the third-party from needing to change it often when the user needs to know the admin password directly (e.g. logging into the administrator account from the Lock Screen), since the 4-digit code is never exposed to the end user.

The encrypted password is always stored locally on the machine, and optionally backed up to a password manager application like Bitwarden. **It is critical that this encrypted password is saved somewhere reliable, especially if *n* is large because the only other way to recover the admin password is through brute-force, which needs 2^n attempts and is rate-limited by macOS.**

When the admin password is needed, the user requests the third-party to enter the secret 4-digit code. This can be done manually (typing on the physical keyboard) or remotely using a tool like [phone-call-input](https://github.com/AdminControlApp/phone-call-input). Then, AdminControl reads the encrypted password, decrypts it using the 4-digit code and brute-force (which should take around 7-10 seconds), and then inputs it into the running application (which must have Secure Input enabled).

Sometimes, it isn't enough to just input the password, but also to know it (e.g. for logging into the administrator account from the Lock Screen). In these cases, AdminControl has an option that enables you to retrieve the raw admin password (after retreiving it from the third-party), but requires you complete a configurable time-consuming challenge to prevent an impulsive use of it (examples of such challenges are typing 500 random characters, waiting 5 minutes while idle on the app menu, etc.). Then, it will output the *n*-letter admin password, give you 30 seconds (configurable) to copy it down somewhere, and then log you out (if it fails to log you out within 30 seconds, the admin password will be reset). Then, once you've finished using the administrator account and then log back in, AdminControl will automatically reset the admin password on startup.

> As a precaution, the third-party passcode is also backed up as an expensive bcrypt hash that takes around 15 seconds to compute. This allows us to recover the password in case the third-party forgets it, but the time it takes to brute-force the password is around 6 hours, deincentivizing the user from impulsively cracking it.

## Screen Time

AdminControl also has an option to set up Screen Time for other devices. This feature takes advantage of the "Share Across Devices" feature of Screen Time, where changes to the passcode on one device will propogate to other devices.

However, the encryption workflow that AdminControl uses on macOS isn't possible on iOS, so instead of an encrypted passcode, the Screen Time passcode uses the 4-digit third-party passcode directly. This shouldn't be a big issue, because the Screen Time passcode will always need to be typed manually on iOS, so it is very unlikely that it will be accidentally leaked.

## Refreshing the Password

AdminControl has an option to refresh the admin password in case it ever gets leaked. This requires the third-party secret code to be inputted. After the 4-digit secret code is received (from using a tool like phone-call-input), AdminControl will generate a new random 6-character admin passcode, encrypt it with the secret code, and save it locally and optionally onto a password manager application like Bitwarden. It will also produce a hash backup of the secret code.

## Setup

When AdminControl is installed for the first time, it guides you through a set up for configuring the locations where the encrypted secret passwords and hash backup are stored to. Then, it optionally asks for a Bitwarden API Key for saving the encrypted password and hash backup into Bitwarden. After this, it then asks you if you want to set up phone-call-input, which allows you to enter a phone number that gets called whenever you need the admin password. You can optionally provide your own Twilio tokens
