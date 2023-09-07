const express = require('express');
const app = express();
const path = require('path');
const pdf = require('html-pdf-node');
const axios = require('axios');
const fs = require('fs').promises;

app.use(express.json());

const PORT = process.env.PORT || 3000;
const SENDINBLUE_API_KEY = process.env.SENDINBLUE_API_KEY;

const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f0f0;
    font-family: Arial, sans-serif;
  }
  .centered-text {
    font-size: 25px;
    text-align: center;
    margin: 40px 0; /* Add margin to the top and bottom */
  }
  .centered-text-1{
    font-size: 25px;
    text-align: center;
  }
  .centered-text-1 {
    margin-top: 0;
  }

  .centered-text-2 {
    font-size: 25px;
    text-align: center;
    margin-top: 450px ; /* Add margin to the top and bottom */
    margin-bottom: 50px;
  }

  .centered-text-3 {
    font-size: 25px;
    text-align: center;
    margin-top: 260px ; /* Add margin to the top and bottom */
    margin-bottom: 50px;
  }

  .centered-text-4 {
    font-size: 25px;
    text-align: center;
    margin-top: 60px ; /* Add margin to the top and bottom */
    margin-bottom: 40px;
  }

  .info-item {
    margin-top: 20px; /* Adjust margin for space between items */
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 90%;
    max-width: 600px;
  }
  .client-name {
    font-size: 16px;
    font-weight: bold;
    color: #000000;
  }
  .test-text {
    font-size: 16px;
    letter-spacing: 0em;
  }
  tr {
            height: 40px; /* Adjust the height as needed */
  }
  .row {
    color: #ebcf46;
    font-size: 16px;
  }

  .social-icons {
            display: flex;
            gap: 20px;
        }
 .social-icons a {
            color: #333;
            text-decoration: none;
        }
  .social-icon {
            width: 30px;
            height: 30px;
        }
</style>

<title>Centered Text Example</title>
</head>
<body>

<img src="data:image/png;base64,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" alt="Company logo" style="width: auto; height: auto; margin-bottom: 20px; margin-top: 20px;">

<div style="width: 650px; margin-top: 40px; background: ghostwhite; font-size: 20px; padding: 10px; border: 3px solid #D2B430; margin: 10px; border-radius: 30px;">
<p style="font-size: 18px; text-align: left; max-width: 650px; margin-top: 25px; margin-left: 0px;"><strong>Aapka, Naye Zamane ka Home Architect + Contractor</strong><br><br> ☑ No surprises<br> ☑ Better design & construction<br> ☑ Largest in Delhi NCR</p>
</div>
<p style="font-size: 18px; text-align: left; max-width: 650px; margin-top: 20px;">
  Here are the results from the construction cost calculators. Feel free to reach out to us at sales@prithu.in for further queries. Or call at +91 9599818105 to speak to our team. 
</p>


<div style="width: 650px;">
<div class="centered-text">
  Information Shared By You
</div>

<div class="info-item">
  <span class="client-name">Client Name:</span>
  <span class="test-text">{{test1}}</span>
</div>

<div class="info-item">
  <span class="client-name">City in which your plot is:</span>
  <span class="test-text">{{test2}}</span>
</div>

<div class="info-item">
  <span class="client-name">Size of your plot is:</span>
  <span class="test-text">{{test3}}</span>
</div>

<div class="info-item">
  <span class="client-name">Unit of plot measurement is:</span>
  <span class="test-text">{{test4}}</span>
</div>

<div class="info-item">
  <span class="client-name">Size of your plot front is:</span>
  <span class="test-text">{{test5}}</span>
</div>

<div class="info-item">
  <span class="client-name">Unit of plot front measurement is:</span>
  <span class="test-text">{{test6}}</span>
</div>

<div class="info-item">
  <span class="client-name">Number of floors you want to build:</span>
  <span class="test-text">{{test7}}</span>
</div>

<div class="info-item">
    <span class="client-name">You want to build a basement?</span>
    <span class="test-text">{{test8}}</span>
</div>
</div>

<div class="centered-text" style="margin-top: 530px;">
    Construction Cost Calculator Results
