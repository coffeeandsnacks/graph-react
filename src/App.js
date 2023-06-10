// @ts-check
import './App.css';
import React, { useEffect, useState } from 'react'

const APIURL = "https://gateway.thegraph.com/api/d3dd46dedd6bd87177046327502db49a/subgraphs/id/D7azkFFPFT5H8i32ApXLr34UQyBfxDAfKoCEK4M832M6"

const query = `
  query {
    highestSwaps: swaps(first: 5, orderDirection: desc, orderBy: amountUSD) {
      ...DataOnSwap
    }
    lowestSwaps: swaps(first: 5, orderDirection: asc, orderBy: amountUSD) {
      ...DataOnSwap
    }
  }

  fragment DataOnSwap on Swap {
    sender
    amountUSD
    timestamp
    to
  }
`



function App() {
  const [data, setData] = useState(
    /** @type {import('./types.d.ts').Data} */
    ({
      highestSwaps: [],
      lowestSwaps: []
    }))
  
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const response = await fetch(APIURL, {method: "POST", body:JSON.stringify({
      query
    })}).then(response => response.json())
    
   const res = (/** @type {import('./types.d.ts').Req} */ (response))

   setData(res.data);
  }

  console.log({swaps: data})

  return (
    <div>
      <h1>Highest</h1>
      <ul className='swaps-list'>
      {
        data.highestSwaps.map((swap) => {
          return <SwapListItem {...swap} />
        })
      }
      </ul>
      <h1>Lowest</h1>
      <ul className='swaps-list'>
      {
        data.lowestSwaps.map((swap) => {
          return <SwapListItem {...swap} />
        })
      }
      </ul>
    </div>
  );
}

export default App;

/**
 * @param props {import('./types.d.ts').Swap}
 */
function SwapListItem({ amountUSD, sender, timestamp, to }) {
  const date = new Date(Number(timestamp) * 1000)
  
  return (
    <li>
      {date.toLocaleString('de-DE')} | {sender} sent {amountUSD} to {to}
    </li>
  )
}