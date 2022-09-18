import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import {
  shortenAddress,
  useCall,
  useEthers,
  useLookupAddress,
} from "@usedapp/core";
import React, { useEffect, useState } from "react";
import bridgeLabel from "./a-bridge-label.png";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
} from "styled-dropdown-component";

import { Body, Button, Container, Header } from "./components";

import { addresses, abis } from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

function WalletButton() {
  const [rendered, setRendered] = useState("");

  const ens = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    } else {
      setRendered("");
    }
  }, [account, ens, setRendered]);

  useEffect(() => {
    if (error) {
      console.error("Error while connecting wallet:", error.message);
    }
  }, [error]);

  return (
    <Button
      onClick={() => {
        if (!account) {
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

const supportedTokens = ["tMATIC", "tLPT", "stETH"];
const supportedNetworks = ["Goerli", "Mumbai"];

const getBridgeContractAddress = (network) => {
  return network === "Goerli"
    ? addresses["aBridgeRouterGoerli"]
    : addresses["aBridgeRouterMumbai"];
};

const getTokenContractAddress = (network, token) => {
  if (network === "Goerli") {
    if (token === "tMATIC") {
      return addresses["tmaticGoerli"];
    } else if (token === "tLPT") {
      return addresses["tlptGoerli"];
    } else {
      return addresses["stethGoerli"];
    }
  } else {
    if (token === "tMATIC") {
      return addresses["tmaticMumbai"];
    } else if (token === "tLPT") {
      return addresses["tlptMumbai"];
    } else {
      return addresses["stethMumbai"];
    }
  }
};

function App() {
  const { loading, error: subgraphQueryError, data } = useQuery(GET_TRANSFERS);

  const [tokenSelectorHidden, setTokenSelectorHidden] = useState(true);
  const [fromNetworkSelectorHidden, setFromNetworkSelectorHidden] = useState(
    true
  );
  const [toNetworkSelectorHidden, setToNetworkSelectorHidden] = useState(true);
  const [selectedToken, setSelectedToken] = useState();
  const [selectedToNetwork, setSelectedToNetwork] = useState();
  const [selectedFromNetwork, setSelectedFromNetwork] = useState();
  const [sendValue, setSendValue] = useState("");

  const { error: fromContractCallError, value: fromTokenBalance } =
    useCall({
      contract: new Contract(addresses.ceaErc20, abis.erc20),
      method: "balanceOf",
      args: [
        getTokenContractAddress(selectedFromNetwork ?? "Goerli", selectedToken),
      ],
    }) ?? {};
  const { error: toContractCallError, value: toTokenBalance } =
    useCall({
      contract: new Contract(addresses.ceaErc20, abis.erc20),
      method: "balanceOf",
      args: [
        getTokenContractAddress(selectedFromNetwork ?? "Goerli", selectedToken),
      ],
    }) ?? {};

  useEffect(() => {
    if (subgraphQueryError) {
      console.error(
        "Error while querying subgraph:",
        subgraphQueryError.message
      );
      return;
    }
    if (!loading && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, subgraphQueryError, data]);

  return (
    <Container>
      <Header>
        <WalletButton />
      </Header>
      <Body>
        <img
          alt="Ethereum logo"
          src={bridgeLabel}
          style={{ paddingBottom: 50 }}
        />

        <Dropdown>
          <div>
            Send
            <Button
              dropdownToggle
              onClick={() => setTokenSelectorHidden(!tokenSelectorHidden)}
            >
              {selectedToken || "Token"}
            </Button>
          </div>
          <DropdownMenu
            hidden={tokenSelectorHidden}
            toggle={() => setTokenSelectorHidden(!tokenSelectorHidden)}
          >
            {supportedTokens.map((token, i) => (
              <DropdownItem
                key={i}
                onClick={() => {
                  setTokenSelectorHidden(!tokenSelectorHidden);
                  setSelectedToken(token);
                }}
              >
                {token}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <div
          style={{
            backgroundColor: "#328fa8",
            padding: 20,
            margin: 10,
            borderRadius: 10,
            width: 350,
          }}
        >
          From
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Dropdown>
              <div>
                <Button
                  dropdownToggle
                  onClick={() =>
                    setFromNetworkSelectorHidden(!fromNetworkSelectorHidden)
                  }
                >
                  {selectedFromNetwork || "Select Network"}
                </Button>
              </div>
              <DropdownMenu
                hidden={fromNetworkSelectorHidden}
                toggle={() =>
                  setFromNetworkSelectorHidden(!fromNetworkSelectorHidden)
                }
              >
                {supportedNetworks.map((network, i) => (
                  <DropdownItem
                    key={i}
                    onClick={() => {
                      setFromNetworkSelectorHidden(!fromNetworkSelectorHidden);
                      setSelectedFromNetwork(network);
                    }}
                  >
                    {network}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <input
              style={{ textAlign: "right" }}
              type="text"
              value={sendValue}
              placeholder="0"
              onChange={(e) => setSendValue(e.target.value)}
            />
          </div>
        </div>
        <div
          style={{
            backgroundColor: "#328fa8",
            padding: 20,
            margin: 10,
            borderRadius: 10,
            width: 350,
          }}
        >
          To
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Dropdown>
              <div>
                <Button
                  dropdownToggle
                  onClick={() =>
                    setToNetworkSelectorHidden(!toNetworkSelectorHidden)
                  }
                >
                  {selectedToNetwork || "Select Network"}
                </Button>
              </div>
              <DropdownMenu
                hidden={toNetworkSelectorHidden}
                toggle={() =>
                  setToNetworkSelectorHidden(!toNetworkSelectorHidden)
                }
              >
                {supportedNetworks.map((network, i) => (
                  <DropdownItem
                    key={i}
                    onClick={() => {
                      setToNetworkSelectorHidden(!toNetworkSelectorHidden);
                      setSelectedToNetwork(network);
                    }}
                  >
                    {network}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <input
              style={{ textAlign: "right" }}
              type="text"
              value={sendValue}
              placeholder="0"
              onChange={(e) => setSendValue(e.target.value)}
            />
          </div>
        </div>
      </Body>
    </Container>
  );
}

export default App;
