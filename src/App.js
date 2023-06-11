// @ts-check
import './App.css';
import React, { useEffect, useState } from 'react'
import Plotly from 'plotly.js-dist'

const APIURL = "https://gateway.thegraph.com/api/d3dd46dedd6bd87177046327502db49a/subgraphs/id/D7azkFFPFT5H8i32ApXLr34UQyBfxDAfKoCEK4M832M6"
const SUBGRAPH_NAME = "`Sushi - Mainnet Exchange`"

// exclude 0 amounts and amounts higher than 5 milion
const query = `
  query {
    highestSwaps: swaps(where: {amountUSD_lt: "5000000"}, first: 1000, orderDirection: desc, orderBy: amountUSD) {
      ...DataOnSwap
    }
    lowestSwaps: swaps(where: {amountUSD_gt: "0"}, first: 500, orderDirection: asc, orderBy: amountUSD) {
      ...DataOnSwap
    }
    newSwaps: swaps(where: { amountUSD_gt: "0" }, first: 50, orderDirection: desc, orderBy: timestamp) {
      ...DataOnSwap
    }
  }
  fragment DataOnSwap on Swap {
    sender
    amountUSD
    timestamp
    to
  }
`;
// const query2 = `
//   query {
//     newSwaps: swaps(
//       where: { amountUSD_gt: "0" }
//       first: 10
//       orderDirection: desc
//       orderBy: transaction__blockNumber
//     ) {
//       id
//       amountUSD
//       sender
//       timestamp
//     }
//   }
// `;


function App() {
  const [data, setData] = useState({
    highestSwaps: [],
    lowestSwaps: [],
    newSwaps: []
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
    const newSwaps = result.data.newSwaps.map(swap => swap.sender);

    // const response2 = await fetch(APIURL, { method: "POST", body: JSON.stringify({ query2 }) });
    // const result2_temp = await response2.json();
    // const result2 = result2_temp


    
  
    setData({ highestSwaps, lowestSwaps, newSwaps });
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
      title: 'Histogram of Swap Extrema',
      xaxis: {
        title: 'Swap Amounts (USD)',
        range: [Math.min(...data.lowestSwaps)-1000, Math.max(...data.highestSwaps)], // Adjust x-axis range based on lowest and highest swap values
        // type: 'log', // Set x-axis scale to log
      },
      yaxis: {
        title: 'Frequency',
      },
      barmode: 'overlay', // Overlay the histograms
      bargap: 0.0, // Gap between bars
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
      title: 'Histogram of Highest Swaps (< 5M USD)',
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
      title: 'Histogram of Lowest Swaps (> 0 USD)',
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

  useEffect(() => {
    // Create the line chart for lowest swaps
    if (data.lowestSwaps.length === 0) {
      return; // Skip if data is not available yet
    }
  
    const trace1 = {
      x: data.lowestSwaps.map((_, index) => index + 1), // Use the index as x values for the line chart
      y: data.lowestSwaps,
      type: 'scatter',
      mode: 'lines',
      name: 'Lowest Swaps',
      line: {
        color: 'red',
      },
    };
  
    const layout = {
      title: 'Line Chart of Lowest Swaps',
      xaxis: {
        title: 'Swap Index',
      },
      yaxis: {
        title: 'Swap Amounts (USD)',
      },
    };
  
    const config = { responsive: true };
  
    Plotly.newPlot('lowestSwapsChart2', [trace1], layout, config);
  }, [data.lowestSwaps]);

  console.log({ swaps: data });

  return (
    <div>
      <h1>The Graph - Subgraph analysis of: {SUBGRAPH_NAME}</h1>
      <style>
        {`.swaps-list {
          word-wrap: break-word;
        }`}
      </style>
      <script src="https://cdn.plot.ly/plotly-2.24.1.min.js"></script>
      
      <div className='swaps-list'>
        <h2>Highest Swaps</h2>
        <div id="highestSwapsChart"></div>
      </div>

      <div className='swaps-list'>
        <h2>Lowest Swaps</h2>
        <div id="lowestSwapsChart"></div>
      </div>

      <div className='swaps-list'>
        <h2>Lowest Swaps</h2>
        <div id="lowestSwapsChart2"></div>
      </div>

      
      <div className='swaps-list'>
        <h2></h2>
        <div id="myDiv"></div>
      </div>
      

      <div className='swaps-list'>
      <h2>Additional raw data</h2>
        <h3>Wallets of last swaps</h3>
        {JSON.stringify(data.newSwaps)}
        <h3>Lowest Swap Amounts</h3>
        <div>{JSON.stringify(data.lowestSwaps)}</div>
        <h3>Highest Swap Amounts</h3>
        <div>{JSON.stringify(data.highestSwaps)}</div>
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
