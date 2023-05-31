const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const legislatorSupportWriter = createCsvWriter({
    path: 'results/legislators-support-oppose-count.csv',
    header: [
      { id: 'id', title: 'id' },
      { id: 'name', title: 'name' },
      { id: 'num_supported_bills', title: 'num_supported_bills' },
      { id: 'num_opposed_bills', title: 'num_opposed_bills' }
    ]
  });

const billSupportWriter = createCsvWriter({
    path: 'results/bills-support-oppose-count.csv',
    header: [
      { id: 'bill_id', title: 'id' },
      { id: 'title', title: 'title' },
      { id: 'supporter_count', title: 'supporter_count' },
      { id: 'opposer_count', title: 'opposer_count' },
      { id: 'sponsor', title: 'primary_sponsor' }
    ]
  });

const votes = new Map;
const storeBillVotes = {} 
fs.createReadStream('data/votes.csv')
    .pipe(csv())
    .on('data', (data) => {
        votes.set(data.id, {
            bill_id: data.bill_id,
            supporter_count: 0,
            opposer_count: 0,
        })
        storeBillVotes[data.bill_id] = data.id
    }
    )
    .on('end', () => {
        const legislatoresVotes = new Map();
        fs.createReadStream('data/vote_results.csv')
            .pipe(csv())
            .on('data', (data) => {
                // get votes by bill
                const voteData = votes.get(data.vote_id)
                if (data.vote_type === "1") {
                    voteData.supporter_count++
                } else {
                    voteData.opposer_count++
                }
                votes.set(data.vote_id, voteData)

                // get votes by legislator
                let legislator_votes = legislatoresVotes.get(data.legislator_id)
                if (!legislator_votes) {
                    legislator_votes = {
                        num_supported_bills: 0,
                        num_opposed_bills: 0
                    }   
                } 
                if (data.vote_type === "1") {
                    legislator_votes.num_supported_bills++
                } else {
                    legislator_votes.num_opposed_bills++
                }
                legislatoresVotes.set(data.legislator_id, legislator_votes)
            })
            .on('end', () => {
                const storeSponsorVote = {}
                fs.createReadStream('data/bills.csv')
                    .pipe(csv())
                    .on('data', (data) => {
                        // get bill title and sponsor id
                        const vote_id = storeBillVotes[data.id]
                        const voteData = votes.get(vote_id)
                        votes.set(vote_id, {
                            ...voteData,
                            title: data.title,
                            sponsor_id: data.sponsor_id,
                            sponsor: "Unknown"
                        })
                        storeSponsorVote[data.sponsor_id] = vote_id
                    })
                    .on('end', () => {
                        const legislatorSupport = []
                        fs.createReadStream('data/legislators.csv')
                            .pipe(csv())
                            .on('data', (data) => {
                                // check if legislator is the sponsor of bill and save if it is
                                const vote_id = storeSponsorVote[data.id]
                                if (vote_id) {
                                    const voteData = votes.get(vote_id)
                                    votes.set(vote_id, {
                                        ...voteData,
                                        sponsor: data.name
                                    })
                                }

                                // get legislator information and associating to their id so I can use vote information
                                const legislatorData = legislatoresVotes.get(data.id)
                                const legislatorInfo = {
                                    id: data.id,
                                    name: data.name,
                                }
                                if (legislatorData) {
                                    legislatorSupport.push({
                                        ...legislatorInfo,
                                        num_supported_bills: legislatorData.num_supported_bills,
                                        num_opposed_bills: legislatorData.num_opposed_bills,
                                    })
                                } else {
                                    legislatorSupport.push({
                                        ...legislatorInfo,
                                        num_supported_bills: 0,
                                        num_opposed_bills: 0
                                    })
                                }                                
                            })
                            .on('end', () => {
                                const billSupport = [ ...votes.values() ]
                                legislatorSupportWriter.writeRecords(legislatorSupport)
                                .then(() => console.log('Legislator Support CSV file done.'))
                                .catch((err) => console.error('Error writing Legislator Support CSV file:', err));
                                billSupportWriter.writeRecords(billSupport)
                                .then(() => console.log('Bill Support CSV file done.'))
                                .catch((err) => console.error('Error writing Bill Support CSV file:', err));
                            })
                    })
            })
    });
