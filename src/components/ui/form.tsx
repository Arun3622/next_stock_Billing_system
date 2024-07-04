"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import "../../app/globals.css";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Grid,
  FormControl,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";

interface FormData {
  username: string;
  date: Dayjs;
  item: string;
  expiry: Dayjs | null;
  lotsize: string;
  numberlot: string;
  buyqty: number;
  sellqty: string;
  sellprice: string;
  buyprice: string;
}

const Form: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    date: dayjs(),
    item: "",
    expiry: null,
    lotsize: "",
    numberlot: "",
    buyqty: 0,
    sellqty: "",
    sellprice: "",
    buyprice: "",
  });

  useEffect(() => {
    const lotsize = parseFloat(formData.lotsize) || 0;
    const numberlot = parseFloat(formData.numberlot) || 0;
    setFormData((prevData) => ({
      ...prevData,
      buyqty: lotsize * numberlot,
    }));
  }, [formData.lotsize, formData.numberlot]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const requiredFields: (keyof FormData)[] = [
      "username",
      "date",
      "item",
      "expiry",
      "lotsize",
      "numberlot",
      "buyqty",
      "buyprice",
    ];

    for (let key of requiredFields) {
      if (formData[key] === "" || formData[key] === null) {
        alert(`Please fill out the ${key} field.`);
        return;
      }
    }

    const dataToSubmit = {
      ...formData,
      date: formData.date.format("YYYY-MM-DD"),
      expiry: formData.expiry?.format("YYYY-MM-DD") || null,
      lotsize: parseFloat(formData.lotsize),
      numberlot: parseFloat(formData.numberlot),
      buyprice: parseFloat(formData.buyprice),
      sellqty: formData.sellqty === "" ? 0 : parseFloat(formData.sellqty),
      sellprice: formData.sellprice === "" ? 0 : parseFloat(formData.sellprice),
    };

    const response = await fetch("/api/savetrade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSubmit),
    });

    if (response.ok) {
      alert("Form submitted successfully");
    } else {
      alert("Failed to submit the form");
    }
  };

  // Function to get the last Thursday of the month
  const getLastThursdayOfMonth = (date: Dayjs): Dayjs => {
    const endOfMonth = date.endOf("month");
    let lastThursday = endOfMonth.subtract(1, "week").day(4); // Set to Thursday of the last week of the month
    if (lastThursday.isAfter(endOfMonth)) {
      lastThursday = endOfMonth.subtract(1, "week").day(4); // Adjust to the previous Thursday if needed
    }
    return lastThursday;
  };

  useEffect(() => {
    if (formData.date) {
      const expiryDate = getLastThursdayOfMonth(formData.date);
      setFormData((prevData) => ({ ...prevData, expiry: expiryDate }));
    }
  }, [formData.date]);

  return (
    <Box sx={{ display: "flex", width: "100%", justifyContent: "center" }}>
      <Box maxWidth={"md"}>
        <Card elevation={4}>
          <CardHeader title="Trading details" />
          <CardContent>
            <Box component={"form"} onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <DatePicker
                      label="Date"
                      value={formData.date}
                      onChange={(date) =>
                        setFormData((prevData) => ({ ...prevData, date: date as Dayjs }))
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Item"
                    name="item"
                    type="text"
                    value={formData.item}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <DatePicker
                      label="Expiry (Last Thursday of the Month)"
                      value={formData.expiry}
                      onChange={(date) =>
                        setFormData((prevData) => ({ ...prevData, expiry: date as Dayjs }))
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lot size"
                    name="lotsize"
                    type="number"
                    value={formData.lotsize}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="No of lot"
                    name="numberlot"
                    type="number"
                    value={formData.numberlot}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Buy quantity"
                    name="buyqty"
                    type="number"
                    value={formData.buyqty}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Buy price"
                    name="buyprice"
                    type="number"
                    value={formData.buyprice}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sell quantity"
                    name="sellqty"
                    type="number"
                    value={formData.sellqty}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sell price"
                    name="sellprice"
                    type="number"
                    value={formData.sellprice}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
              <Box sx={{ pt: 2, display: "flex", width: "100%", justifyContent: "center" }}>
                <Button className="submit" type="submit" variant="contained" color="success">
                  Submit
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Form;
