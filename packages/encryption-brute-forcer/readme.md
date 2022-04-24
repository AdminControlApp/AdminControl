# encryption-brute-force-timer

Measures the time it takes to brute-force a decryption by using all the machine's computational power to do just that.

## How it works

The admin password is encrypted as `"__ADMIN_PASSWORD__" + secret 5-digit code + encryption salt`, where the encryption salt is a string of digits of length 100 (e.g. `00...0000000123456`). The maximum value of this number is determined by how many decryptions the machine can make in 5 seconds.

> The encryption salt must always be the same length to not provide any hints about the length of the actual encryption salt used.

The reason why this is packaged as an executable and not a napi-rs addon is because it needs to run as a process that should be cleanly terminated after 5 seconds.
