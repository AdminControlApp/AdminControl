use sha2::{Digest, Sha256};
use std::io::Error;
use std::ops::Range;
use std::process::exit;

use aes_gcm::aead::generic_array::GenericArray;
use aes_gcm::aead::{Aead, NewAead};
use aes_gcm::Nonce;
use aes_gcm::{Aes256Gcm, Key};
use signal_hook::consts::TERM_SIGNALS;
use signal_hook::iterator::exfiltrator::SignalOnly;
use signal_hook::iterator::SignalsInfo;

struct EncryptionBruteForcer {
	pub attempt_number: u64,
	salt_range: Range<u64>,
	ciphertext: Vec<u8>,
	secret_code: String,
}

impl EncryptionBruteForcer {
	pub fn new(ciphertext: Vec<u8>, secret_code: String, salt_range: Range<u64>) -> Self {
		Self {
			attempt_number: 0,
			salt_range,
			ciphertext,
			secret_code,
		}
	}

	/// Tries to brute force the encrypted ciphertext by generating keys of `"12345" + random string of 10 digits`. "12345" represents the 5-digit admin password.
	fn brute_force(&mut self) {
		let nonce = Nonce::from_slice(b"unique nonce");

		for salt_attempt in Range::clone(&self.salt_range) {
			let original_key = format!("code:{},salt:{:0>10}", self.secret_code, salt_attempt);
			let mut hasher = Sha256::new();
			hasher.update(original_key.as_bytes());
			let key_string = hasher.finalize();

			let key: &GenericArray<u8, _> = Key::from_slice(&key_string[..]);

			let cipher = Aes256Gcm::new(key);
			let plaintext = cipher.decrypt(&nonce, self.ciphertext.as_ref());

			if let Ok(plaintext) = plaintext {
				println!("{}", std::str::from_utf8(&plaintext).unwrap());
				exit(0);
			}

			self.attempt_number += 1;
		}
	}
}

static mut BRUTE_FORCERS: Vec<&'static mut EncryptionBruteForcer> = Vec::new();

fn benchmark() -> Result<(), Error> {
	let num_cpus = num_cpus::get();
	let ciphertext = "pAu2/ComR4pFpXBpqWCxYw2uJfz8fMM+"; // Example of actual ciphertext passed
	let secret_code = String::from("00000");

	for forcer_index in 0..num_cpus {
		let brute_forcer: &'static mut EncryptionBruteForcer =
			Box::leak(Box::new(EncryptionBruteForcer::new(
				base64::decode(&ciphertext).expect("Failed to decode base64"),
				String::clone(&secret_code),
				(forcer_index as u64 * 100_000_000)..((forcer_index as u64 + 1) * 100_000_000),
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

fn decrypt(ciphertext: String, secret_code: String, max_salt_value: u64) -> Result<(), Error> {
	let num_cpus = num_cpus::get();
	let salt_chunk_size = (max_salt_value / num_cpus as u64) + 1; // Add 1 to "round up"
	for forcer_index in 0..num_cpus {
		let brute_forcer: &'static mut EncryptionBruteForcer =
			Box::leak(Box::new(EncryptionBruteForcer::new(
				base64::decode(&ciphertext).unwrap(),
				String::clone(&secret_code),
				forcer_index as u64 * salt_chunk_size
					..((forcer_index + 1) as u64 * salt_chunk_size),
			)));

		unsafe {
			BRUTE_FORCERS.push(brute_forcer);
		}
	}

	let mut join_handles = Vec::new();
	unsafe {
		for brute_forcer in &mut BRUTE_FORCERS {
			join_handles.push(std::thread::spawn(move || {
				brute_forcer.brute_force();
			}));
		}
	}

	for join_handle in join_handles {
		join_handle.join().expect("Failed to join thread");
	}

	panic!("Failed to decrypt admin password.");
}

fn main() -> Result<(), Error> {
	let operation = std::env::args().nth(1).expect("no operation given");

	match operation.as_str() {
		"benchmark" => {
			benchmark()?;
		}
		"decrypt" => {
			let ciphertext = std::env::args().nth(2).expect("no ciphertext given");
			let secret_code = std::env::args().nth(3).expect("no secret code given");
			let max_salt_value = std::env::args().nth(4).expect("no max salt value given");

			decrypt(
				ciphertext,
				secret_code,
				max_salt_value
					.parse()
					.expect("Failed to parse max salt value."),
			)?;
		}
		_ => panic!("Unknown operation: `{}`", operation),
	}

	Ok(())
}
