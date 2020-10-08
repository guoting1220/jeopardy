// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;
const TOTAL_NUM_CATEGORIES_FROM_RESOURSE = 18413;

let categories = [];

//=======================================================
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
    let randomCatIds = [];
    while (randomCatIds.length < NUM_CATEGORIES) {
        let randomIndex = getRandomNum(TOTAL_NUM_CATEGORIES_FROM_RESOURSE - 1);
        let cat = await axios.get(
            `http://jservice.io/api/categories?count=1&offset=${randomIndex}`);
        let randomId = cat.data[0].id;
        if (cat.data[0].clues_count >= NUM_QUESTIONS_PER_CAT && randomCatIds.indexOf(randomId) === -1) {
            randomCatIds.push(randomId);
        }
    }

    return randomCatIds;
}

//=======================================================
// get a random number form 0 to max (including max)
function getRandomNum(max) {
    if (max < 0) {
        throw "The given number should not be negative!"
    }
    return Math.floor(Math.random() * (max + 1));
}

//======================================================
// create a n random numers from 0 to max (including max) array without duplicates
function getRandomNumsArr(n, max) {
    if (n > max + 1) {
        throw "invalid number!"
    }
    let arr = [];
    while (arr.length < n) {
        let randomNum = getRandomNum(max);
        if (arr.indexOf(randomNum) === -1) {
            arr.push(randomNum);
        }
    }
    return arr;
}

//=======================================================
/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let cat = await axios.get(`http://jservice.io/api/category?id=${catId}`);
    let catObj = {};
    catObj.title = cat.data.title;
    let randomCluesIndexes = getRandomNumsArr(NUM_QUESTIONS_PER_CAT, cat.data.clues_count - 1);
    let randomCluesArr = [];
    for (let index of randomCluesIndexes) {
        let clue = cat.data.clues[index];
        let extractedClue = {};
        extractedClue.question = clue.question;
        extractedClue.answer = clue.answer;
        extractedClue.showing = null;
        randomCluesArr.push(extractedClue);
    }
    catObj.clues = randomCluesArr;
    return catObj;
}

//======================================================
// implement "categories"
async function makeCategories() {
    categories = [];
    let randomCatIds = await getCategoryIds();
    for (let catId of randomCatIds) {
        let catObj = await getCategory(catId);
        categories.push(catObj);
    }
}

//=======================================================
/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    $("#theadRow").empty();
    $("#tbody").empty();
    await makeCategories();
    fillTableHead();
    fillTableBody();
    //don't put the eventListener inside here, will add multiple listener, conflict!
}

//======================================================
function fillTableHead() {
    for (let cat of categories) {
        $(`<th>${cat.title}</th>`).appendTo($("#theadRow"));
    }
}

//=======================================================
function fillTableBody() {
    for (let y = 0; y < NUM_QUESTIONS_PER_CAT; y++) {
        $(`<tr id=${y}></tr>`).appendTo($("#tbody"));
        for (let x = 0; x < NUM_CATEGORIES; x++) {
            $(`<td id=${y}-${x}><div><p>?</p></div></td>`).appendTo($(`#${y}`));
        }
    }
}

//=======================================================
/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let $clickedTd = $(evt.target).closest("td"); 
    let clickedID = $clickedTd.attr("id");
    let clueForClickedTd = categories[clickedID[2]].clues[clickedID[0]];
    //e.g. {question: "2+2", answer: 4, showing: null}
    if (clueForClickedTd.showing === null) {
        $clickedTd.text(clueForClickedTd.question);
        clueForClickedTd.showing = "question";
    }
    else if (clueForClickedTd.showing === "question") {
        $clickedTd.text(clueForClickedTd.answer);
        clueForClickedTd.showing = "answer";
        $clickedTd.css("background-color", "#709670");
    } else {
        return;
    }

}


//=======================================================
/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

// function myFunction() {
//     myVar = setTimeout(showPage, 3000);
// }

// function showPage() {
//     document.getElementById("loader").style.display = "none";
//     document.getElementById("myDiv").style.display = "block";
// }

function showLoadingView() {
    $("#loader").css("display", "block");
    $("#startBtn").text("Loading ...").css("font-size", "13px");
    // $("#startBtn").text("Loading ...").addClass("loading");
    //addClass to change the font size doesn't work, because id style has higher priority than class.
}

//=======================================================
/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    $("#loader").css("display", "none");
    $("#startBtn").text("Restart").css("font-size", "20px");;
}

//=======================================================
/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    await fillTable();
}



/** On click of start / restart button, set up game. */

$("#startBtn").on("click", async function () {
    showLoadingView();
    await setupAndStart();
    hideLoadingView();
});


/** On page load, add event handler for clicking clues */
$("#tbody").on("click", "td", handleClick);

