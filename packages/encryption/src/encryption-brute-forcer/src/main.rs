use std::io::Error;

use aes_gcm::aead::generic_array::GenericArray;
use aes_gcm::aead::{Aead, NewAead};
use aes_gcm::Nonce;
use aes_gcm::{Aes256Gcm, Key};
use signal_hook::consts::TERM_SIGNALS;
use signal_hook::iterator::exfiltrator::SignalOnly;
use signal_hook::iterator::SignalsInfo;

static ADMIN_PASSWORD_QUALIFIER: &[u8] = b"__ADMIN_PASSWORD__";

struct EncryptionBruteForcer {
	pub attempt_number: u64,
	forcer_number: u8,
	ciphertext: Vec<u8>,
}

impl EncryptionBruteForcer {
	pub fn new(forcer_number: u8, ciphertext: Vec<u8>) -> Self {
		Self {
			attempt_number: 0,
			forcer_number,
			ciphertext,
		}
	}

	/// Tries to brute force the encrypted ciphertext by generating keys of `"12345" + random string of 10 digits`. "12345" represents the 5-digit admin password.
	fn brute_force(&mut self) {
		let nonce = Nonce::from_slice(b"unique nonce");

		loop {
			// Key size must be 32 characters, so we left pad it with zeros
			// let key_string = format!(
			// 	"0000000000000000012345{:0<2}{:0<8}",
			// 	self.forcer_number, self.attempt_number
			// );
			let key_string = "code:12345,salt:0000000000000000";
			let key: &GenericArray<u8, _> = Key::from_slice(&key_string.as_bytes());
			println!("{:?}", self.ciphertext);

			let cipher = Aes256Gcm::new(key);
			println!("{:?}", cipher.encrypt(&nonce, b"__ADMIN_PASSWORD__admin".as_ref()));
			let plaintext = cipher
				.decrypt(&nonce, self.ciphertext.as_ref())
				.expect("Failed to decrypt ciphertext.");

			if plaintext.starts_with(ADMIN_PASSWORD_QUALIFIER) {
				eprintln!(
					"Admin password cracked on attempt number {} by forcer number {}",
					self.attempt_number, self.forcer_number
				);
			}

			self.attempt_number += 1;
		}
	}
}

static mut BRUTE_FORCERS: Vec<&'static mut EncryptionBruteForcer> = Vec::new();

fn main() -> Result<(), Error> {
	let ciphertext = std::env::args().nth(1).expect("no ciphertext given");

	let num_cpus = num_cpus::get();
	for forcer_index in 0..num_cpus {
		let brute_forcer: &'static mut EncryptionBruteForcer = Box::leak(Box::new(
			EncryptionBruteForcer::new(forcer_index as u8, base64::decode(&ciphertext).unwrap()),
		));

		unsafe {
			BRUTE_FORCERS.push(brute_forcer);
		}
	}

	let mut sigs = Vec::<i32>::new();
	sigs.extend(TERM_SIGNALS);

	let mut signals = SignalsInfo::<SignalOnly>::new(&sigs).expect("Failed to create SignalsInfo");

	unsafe {
		for brute_forcer in &mut BRUTE_FORCERS {
			std::thread::spawn(move || {
				brute_forcer.brute_force();
			});
		}
	}

	for _ in &mut signals {
		let mut total_operations = 0;
		unsafe {
			for brute_forcer in &BRUTE_FORCERS {
				total_operations += brute_forcer.attempt_number;
			}
			println!("{}", total_operations);
		}
		std::process::exit(0);
	}

	Ok(())
}
