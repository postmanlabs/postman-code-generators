#!/bin/bash
set -ev; # stop on error

echo "Installing Rust"
  sudo apt-get install -y build-essential pkg-config libssl-dev
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  pushd ./codegens/rust-reqwest &>/dev/null;
    echo '''[package]
  name = "rust_reqwest_codegen"
  version = "0.0.1"
  edition = "2021"

  [dependencies]
  reqwest = { version = "0.11.14", features = ["json", "multipart"] }
  tokio = { version = "1.26.0", features = ["full"] }
  serde_json = { version = "1.0.94" }''' > Cargo.toml
    mkdir src && echo '''fn main() {
      println!("Hello, world!");
    }''' > src/main.rs
    cargo build
  popd &>/dev/null;
