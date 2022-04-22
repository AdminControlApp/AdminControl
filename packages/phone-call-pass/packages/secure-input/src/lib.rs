#![deny(clippy::all)]

#[macro_use]
extern crate napi_derive;

use napi::bindgen_prelude::*;

use std::{collections::HashSet, process::Command};

struct DictParser {
	pub dicts: Vec<plist::Dictionary>,
}

impl DictParser {
	pub fn new() -> Self {
		DictParser { dicts: Vec::new() }
	}

	/// Traverses the values of d, returning everything that looks dict-like.
	pub fn find_dicts_in_tree(&mut self, dict: &plist::Value) {
		if let Some(dict) = dict.as_dictionary() {
			self.dicts.push(dict.clone());
			for dict_value in dict.values() {
				self.find_dicts_in_tree(dict_value);
			}
		} else if let Some(arr) = dict.as_array() {
			for array_value in arr {
				self.find_dicts_in_tree(array_value);
			}
		}
	}
}

#[napi]
fn get_secure_input_processes() -> Result<Vec<i64>> {
	let ioreg_output = Command::new("ioreg")
		.args([
			"-a", // Archive the output in XML
			"-l", // Show properties for all displayed objects
			"-w", "0", // Unlimited line width
		])
		.output()?;

	// Read the plist
	let ioreg_plist: plist::Value = plist::Value::from_reader_xml(&*ioreg_output.stdout).unwrap();

	let mut process_ids: HashSet<i64> = HashSet::new();

	let mut dict_parser = DictParser::new();

	dict_parser.find_dicts_in_tree(&ioreg_plist);
	for dict in dict_parser.dicts {
		if dict.contains_key("kCGSSessionSecureInputPID") {
			let pid = dict
				.get("kCGSSessionSecureInputPID")
				.unwrap()
				.as_signed_integer()
				.unwrap();

			process_ids.insert(pid);
		}
	}

	Ok(process_ids.into_iter().collect::<Vec<i64>>())
}
