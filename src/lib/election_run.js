import pp from 'papaparse';
import _irv from './irv.js';
const irv = _irv.irv;

export function parse_results(votingResultsText, election, removeNames) {

    const parserConfig = {
        header: false,
        skipEmptyLines: true,
    };
    const parsedVotingResults = pp.parse(votingResultsText, parserConfig);
    if (parsedVotingResults.errors.length > 0) {
        console.log(parsedVotingResults);
        return [false, `<pre>${JSON.stringify(parsedVotingResults)}</pre>`];
    }
    const votingResults = parsedVotingResults.data;


    const electionIndexes = [];
    // header row
    votingResults.shift().forEach((code, i) => {
        if (code.startsWith(election)) {
            electionIndexes.push(i);
        }
    });

    // question info
    const questionHTML = electionIndexes.map((i) => votingResults[0][i]);
    votingResults.shift();
    // Get rid of import ids
    votingResults.shift();

    // This is a bit hacky.
    const candidates = questionHTML.map((html) => html.split("<strong>")[1].split("</strong>")[0]);

    // Get the numbers from the relevant ballots
    let ballots = votingResults
          .map((ballot) => ballot
               .filter((_, i) => electionIndexes.includes(i))
               .map((num) => num ? Number.parseInt(num) : 0)
              );

    const beforeBallots = JSON.parse(JSON.stringify(ballots));
    // Remove people who are instructed to be removed.

    const removeIndexes = removeNames.map((name) => candidates.indexOf(name));
    console.log(removeIndexes);
    removeIndexes.forEach((removeIndex) => {
        ballots = ballots.map((ballot) => {
            const valueRemoved = ballot[removeIndex];
            return ballot.map((vote, i) => {
                if (i == removeIndex) return 0;
                if (vote > valueRemoved && valueRemoved > 0) return vote - 1;
                return vote;
            });
        });
    });
    const afterBallots = JSON.parse(JSON.stringify(ballots));
    beforeBallots.forEach((b, i) => {
        if (JSON.stringify(afterBallots[i]) !== JSON.stringify(b)) {
            console.log(JSON.stringify([b, afterBallots[i]]));
        }
    })

    // Whether to use a secondary tie breaker.
    const tiebreakerSecondary = false;

    // Whether to allow incomplete ballots
    const incompleteBallots = true;

    // threshold -- set to 50% (i.e. majority)
    const threshold = 50;

    irv.emptyResults();

    const isValid = irv.validateInput(candidates, ballots, incompleteBallots, threshold);
    const validResults = irv.getResults();

    if (!isValid) {
        console.error("Could not run IRV calculator.")
        return [false, validResults];
    }

    irv.emptyResults();

    const winner = irv.calculateWinner(candidates, ballots, tiebreakerSecondary, threshold);
    const results = irv.getResults();

    if (isValid) {
        results.push(`Finished: ${winner} <br/>`);
    } else {
        results.push("Could not get result. <br/>")
        results.push(`Got: ${winner} <br/>`);
    }

    return [true, results]

}