</div>

<div style="text-align: center; font-size: 18px; margin-top: 10px; max-width: 800px;">
    Design and Construction Cost for your home based on Prithu's HomeEssential scope of work and assumptions given below
</div>


<table style="border: 1px solid green; border-collapse: collapse; margin-top: 20px; table-layout: fixed; width: 800px; margin-left: 500px;margin-right: 500px;">
    <colgroup>
        <col style="width: 100px;">
        <col style="width: 250px;">
        <col style="width: 150px;">
        <col style="width: 150px;">
        <col style="width: 150px;">
    </colgroup>
    <thead>
      <tr class="row">
        <th style="border: 1px solid green; text-align: center;">S. No.</th>
        <th style="border: 1px solid green; text-align: center;">Area description</th>
        <th style="border: 1px solid green; text-align: center;">Area as per estimates</th>
        <th style="border: 1px solid green; text-align: center;">Design and Construction Rate (Rs./ sqft)</th>
        <th style="border: 1px solid green; text-align: center;">Total (Rs.)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid green; text-align: center;">1</td>
        <td style="border: 1px solid green; text-align: left;">Covered Area</td>
        <td style="border: 1px solid green; text-align: right;">{{test9}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test10}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test11}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">2</td>
        <td style="border: 1px solid green; text-align: left;">Semi-covered area</td>
        <td style="border: 1px solid green; text-align: right;">{{test12}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test13}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test14}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">3</td>
        <td style="border: 1px solid green; text-align: left;">Below ground area</td>
        <td style="border: 1px solid green; text-align: right;">{{test15}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test16}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test17}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">4</td>
        <td style="border: 1px solid green; text-align: left;">Open to sky areas</td>
        <td style="border: 1px solid green; text-align: right;">{{test18}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test19}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test20}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">5</td>
        <td style="border: 1px solid green; text-align: left;">Price</td>
        <td style="border: 1px solid green; text-align: right;">{{test21}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test22}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test23}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">6</td>
        <td style="border: 1px solid green; text-align: left;">% change in price due to high or low covered area</td>
        <td style="border: 1px solid green; text-align: right;">{{test24}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test25}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test26}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">7</td>
        <td style="border: 1px solid green; text-align: left;">Final Price</td>
        <td style="border: 1px solid green; text-align: right;">{{test27}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test28}}</td>
        <td style="border: 1px solid green; text-align: right;">{{test29}}</td>
      </tr>
    </tbody>
</table>



<!-- <div style=" justify-content: center; align-items: center; height: 50vh; padding: 0px px; margin-bottom: 0px;"> -->
    <p style="font-size: 16px; text-align: left; max-width: 800px; height: 28vh;justify-content: center; align-items: center; margin-top: 90px; margin-bottom: 0;">
        <strong>Notes:</strong><br>
        1. Above quote is inclusive of GST <br>
        2. The above areas are based on certain assumptions (given in the tablebelow) to simplify the calculation of quote. Key assumptions are regarding the full consumption of FAR, area of balconies, size of staircase & lift shaft, size of UG tank & RWH etc. Final Price will be adjusted based on the actual areas post finalization of the floor plan.<br>
        3. Compounding and post-completion certificate area has not been considered in the above areas. If the client wants them to be added to the contract, they would be done post drawing finalization since estimating the area for them is difficult without drawings. Per sqft rate for the compounding area is the same as that for the covered area.<br>
        4. Price is applicable for the linked SOW document. Anything not specifically mentioned in the SOW is not included in the price above.<br>
        5. We reserve the right to change the Price and SOW anytime without prior notice. The latest SOW and price are always available on our website. The latest SOW as of the date of agreement signing will be applicable.
    </p>
<!-- </div> -->

<div class="centered-text-1" style="margin-top: 460px;">
    Assumptions
</div>

