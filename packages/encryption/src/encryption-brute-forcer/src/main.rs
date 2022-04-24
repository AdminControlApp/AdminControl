use std::io::Error;

use aes_gcm::aead::consts::U0;
use aes_gcm::aead::generic_array::GenericArray;
use aes_gcm::aead::{Aead, NewAead};
use aes_gcm::Nonce;
use aes_gcm::{aes::Aes256, Aes256Gcm, Key};
use signal_hook::consts::TERM_SIGNALS;
use signal_hook::iterator::exfiltrator::SignalOnly;
use signal_hook::iterator::SignalsInfo;

struct EncryptionBruteForcer {
	pub attempt_number: u64,
	forcer_number: u8,
}

impl EncryptionBruteForcer {
	pub fn new(forcer_number: u8, ciphertext: String) -> Self {
		Self {
			attempt_number: 0,
			forcer_number,
		}
	}

	/// Tries to brute force the encrypted ciphertext by generating keys of `"12345" + random string of 10 digits`. "12345" represents the 5-digit admin password.
	fn brute_force(&mut self) {
		let nonce = Nonce::from_slice(b"");

		loop {
			let forcer_number = self.forcer_number;
			let key = Key::from_slice(
				&format!("12345{:0<2}{:0<8}", self.forcer_number, self.attempt_number).as_bytes(),
			);
			let cipher = Aes256Gcm::new(key);
			let plaintext = cipher.decrypt(nonce, ciphertext.as_ref());
			self.attempt_number += 1;
		}
	}
}

static mut BRUTE_FORCERS: Vec<&'static mut EncryptionBruteForcer> = Vec::new();

fn main() -> Result<(), Error> {
	let ciphertext = std::env::args().nth(2).expect("no ciphertext given");

	let num_cpus = num_cpus::get();
	for _ in 0..num_cpus {
		let brute_forcer: &'static mut EncryptionBruteForcer =
			Box::leak(Box::new(EncryptionBruteForcer::new(ciphertext)));

		unsafe {
			BRUTE_FORCERS.push(brute_forcer);
		}
	}

	let mut sigs = Vec::<i32>::new();
	sigs.extend(TERM_SIGNALS);

	let mut signals = SignalsInfo::<SignalOnly>::new(&sigs).unwrap();

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
