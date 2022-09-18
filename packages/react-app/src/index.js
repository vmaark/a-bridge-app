import "./index.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { DAppProvider, Goerli, Mumbai } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

// IMPORTANT, PLEASE READ
// To avoid disruptions in your app, change this to your own Infura project id.
// https://infura.io/register
const INFURA_PROJECT_ID = "9dd97db4a45843e3aedb023f39ac2d35";
const config = {
  readOnlyChainId: Goerli.chainId,
  readOnlyUrls: {
    [Mumbai.chainId]:
      "https://polygon-mumbai.g.alchemy.com/v2/y5D9C_eB0aRhS4Sqa57ZdvD0EQ1HzLkO",
    [Goerli.chainId]: "https://goerli.infura.io/v3/" + INFURA_PROJECT_ID,
  },
  networks: [Mumbai, Goerli],
};

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
});

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
