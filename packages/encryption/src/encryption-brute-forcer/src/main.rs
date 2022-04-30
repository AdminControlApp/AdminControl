use sha2::{Digest, Sha256};
use std::io::Error;
use std::process::exit;

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
	secret_code: String,
}

impl EncryptionBruteForcer {
	pub fn new(forcer_number: u8, ciphertext: Vec<u8>, secret_code: String) -> Self {
		Self {
			attempt_number: 0,
			forcer_number,
			ciphertext,
			secret_code,
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
			let original_key = format!(
				"code:{},salt:{:0<2}{:0<8}",
				self.secret_code, self.forcer_number, self.attempt_number
			);
			let mut hasher = Sha256::new();
			hasher.update(original_key.as_bytes());
			let key_string = hasher.finalize();

			let key: &GenericArray<u8, _> = Key::from_slice(&key_string[..]);

			let cipher = Aes256Gcm::new(key);
			let plaintext = cipher.decrypt(&nonce, self.ciphertext.as_ref());

			if let Ok(plaintext) = plaintext {
				if plaintext.starts_with(ADMIN_PASSWORD_QUALIFIER) {
					eprintln!("{}", std::str::from_utf8(&plaintext).unwrap());
					exit(0);
				}
			}

			self.attempt_number += 1;
		}
	}
}

static mut BRUTE_FORCERS: Vec<&'static mut EncryptionBruteForcer> = Vec::new();

fn main() -> Result<(), Error> {
	let ciphertext = std::env::args().nth(1).expect("no ciphertext given");
	let secret_code = std::env::args().nth(2).expect("no secret code given");

	let num_cpus = num_cpus::get();
	for forcer_index in 0..num_cpus {
		let brute_forcer: &'static mut EncryptionBruteForcer =
			Box::leak(Box::new(EncryptionBruteForcer::new(
				forcer_index as u8,
				base64::decode(&ciphertext).unwrap(),
				String::clone(&secret_code),
			)));

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