<table style="border: 1px solid green; border-collapse: collapse; margin-top: 50px; table-layout: fixed; width: 800px;">
    <colgroup>
        <col style="width: 100px;">
        <col style="width: 400px;">
        <col style="width: 300px;">
    </colgroup>
    <thead>
      <tr class="row" style="background-color: #ebcf46; font-size: 16px;">
        <th style="border: 1px solid green; text-align: center;">S. No.</th>
        <th style="border: 1px solid green; text-align: center;">Assumptions</th>
        <th style="border: 1px solid green; text-align: center;">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid green; text-align: center;">1</td>
        <td style="border: 1px solid green; text-align: left;">Plot size in sq yds</td>
        <td style="border: 1px solid green; text-align: right;">{{test30}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">2</td>
        <td style="border: 1px solid green; text-align: left;">Plot Depth (ft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test31}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">3</td>
        <td style="border: 1px solid green; text-align: left;">Plot front in ft</td>
        <td style="border: 1px solid green; text-align: right;">{{test32}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">4</td>
        <td style="border: 1px solid green; text-align: left;">Lift shaft (sqft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test33}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">5</td>
        <td style="border: 1px solid green; text-align: left;">Staircase (sqft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test34}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">6</td>
        <td style="border: 1px solid green; text-align: left;">Front Balcony (% of plot front)</td>
        <td style="border: 1px solid green; text-align: right;">{{test35}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">7</td>
        <td style="border: 1px solid green; text-align: left;">Rear Balcony (% of plot front)</td>
        <td style="border: 1px solid green; text-align: right;">{{test36}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">8</td>
        <td style="border: 1px solid green; text-align: left;">One Side Balcony (% of plot depth)</td>
        <td style="border: 1px solid green; text-align: right;">{{test37}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">9</td>
        <td style="border: 1px solid green; text-align: left;">Second Side Balcony (% of plot depth)</td>
        <td style="border: 1px solid green; text-align: right;">{{test38}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">10</td>
        <td style="border: 1px solid green; text-align: left;">Servant Toilet on stilt (sqft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test39}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">11</td>
        <td style="border: 1px solid green; text-align: left;">Servant Toilet on terrace (sqft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test40}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">12</td>
        <td style="border: 1px solid green; text-align: left;">Guard Room (sqft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test41}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">13</td>
        <td style="border: 1px solid green; text-align: left;">Ramp in front (sqft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test42}}</td>
      </tr>
      
      <tr>
        <td style="border: 1px solid green; text-align: center;">14</td>
        <td style="border: 1px solid green; text-align: left;">U/G Water Tanks</td>
        <td style="border: 1px solid green; text-align: right;">{{test43}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">15</td>
        <td style="border: 1px solid green; text-align: left;">Rain Water Harvesting</td>
        <td style="border: 1px solid green; text-align: right;">{{test44}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">16</td>
        <td style="border: 1px solid green; text-align: left;">Balcony depth (ft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test45}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">17</td>
        <td style="border: 1px solid green; text-align: left;">Ground Floor Balcony assumed</td>
        <td style="border: 1px solid green; text-align: right;">{{test46}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">18</td>
        <td style="border: 1px solid green; text-align: left;">Other Floor Balcony assumed</td>
        <td style="border: 1px solid green; text-align: right;">{{test47}}</td>
      </tr>
      
      <tr>
        <td style="border: 1px solid green; text-align: center;">19</td>
        <td style="border: 1px solid green; text-align: left;">Sunken Courtyard</td>
        <td style="border: 1px solid green; text-align: right;">{{test48}}</td>
      </tr>
    </tbody>
</table>

<div class="centered-text-2">
    Bye-Law Assumptions
</div>

<table style="border: 1px solid green; border-collapse: collapse; margin-top: 18px; table-layout: fixed; width: 800px;">
    <colgroup>
        <col style="width: 100px;">
        <col style="width: 400px;">
        <col style="width: 300px;">
    </colgroup>
    <thead>
      <tr class="row" style="background-color: #ebcf46; font-size: 16px;">
        <th style="border: 1px solid green; text-align: center;">S. No.</th>
        <th style="border: 1px solid green; text-align: center;">Assumptions</th>
        <th style="border: 1px solid green; text-align: center;">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid green; text-align: center;">1</td>
        <td style="border: 1px solid green; text-align: left;">Total FAR</td>
        <td style="border: 1px solid green; text-align: right;">{{test49}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">2</td>
        <td style="border: 1px solid green; text-align: left;">Total FAR (sq ft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test50}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">3</td>
        <td style="border: 1px solid green; text-align: left;">Maximum Coverage</td>
        <td style="border: 1px solid green; text-align: right;">{{test51}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">4</td>
        <td style="border: 1px solid green; text-align: left;">FAR per floor (sq ft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test52}}</td>
      </tr>
    </tbody>
</table>

<div class="centered-text-4">
    Covered Area Breakdown
</div>

<table style="border: 1px solid green; border-collapse: collapse; margin-top: 20px; table-layout: fixed; width: 800px;">
    <colgroup>
        <col style="width: 100px;">
        <col style="width: 400px;">
        <col style="width: 300px;">
    </colgroup>
    <thead>
      <tr class="row" style="background-color: #ebcf46; font-size: 16px;">
        <th style="border: 1px solid green; text-align: center;">S. No.</th>
        <th style="border: 1px solid green; text-align: center;">Area description</th>
        <th style="border: 1px solid green; text-align: center;">Area as per estimates</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid green; text-align: center;">1</td>
        <td style="border: 1px solid green; text-align: left;">Stilt (lift shaft + servant toilet + staircase)</td>
        <td style="border: 1px solid green; text-align: right;">{{test53}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">2</td>
        <td style="border: 1px solid green; text-align: left;">Ground floor (FAR + lift shaft + staircase)</td>
        <td style="border: 1px solid green; text-align: right;">{{test54}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">3</td>
        <td style="border: 1px solid green; text-align: left;">First floor (FAR + lift shaft + staircase)</td>
        <td style="border: 1px solid green; text-align: right;">{{test55}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">4</td>
        <td style="border: 1px solid green; text-align: left;">Second floor (FAR + lift shaft + staircase)</td>
        <td style="border: 1px solid green; text-align: right;">{{test56}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">5</td>
        <td style="border: 1px solid green; text-align: left;">Third floor (FAR + lift shaft + staircase)</td>
        <td style="border: 1px solid green; text-align: right;">{{test57}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">6</td>
        <td style="border: 1px solid green; text-align: left;">Terrace (lift shaft + servant toilet + staircase)</td>
        <td style="border: 1px solid green; text-align: right;">{{test58}}</td>
      </tr>
    </tbody>
</table>

<div class="centered-text-4">
    Semi-Covered Area Breakdown
</div>

<table style="border: 1px solid green; border-collapse: collapse; margin-top: 20px; table-layout: fixed; width: 800px;">
    <colgroup>
        <col style="width: 100px;">
        <col style="width: 400px;">
        <col style="width: 300px;">
    </colgroup>
    <thead>
      <tr class="row" style="background-color: #ebcf46; font-size: 16px;">
        <th style="border: 1px solid green; text-align: center;">S. No.</th>
        <th style="border: 1px solid green; text-align: center;">Area description</th>
        <th style="border: 1px solid green; text-align: center;">Area as per estimates</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid green; text-align: center;">1</td>
        <td style="border: 1px solid green; text-align: left;">Balcony across floors</td>
        <td style="border: 1px solid green; text-align: right;">{{test59}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">2</td>
        <td style="border: 1px solid green; text-align: left;">Stilt (stilt slab area excluding stilt covered area)</td>
        <td style="border: 1px solid green; text-align: right;">{{test60}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">3</td>
        <td style="border: 1px solid green; text-align: left;">Sunken courtyards in basement</td>
        <td style="border: 1px solid green; text-align: right;">{{test61}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">4</td>
        <td style="border: 1px solid green; text-align: left;">Underground tank (depth of 5 ft) and RWH (as per bye-law)</td>
        <td style="border: 1px solid green; text-align: right;">{{test62}}</td>
      </tr>
    </tbody>
</table>

<div class="centered-text-3">
    Below Ground Area Breakdown
</div>

<table style="border: 1px solid green; border-collapse: collapse; margin-top: 20px; table-layout: fixed; width: 800px;">
    <colgroup>
        <col style="width: 100px;">
        <col style="width: 400px;">
        <col style="width: 300px;">
    </colgroup>
    <thead>
      <tr class="row" style="background-color: #ebcf46; font-size: 16px;">
        <th style="border: 1px solid green; text-align: center;">S. No.</th>
        <th style="border: 1px solid green; text-align: center;">Area description</th>
        <th style="border: 1px solid green; text-align: center;">Area as per estimates</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid green; text-align: center;">1</td>
        <td style="border: 1px solid green; text-align: left;">Basement (Includes staircase & lift shaft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test63}}</td>
      </tr>
    </tbody>
</table>

<div class="centered-text-4">
    Open to Sky Area Breakdown
</div>

<table style="border: 1px solid green; border-collapse: collapse; margin-top: 20px; table-layout: fixed; width: 800px;">
    <colgroup>
        <col style="width: 100px;">
        <col style="width: 400px;">
        <col style="width: 300px;">
    </colgroup>
    <thead>
      <tr class="row" style="background-color: #ebcf46; font-size: 16px;">
        <th style="border: 1px solid green; text-align: center;">S. No.</th>
        <th style="border: 1px solid green; text-align: center;">Area description</th>
        <th style="border: 1px solid green; text-align: center;">Area as per estimates</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid green; text-align: center;">1</td>
        <td style="border: 1px solid green; text-align: left;">Plot setbacks (front, side, back), Ramp outside gate</td>
        <td style="border: 1px solid green; text-align: right;">{{test64}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">2</td>
        <td style="border: 1px solid green; text-align: left;">Terrace (excluding staircase, lift shaft)</td>
        <td style="border: 1px solid green; text-align: right;">{{test65}}</td>
      </tr>
      <tr>
        <td style="border: 1px solid green; text-align: center;">3</td>
        <td style="border: 1px solid green; text-align: left;">Chajjas anywhere/Special areas</td>
        <td style="border: 1px solid green; text-align: right;">{{test66}}</td>
      </tr>
    </tbody>
</table>

<p style="font-size: 16px; text-align: center; max-width: 800px; margin-top: 50px;">
  Are you planning to build floors or a villa on your residential plot? Please email at <a href="mailto:sales@prithu.in">sales@prithu.in</a> to schedule a meeting with us.
</p>



<div class="social-icons" style = "margin-top: 50px;">
  <a href="https://www.instagram.com/prithuhomes" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 448 512"><style>svg{fill:#8e8f90}</style><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>

  </a>
  <a href="https://www.facebook.com/Prithuhomes" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 512 512"><style>svg{fill:#858585}</style><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"/></svg>
  </a>
  <a href="https://www.linkedin.com/company/prithuhomes/mycompany/" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 448 512"><style>svg{fill:#97989b}</style><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>
  </a>
  <a href="https://www.youtube.com/channel/UCwrFdS_FUxScUaSStDv11-A" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 576 512"><style>svg{fill:#8c8c8c}</style><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/></svg>
  </a>
  <a href="https://pin.it/54F8gK6" target="_blank">
    <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 496 512"><style>svg{fill:#aeafb2}</style><path d="M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-29.5 20.5-61.3 20.5-82.6 0-19-10.2-34.9-31.4-34.9-24.9 0-44.9 25.7-44.9 60.2 0 22 7.4 36.8 7.4 36.8s-24.5 103.8-29 123.2c-5 21.4-3 51.6-.9 71.2C65.4 450.9 0 361.1 0 256 0 119 111 8 248 8s248 111 248 248z"/></svg>
  </a>
</div>

<img src="data:image/webp;base64,UklGRiQHAABXRUJQVlA4IBgHAABwKQCdASpoAWQAPp1Kn0wlpCKiJDJKsLATiWNu4XCA75iHqu4MzXiI26/936m9uz5jPNf9IPQyep7/Vf8l7AHS7f5bJh9zGIa6feXKu/a+b/2L1sLHfKjbb9p/xm2/af8Ztt563VDQqHdmRSPgzbSHiN68jFwn8bl5GDTi7OrgIvNp/x2Uf+M23/geDy/z6/WZxie0FYxGeje3Ots6rg8wHd4bnmNUhFoV1q5GT0z/VIMyPH7hHcu9g8Ozo/VJB8JGzh+Rsn0Cuv6/GRcoxEiQoKY6UfHzCNX9UtzwqsKV3O7tB8MJPkjnFpvAFalL1zokoXUS9G5Czd6xJVq0mPGUcmGT4uZFF40zM5oLNdjvtP1ChqN+r0Ur9m6lLi2imr0mRpUdLRTANUa2NTshINdu7GjLJR487RH1SKbvu3o0Gwk1wITNt+4lg82n/Yf5R2s9T1cAAP7+xFgADKxEDdwJw1em/pidrXtXwTibl6K52hoERpOtbi4MAbMjc3094Z/JIu3Fvxbi28/FlRVHWe2hgXiVx83YjiXyAAACP7N1ZaNmC4G3OMh+SjYeMyBXCwOkSbxmn1KkY4XgzrUiBiZXJvjeYrE7G57izJ/rve8jjiOjF+ouNo+Dq9+BpY7zYg/zoFC9f0NfJ47hVYdTx2k50AAPjtjPJNU0WBaNkaO/6H8ZPLPE44cMDb7I8Qb+D5S8wOED/JVPMSDWpNOlucLVpFQievUKDKxEOUNjiW9g8FxtuB/TB6u4BYQrQJCZi/jzfgLI5uZobCSsyb/A/CvpEJKY1q8QMIvsWjYlHUwyqh5ehWBl1jdbL9qgTA7wt7PUfCicBlwHRt5UxPzude8nEzZfrdiZsDIAT3D+8IVyJfQUMT2U1f/fpep/5HUC5xNJk/l5sC7OjzCOXJfZyl20Qh2cvTMnPiVz8OtYXWOg47KUg3WACnzVtNzTT8j3XGpDPDA8/N4X/cpitxFJqLg/D59tAPNMrraSdBOfCjTHeyb9BLohLdng0VO4M68ghjTyHJ07OPtYV6qPFNCSV/5k3asgxNj4Zb+v4rK3+qmqW7ZTzmb6UOHuct7xBH6Hlhqq5ejN58NFHuPLnWLt8I/hFUkGPewbCLTZBFU6ojeNXl0LGKrV775jI1Z5uxpTUHCJBLgf9Nq9VGNnEUYBiy9MUCB7R8EyWz+BLJY4M4eaZiqrcQPm/zcsiF9VjzHohXuymqbcPpm4UKzXiEQtQoT5cLE7e9y+CSARsKZ4QhM0JNonKcjD34fbS7qoDYpqp62dxC5dqWVw3IuR5Kr60cSRPi7q0XJQyNWTGMdlf5fLgMrdAGqb64YlHRxovviOWuEcFGFpZitQaZKzd/7HeODnC1GY4bDIzDIA6SNJI1oDE5L/xhUB5WtrboTwEPdYFHK2/HgsNW7Uo66asQS4gj2Cj4Rttn7wXGDEG4jwuS/Tmd9qJaQJEjZgPLq37qX3vUge2XWRNQoPJKJgs3h8C81FG6nsRQuqI/+9YR+2jvivQb2bweEvJYTXWMY807tssd9IO9WznoBDPkf7O/H5/iWcz3kIySgK+XjyTvzJlY64cl5ptyy62hXy804dmM7nEsLxMT41nSyeCoi7ZcyhZ2QTNbvB6HC/TE3xdFSdPKRAoXh58MCoD3s+Rv1cO6UXTIMSnZkE4gRCjIYqfTgHR992lgx7V/KA/PqF2g58M/6aaJ0tE7VW4foLCY3ou+DnMLXABBLR4CH3/+dRtgf6Gc/XuzjCpzRe661rstkh+KuGaybQm2yJ1FZrQHHGbgxesphofJ8DbuvdtIDN5vuxqMgXWaTekSw7KCcLFSc5PazNsrqKEqnADlqr9nSCLHVxeaOvy3y23s42v/DRLKInj1RWT6wF0WsBrq2KSpfptriJkZHonJs2wsQHcTVo12MHa0GBzt09oVDACFfM3VGdVGx3IrHngrXUobAecgThG7hs4lNMrLjH53l+8K55GPzvXTzhwbKt1MWax+BpfsE1TTBxk/FcC6QM/lK+d3P0JdV5QgvMFkafpBZw/N+7b25A5Xm09Gug+zyOiP3i4hpJWgU6vubgAHp/3mE3oLSEQ3WamZxa3hG55G295CVvRFcIpu/G/OdHK0XbwCJx3YunsKbX6ENUQVvQX0hyyGOiu/7FW+NrUKaZn4n3xRSssjmP4x7/0KGboolH2LsbcrmdCG3le94Y10UzbTEvnY8oFQzEubJFC9VWxsUgL7vAXbCIvKFJa3eBpxg0/pUbKTtiZ+C6q7sUm71NAC20VgvRsMaqWLLyb2AI6Ug1FJtapykyVKyenw4tC/KoF4dlLXSy2aNgyoKtx3PWhKhJZKf78k2WXQhb0yFi/b6xY5EdTGGEtEb+8qrG2ACDPyYbg8tbM/cMD8IHAbnu1rfbfGQ2pt9txMAAC0QAAAAA" alt="Footer" style="width: 300px; height: 50px; display: block; margin-left: auto; margin-right: auto; margin-top: 50px;" >

<footer>
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA9IAAABgCAYAAADxeUo9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJTSURBVHhe7dexAYAwDMCwlP9/hg4cEO/S4ht83msAAACAlecvAAAAsGCkAQAAIDDSAAAAEBhpAAAACIw0AAAABEYaAAAAAiMNAAAAgZEGAACAwEgDAABAYKQBAAAgMNIAAAAQGGkAAAAIjDQAAAAERhoAAAACIw0AAACBkQYAAIDASAMAAEBgpAEAACAw0gAAABAYaQAAAAiMNAAAAARGGgAAAAIjDQAAAIGRBgAAgMBIAwAAQGCkAQAAIDDSAAAAEBhpAAAACIw0AAAABEYaAAAAAiMNAAAAgZEGAACAwEgDAABAYKQBAAAgMNIAAAAQGGkAAAAIjDQAAAAERhoAAAACIw0AAACBkQYAAIDASAMAAEBgpAEAACAw0gAAABAYaQAAAAiMNAAAAARGGgAAAAIjDQAAAIGRBgAAgMBIAwAAQGCkAQAAIDDSAAAAEBhpAAAACIw0AAAABEYaAAAAAiMNAAAAgZEGAACAwEgDAABAYKQBAAAgMNIAAAAQGGkAAAAIjDQAAAAERhoAAAACIw0AAACBkQYAAIDASAMAAEBgpAEAACAw0gAAABAYaQAAAAiMNAAAAARGGgAAAAIjDQAAAIGRBgAAgMBIAwAAQGCkAQAAIDDSAAAAEBhpAAAACIw0AAAABEYaAAAAAiMNAAAAgZEGAACAwEgDAABAYKQBAAAgMNIAAAAQGGkAAAAIjDQAAAAERhoAAAACIw0AAACBkQYAAIDASAMAAEBgpAEAACAw0gAAABAYaQAAAAiMNAAAAARGGgAAAAIjDQAAAGszH/8XBLzXl9kEAAAAAElFTkSuQmCC" alt="Footer" style="width: 1100px; height: 80px; display: block; margin-left: auto; margin-right: auto; margin-top: 40px;" >
</footer>

</body>
</html>


`;

app.post('/generate-pdf-email', async (req, res) => {
  try {
    const {test1, test2, test3, test4, test5, test6, test7, test8, test9, test10, test11, test12, test13, test14, test15, test16, test17, test18, test19, test20, test21, test22, test23, test24, test25, test26, test27, test28, test29, test30, test31, test32, test33, test34, test35, test36, test37, test38, test39, test40, test41, test42, test43, test44, test45, test46, test47, test48, test49, test50, test51, test52, test53, test54, test55, test56, test57, test58, test59, test60, test61, test62, test63, test64, test65, test66, recipientEmail } = req.body;
    

  

    // Read the HTML template file
    //const htmlTemplate = await readFileAsync(path.join(__dirname, 'index.html'), 'utf8');

    // Replace placeholders in the HTML template with actual data
    const populatedHtml = populateTemplate(htmlTemplate, { test1, test2, test3, test4, test5, test6, test7, test8, test9, test10, test11, test12, test13, test14, test15, test16, test17, test18, test19, test20, test21, test22, test23, test24, test25, test26, test27, test28, test29, test30, test31, test32, test33, test34, test35, test36, test37, test38, test39, test40, test41, test42, test43, test44, test45, test46, test47, test48, test49, test50, test51, test52, test53, test54, test55, test56, test57, test58, test59, test60, test61, test62, test63, test64, test65, test66, recipientEmail });

    // Generate PDF
    const pdfBuffer = await pdf.generatePdf({
      content: populatedHtml,
    }, {
      format: 'A4',
      path: 'report.pdf',
    });

    // Sender and recipient details
    const senderName = 'Pushkar Thakur';
    const senderEmail = 'thaturpushkar99@gmail.com';
    const subject = 'Calculator results for home construction';

    // Send the PDF as an email attachment using SendinBlue API
    const response = await axios.post(
      'https://api.sendinblue.com/v3/smtp/email',
      {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipientEmail }],
        subject: subject,
        htmlContent: `<html>
        <head>
          <style>
            /* Remove margin and padding for <p> elements */
            p {
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body>
        <p>Greetings,</p>
        <p style = "margin-top:0px;">Thank you for using our calculator. The result copy for construction cost calculator is attached to this email.</p><br>
        <p><strong>Aapka, Naye Zamane ka Architect & Contractor.</strong></p>
        <p>☑ No surprises</p>
        <p>☑ Better design & construction</p> 
        <p>☑ Largest in Delhi NCR</p><br>
        <p>Visit our <a href="https://www.prithu.in/">website</a> to know more about how homes built by Prithu will be better for you.</p><br>
        <p><strong>Services offered by Prithu:</strong></p>
        <p><a href="https://www.prithu.in/turnkey-home-design-and-construction-in-delhi-ncr">Turnkey Service</a> | <a href="https://www.prithu.in/plot-collaboration-delhi">Plot Collaboration</a> | <a href="https://www.prithu.in/buy-floors">Buy Floor</a></p><br>
        <p><strong>See Our Projects:</strong></p>
        <p><a href="https://www.prithu.in/villas">Villa Projects</a> | <a href="https://www.prithu.in/duplex-simplex-combo">Simplex Duplex combos</a> | <a href="https://www.prithu.in/independent-floors">Builder floors</a></p><br>
        <p>See how you can <a href="https://www.youtube.com/watch?v=gn7etKcwv3U&list=TLGGOQpGyW3Vk8QwMTA5MjAyMw&t=85s&ab_channel=PrithuHomes">save money with Prithu</a></p>
        <p><a href="https://www.prithu.in/blog">What's New</a> at Prithu</p><br>
        <p>Best Regards,</p>
        <p>Prithu Homes</p><br>
        <p>15D, Atma Ram House,</p>
        <p>1 Tolstoy Marg, Barakhamba Rd,</p>
        <p>110001, Delhi</p>
        </body>
        </html>`,
        attachment: [
          {
            content: pdfBuffer.toString('base64'),
            name: 'report.pdf',
          },
        ],
      },
      {
        headers: {
          'api-key': SENDINBLUE_API_KEY,
        },
      }
    );

    console.log('Email sent:', response.data);

    res.send('PDF generated and email sent successfully.');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Utility function to read a file asynchronously
async function readFileAsync(filePath, encoding) {
  try {
    const data = await fs.readFile(filePath, encoding);
    return data;
  } catch (error) {
    throw error;
  }
}

// Utility function to populate placeholders in the HTML template
function populateTemplate(template, data) {
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), data[key]);
    }
  }
  return template;
}


module.exports = app
