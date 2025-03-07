# Detect the architecture #
if [[ $(arch) == "arm64" ]]; then
  image="cosmwasm/optimizer-arm64:0.16.1"
else
  image="cosmwasm/optimizer:0.16.1"
fi

docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  ${image}