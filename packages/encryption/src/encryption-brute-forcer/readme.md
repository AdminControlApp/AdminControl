# encryption-brute-force-timer

Measures the time it takes to brute-force a decryption by using all the machine's computational power to do just that.

## How it works

The admin password is stored as `"__ADMIN_PASSWORD__" + admin password` and encrypted with a key of `secret code + a string of digits of length 10 (e.g. "0000123456")`. The maximum value of the string of digits is determined by how many decryptions the user's machine can make in 5 seconds.

The reason why this is packaged as an executable and not a napi-rs addon is because it needs to run as a process that should be cleanly terminated after 5 seconds.
