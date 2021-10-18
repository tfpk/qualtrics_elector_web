import pp from 'papaparse';

import qsfBaseFile from './qsf_components/SurveyBase.qsf';
import qsfQuestionFile from './qsf_components/SurveyQuestion.qsf';


function replace_REPLACE_with_properties(obj, properties) {
    const isObject = val =>
        typeof val === 'object' && !Array.isArray(val);

    if (obj && isObject(obj)) {
        Object.entries(obj).forEach(([key, value]) => {
         obj[key] =  replace_REPLACE_with_properties(value, properties);
       });

        return obj;
    }

    if (Array.isArray(obj)) {
        if (obj[0] === "REPLACE") {
            return properties[obj[1]] || obj[2];
        }
        return obj.map((x) => replace_REPLACE_with_properties(x, properties));
    }

    return obj;
}

function format_choice(choice) {
    return  `<strong>${choice.candidate_name}</strong><br/><div class="candidate-info">${choice.candidate_desc}</div>`;
}

function formatChoicesForQualtrics(choices) {
    return Object.fromEntries(choices.map((choice, i) => [`${i + 1}`, {"Display": choice}]))
}

function create_qualtrics_file(metadata, positions, candidates) {
    // First, let's add the important metadata we need.
    // The number of questions:
    metadata['question_count'] = `${positions.length}`;

    // This is a weird qsf property that looks like:
    // [
    //   {
    //     "Type": "Question",
    //     "QuestionID": "QID1"
    //   }
    // ]
    //
    // So we just generate it.
    metadata['question_blocks'] = positions.map((_, i) => ([{
        "Type": "Question",
        "QuestionID": `QID${i + 1}`,
    }])).reduce((prev, curr) => {
        return [...prev, {"Type": "Page Break"}, ...curr]
    });

    // Now get the QSF files we need
    let qsf = JSON.parse(qsfBaseFile);

    // Now for the fun bit. Anywhere you see a 3-long array of the form:
    // ["REPLACE", "question_blocks", "some_example_string"]
    // in the qsf, replace it with the relevant metadata.

    const qsfWithData = replace_REPLACE_with_properties(qsf, metadata);

    // Awesome, so last (and definitely not least), let's add in the actual survey questions

    const surveyQuestions = positions.map((position, i) => {
        // do this inside the loop so every Question is it's own object.
        const qsfQuestion = JSON.parse(qsfQuestionFile);

        const positionCandidates = candidates.filter((candidate) => candidate.position_code == position.code);

        const question = replace_REPLACE_with_properties(qsfQuestion, {
            question_id: `QID${i + 1}`,
            data_export_tag: position.code,
            question_text: position.question,
            choices: formatChoicesForQualtrics(positionCandidates.map(format_choice)),
            choices_order: positionCandidates.map((_, i) => i + 1),

            // These two can't be calculated inside the REPLACE function, so we prepare them
            max_choices: `${positionCandidates.length}`,
            next_choice: positionCandidates.length + 1,
        })

        question["Payload"]["QuestionJS"] = "Qualtrics.SurveyEngine.addOnload(function()\n{\n\t/*Place your JavaScript here to run when the page loads*/\n\n});\n\nQualtrics.SurveyEngine.addOnReady(function()\n{\n\tjQuery(\".candidate-info\").map(function(i) {\n        let me = this;\n        me.hide();\n        let node = document.createElement(\"button\");\n        node.style=\"margin-top: 6px; margin-botom: 6px;\";\n        node.innerText = \"Show/Hide Description\";\n\t\tnode.onclick = function () {\n             me.toggle();\n        }\n        me.before(node);\n\t})\n\n});\n\nQualtrics.SurveyEngine.addOnUnload(function()\n{\n\t/*Place your JavaScript here to run when the page is unloaded*/\n\n});";

        return question

    })

    qsfWithData['SurveyElements'] = [...qsfWithData['SurveyElements'], ...surveyQuestions];

    return qsfWithData;

}

function to_UTC7(date) {
    const d = new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: "Etc/GMT-7"}));
    const p = (x) => (0 <= x && x < 10) ? `0${x}` : x;
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours() + 1)}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}



export function qualtrics_setup(metadata, positionsText, candidatesText) {
    const parserConfig = {
        header: true,
        skipEmptyLines: true,
    };

    metadata['start_date'] = to_UTC7(metadata['start_date']);
    metadata['end_date'] = to_UTC7(metadata['end_date']);

    const positionsParsed = pp.parse(positionsText, parserConfig);

    if (positionsParsed.errors.length) {
        const errors = `Could not parse positions: \n${positionsParsed.errors}`;
        return [false, errors];
    }

    const positions = positionsParsed.data;

    const candidatesParsed = pp.parse(candidatesText, parserConfig);

    if (candidatesParsed.errors.length) {
        const errors = `Could not parse candidates: \n${candidatesParsed.errors}`;
        return [false, errors];
    }

    const candidates = candidatesParsed.data;

    return [true, create_qualtrics_file(metadata, positions, candidates)];

}
