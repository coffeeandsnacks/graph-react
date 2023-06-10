// @ts-check
import './App.css';
import React, { useEffect, useState } from 'react'
import Plotly from 'plotly.js-dist'

const APIURL = "https://gateway.thegraph.com/api/d3dd46dedd6bd87177046327502db49a/subgraphs/id/D7azkFFPFT5H8i32ApXLr34UQyBfxDAfKoCEK4M832M6"

const query = `
  query {
    highestSwaps: swaps(first: 1000, orderDirection: desc, orderBy: amountUSD) {
      ...DataOnSwap
    }
    lowestSwaps: swaps(first: 1000, orderDirection: asc, orderBy: amountUSD) {
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
  const [data, setData] = useState({
    highestSwaps: [],
    lowestSwaps: []
  });

  useEffect(() => {
    // Fetch data when the component mounts
    fetchData();
  }, []);

  async function fetchData() {
    const response = await fetch(APIURL, { method: "POST", body: JSON.stringify({ query }) });
    const result = await response.json();
  
    const highestSwaps = result.data.highestSwaps.map(swap => parseFloat(swap.amountUSD));
    const lowestSwaps = result.data.lowestSwaps.map(swap => parseFloat(swap.amountUSD));
  
    setData({ highestSwaps, lowestSwaps });
  }

  useEffect(() => {
    // Create the total histogram chart when data changes
    if (data.highestSwaps.length === 0 && data.lowestSwaps.length === 0) {
      return; // Skip if data is not available yet
    }
  
    const trace1 = {
      x: data.highestSwaps,
      type: 'histogram',
      name: 'Highest Swaps',
      opacity: 0.7,
      marker: {
        color: 'green',
      },
    };
  
    const trace2 = {
      x: data.lowestSwaps,
      type: 'histogram',
      name: 'Lowest Swaps',
      opacity: 0.7,
      marker: {
        color: 'red',
      },
    };
  
    const layout = {
      title: 'Histogram of Swap Amounts',
      xaxis: {
        title: 'Swap Amounts (USD)',
      },
      yaxis: {
        title: 'Frequency',
      },
      barmode: 'overlay', // Overlay the histograms
      bargap: 0.1, // Gap between bars
      bargroupgap: 0.2, // Gap between histogram groups
    };
  
    const config = { responsive: true };
  
    Plotly.newPlot('myDiv', [trace1, trace2], layout, config);
  }, [data]);


  useEffect(() => {
    // Create the histogram chart for highest swaps
    if (data.highestSwaps.length === 0) {
      return; // Skip if data is not available yet
    }
  
    const trace1 = {
      x: data.highestSwaps,
      type: 'histogram',
      name: 'Highest Swaps',
      opacity: 0.7,
      marker: {
        color: 'green',
      },
    };
  
    const layout = {
      title: 'Histogram of Highest Swaps',
      xaxis: {
        title: 'Swap Amounts (USD)',
      },
      yaxis: {
        title: 'Frequency',
      },
      barmode: 'overlay', // Overlay the histograms
      bargap: 0.1, // Gap between bars
      bargroupgap: 0.2, // Gap between histogram groups
    };
  
    const config = { responsive: true };
  
    Plotly.newPlot('highestSwapsChart', [trace1], layout, config);
  }, [data.highestSwaps]);
  
  useEffect(() => {
    // Create the histogram chart for lowest swaps
    if (data.lowestSwaps.length === 0) {
      return; // Skip if data is not available yet
    }
  
    const trace1 = {
      x: data.lowestSwaps,
      type: 'histogram',
      name: 'Lowest Swaps',
      opacity: 0.7,
      marker: {
        color: 'red',
      },
    };
  
    const layout = {
      title: 'Histogram of Lowest Swaps',
      xaxis: {
        title: 'Swap Amounts (USD)',
      },
      yaxis: {
        title: 'Frequency',
      },
      barmode: 'overlay', // Overlay the histograms
      bargap: 0.1, // Gap between bars
      bargroupgap: 0.2, // Gap between histogram groups
    };
  
    const config = { responsive: true };
  
    Plotly.newPlot('lowestSwapsChart', [trace1], layout, config);
  }, [data.lowestSwaps]);

  console.log({ swaps: data });

  return (
    <div>
      <style>
        {`.swaps-list {
          word-wrap: break-word;
        }`}
      </style>
      <script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
      <div id="myDiv"></div>

      <h1>Highest</h1>
      <div className='swaps-list'>
        <h2>Highest Swaps</h2>
        <div id="highestSwapsChart"></div>
        <h2>All Highest Swaps</h2>
        <div>{JSON.stringify(data.highestSwaps)}</div>
        <h2>Accounts of Highest Swaps</h2>
      </div>

      <h1>Lowest</h1>
      <div className='swaps-list'>
        <h2>Lowest Swaps</h2>
        <div id="lowestSwapsChart"></div>
        <h2>All Lowest Swaps</h2>
        <div>{JSON.stringify(data.lowestSwaps)}</div>
      </div>
    </div>
  );
}

export default App;

/**
 * @param props {import('./types.d.ts').Swap}
 */
// function SwapListItem({ amountUSD, sender, timestamp, to }) {
//   const date = new Date(Number(timestamp) * 1000);
//   return (
//     <li>
//       {date.toLocaleString('de-DE')} | {sender} sent {amountUSD} to {to}
//     </li>
//   );
// }
