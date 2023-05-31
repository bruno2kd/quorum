# Quorum Coding Challenge

Working with Legislative Data

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```
Initial files should be named "bills.csv", "legislators.csv", "vote_results.csv", and "votes.csv". They should be in the folder data/

after running ```npm start``` the generated csv files will be in the folder results/


# Answers:

1. Since the operation is related to reading CSV files, and performing iterations over the rows in the files, the time complexity is directly proportional to the number of rows in the CSV files. By considering the largest CSV file as the determining factor, the time complexity can be expressed as O(n), where n represents the number of rows in the largest CSV file considering "votes.csv", "vote_results.csv", "bills.csv", and "legislators.csv".
2. I believe the solution could easily account for a future column of co-sponsors. When I check for a sponsor I would also check for co-sponsor in a similar operation. Considering the file had a column such as "Bill voted on Date" and was asked to account only votes after or before a specific date, I would convert the dates to Date format and compare the voted date with the reference date before counting each vote.
3. The solutions wouldn't change much. Instead of parsing the csv with the file reading operations I would use array methods such as `forEach` and `map` or JS loops. Later I would populate the csv file on a similar way which I did on this solution.
4. I don't know exactly, started around 19h and finished around 23h. Took some breaks for dinner and other small activities.

### Considerations:

Javascript is not the ideal tool to do this kind of data manipulation, but I decided to use it because I am applying for a full stack position and javascript is the language which I am more familiar.