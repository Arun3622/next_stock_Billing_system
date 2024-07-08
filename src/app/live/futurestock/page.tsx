"use client";
import { useEffect, useState, useRef } from "react";
import { Grid, Typography, TextField, Button, Box } from "@mui/material";
import protobuf from "protobufjs";
interface StockData {
  id: string;
  price: number;
}

const stockNames = [
  "RELIANCE.NS",
  "TCS.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  "BHARTIARTL.NS",
  "SBIN.NS",
  "INFY.NS",
  "LICI.NS",
  "ITC.NS",
  "HINDUNILVR.NS",
  "LT.NS",
  "BAJFINANCE.NS",
  "HCLTECH.NS",
  "MARUTI.NS",
  "SUNPHARMA.NS",
  "ADANIENT.NS",
  "KOTAKBANK.NS",
  "TITAN.NS",
  "ONGC.NS",
  "TATAMOTORS.NS",
  "NTPC.NS",
  "AXISBANK.NS",
  "DMART.NS",
  "ADANIGREEN.NS",
  "ADANIPORTS.NS",
  "ULTRACEMCO.NS",
  "ASIANPAINT.NS",
  "COALINDIA.NS",
  "BAJAJFINSV.NS",
  "BAJAJ-AUTO.NS",
  "POWERGRID.NS",
  "NESTLEIND.NS",
  "WIPRO.NS",
  "M&M.NS",
  "IOC.NS",
  "JIOFIN.NS",
  "HAL.NS",
  "DLF.NS",
  "ADANIPOWER.NS",
  "JSWSTEEL.NS",
  "TATASTEEL.NS",
  "SIEMENS.NS",
  "IRFC.NS",
  "VBL.NS",
  "ZOMATO.NS",
  "PIDILITIND.NS",
  "GRASIM.NS",
  "SBILIFE.NS",
  "BEL.NS",
  "LTIM.NS",
  "TRENT.NS",
  "PNB.NS",
  "INDIGO.NS",
  "BANKBARODA.NS",
  "HDFCLIFE.NS",
  "ABB.NS",
  "BPCL.NS",
  "PFC.NS",
  "GODREJCP.NS",
  "TATAPOWER.NS",
  "HINDALCO.NS",
  "HINDZINC.NS",
  "TECHM.NS",
  "AMBUJACEM.NS",
  "INDUSINDBK.NS",
  "CIPLA.NS",
  "GAIL.NS",
  "RECLTD.NS",
  "BRITANNIA.NS",
  "UNIONBANK.NS",
  "ADANIENSOL.NS",
  "IOB.NS",
  "LODHA.NS",
  "EICHERMOT.NS",
  "CANBK.NS",
  "TATACONSUM.NS",
  "DRREDDY.NS",
  "TVSMOTOR.NS",
  "ZYDUSLIFE.NS",
  "ATGL.NS",
  "VEDL.NS",
  "CHOLAFIN.NS",
  "HAVELLS.NS",
  "HEROMOTOCO.NS",
  "DABUR.NS",
  "SHREECEM.NS",
  "MANKIND.NS",
  "BAJAJHLDNG.NS",
  "DIVISLAB.NS",
  "APOLLOHOSP.NS",
  "NHPC.NS",
  "SHRIRAMFIN.NS",
  "BOSCHLTD.NS",
  "TORNTPHARM.NS",
  "ICICIPRULI.NS",
  "IDBI.NS",
  "JSWENERGY.NS",
  "JINDALSTEL.NS",
  "BHEL.NS",
  "INDHOTEL.NS",
  "CUMMINSIND.NS",
  "ICICIGI.NS",
];

export default function Live() {
  const [currentStocks, setCurrentStocks] = useState<Record<string, StockData>>({});
  const previousStocks = useRef<Record<string, StockData>>({});
  const [marketOpen, setMarketOpen] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [highlightedStock, setHighlightedStock] = useState("");

  useEffect(() => {
    const ws = new WebSocket("wss://streamer.finance.yahoo.com");
    protobuf.load("./YPricingData.proto", (error, root) => {
      if (error || !root) {
        console.error("Failed to load protobuf:", error);
        return;
      }
      const Yaticker = root.lookupType("yaticker");
      ws.onopen = function open() {
        console.log("connected");
        ws.send(JSON.stringify({ subscribe: stockNames }));
      };
      ws.onclose = function close() {
        console.log("disconnected");
      };
      ws.onmessage = function incoming(message) {
        console.log("incoming message");
        const decodedMessage = Yaticker.decode(new Buffer(message.data, "base64"));
        const next = decodedMessage as unknown as StockData;
        setCurrentStocks((prevStocks) => {
          const newStocks = { ...prevStocks, [next.id]: next };
          previousStocks.current[next.id] = prevStocks[next.id];
          return newStocks;
        });
        previousStocks.current[next.id] = currentStocks[next.id];
      };
      return () => {
        ws.close();
      };
    });

    const checkMarketStatus = () => {
      const now = new Date();
      const marketCloseTime = new Date();
      marketCloseTime.setHours(15, 30, 0); // Market closes at 3:30 PM
      setMarketOpen(now <= marketCloseTime);
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 6000); // Check every minute
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    if (value) {
      const filteredResults = stockNames.filter((stock) =>
        stock.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const stockSymbol = searchInput.toUpperCase();
    if (stockNames.includes(stockSymbol)) {
      if (!currentStocks[stockSymbol]) {
        alert(`${stockSymbol} is not available at the moment.`);
      } else {
        setHighlightedStock(stockSymbol);
      }
    } else {
      alert(`${stockSymbol} is not a valid stock symbol.`);
    }
    setSearchInput("");
    setSearchResults([]);
  };

  const moveStockToTop = (stockId: string) => {
    const filteredStocks = stockNames.filter((stock) => stock !== stockId);
    return [stockId, ...filteredStocks];
  };

  return (
    <Box sx={{ backgroundColor: '#000000', minHeight: '100vh', padding: '20px' }}>
      <Typography variant="h4" sx={{ textAlign: "center", color: "#ffffff" }}>
        {marketOpen ? "Market is open ❤️" : "Market is closed 💔"}
      </Typography>
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, py: 2 }}>
        <TextField
          id="search-input"
          label="Enter stock symbol"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ width: '300px', color: "#ffffff" }}
        />
        <Button type="submit" variant="contained">
          Search
        </Button>
      </Box>
      <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
        {moveStockToTop(highlightedStock).map((stockId) => {
          const currentPrice = currentStocks[stockId]?.price || 0;
          const previousPrice = previousStocks.current[stockId]?.price || 0;
          const isPriceIncreased = previousPrice && currentPrice > previousPrice;
          const isPriceDecreased = previousPrice && currentPrice < previousPrice;

          return (
            <Grid item xs={6} sm={4} md={3} lg={2} key={stockId}>
              <Box
                className="MuiBox-root mui-n5kbcb" // Universal selector for all MuiBox-root
                sx={{
                  padding: 2,
                  border: "1px solid #ffffff", // White outline
                  borderRadius: 5,
                  textAlign: "center",
                  backgroundColor: stockId === highlightedStock ? "#ffffff" : "#000000", // Black inside
                  boxShadow: stockId === highlightedStock ? "0 4px 8px rgba(0, 0, 0, 0.2)" : "none",
                  color: "#ffffff", // White text color
                  cursor: "pointer"
                }}
                onClick={() => setHighlightedStock(stockId)}
              >
                <Typography variant="h6" sx={{ color: "#ffffff" }}>{stockId}</Typography>
                <Typography sx={{ color: "#ffffff" }}>{currentPrice.toFixed(2)}</Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
