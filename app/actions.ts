"use server";
const SUSHISWAP_API_URL = `https://gateway-arbitrum.network.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/6NUtT5mGjZ1tSshKLf5Q3uEEJtjBZJo1TpL5MXsUBqrT`;

export const handleSushiSwapQuote = async (amount: string, direction: string, reverse: boolean) => {
  if(amount == ''){
    return 0
  }
  const query = {
    query: `
        query ($tokenIn: String!, $tokenOut: String!) {
          pairs(where: {name: "USDC-WETH"}) {
            token0Price
            token1Price
          }
        }
    `,
    variables: {
      tokenIn: "USDC",
      tokenOut: "WETH",
    },
  };

  const response = await fetch(SUSHISWAP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  const { data: { pairs } } = await response.json()

  const { token0Price, token1Price } = pairs[0]

  const price = reverse ? parseFloat(amount) * (direction === 'fromTo' ? parseFloat(token1Price) : parseFloat(token0Price)) : parseFloat(amount) * (direction === 'fromTo' ? parseFloat(token0Price) : parseFloat(token1Price))
  return price
};
