use std::io::Error;

use signal_hook::consts::TERM_SIGNALS;
use signal_hook::iterator::exfiltrator::SignalOnly;
use signal_hook::iterator::SignalsInfo;

struct EncryptionBruteForcer {
	pub attempt_number: u64,
}

impl EncryptionBruteForcer {
	pub fn new() -> Self {
		Self { attempt_number: 0 }
	}

	fn brute_force(&mut self) {
		loop {
			self.attempt_number += 1;
		}
	}
}

static mut BRUTE_FORCERS: Vec<&'static mut EncryptionBruteForcer> = Vec::new();

fn main() -> Result<(), Error> {
	unsafe {
		let num_cpus = num_cpus::get();
		for _ in 0..num_cpus {
			let brute_forcer: &'static mut EncryptionBruteForcer =
				Box::leak(Box::new(EncryptionBruteForcer::new()));
			BRUTE_FORCERS.push(brute_forcer);
		}

		let mut sigs = Vec::<i32>::new();
		sigs.extend(TERM_SIGNALS);

		let mut signals = SignalsInfo::<SignalOnly>::new(&sigs).unwrap();
		for brute_forcer in &mut BRUTE_FORCERS {
			std::thread::spawn(move || {
				brute_forcer.brute_force();
			});
		}

		for info in &mut signals {
			eprintln!("Received a signal {:?}", info);
			for brute_forcer in &BRUTE_FORCERS {
				eprintln!("{}", brute_forcer.attempt_number);
			}
			std::process::exit(0);
		}

		Ok(())
	}
}
