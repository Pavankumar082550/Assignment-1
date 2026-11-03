// ------------------------------
// GENERAL SETTINGS
// ------------------------------

let currentUser = null;
let currentQuestion = 0;
let answers = [];
let timeLeft = 600;
let timerInterval = null;

const questions = [
    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Text Machine Language",
            "Hyper Tool Multi Language",
            "Home Text Markup Language"
        ],
        answer: 0
    },
    {
        question: "Which language is used for styling web pages?",
        options: ["Python", "CSS", "Java", "C++"],
        answer: 1
    },
    {
        question: "Which language is used to make web pages interactive?",
        options: ["HTML", "CSS", "JavaScript", "SQL"],
        answer: 2
    },
    {
        question: "Which company developed Java?",
        options: ["Microsoft", "Sun Microsystems", "Google", "Apple"],
        answer: 1
    },
    {
        question: "What does CPU stand for?",
        options: [
            "Central Processing Unit",
            "Computer Personal Unit",
            "Central Program Utility",
            "Control Processing User"
        ],
        answer: 0
    },
    {
        question: "Which one is an operating system?",
        options: ["Windows", "HTML", "CSS", "JavaScript"],
        answer: 0
    },
    {
        question: "Which symbol is used for comments in JavaScript (single line)?",
        options: ["<!-- -->", "//", "##", "**"],
        answer: 1
    },
    {
        question: "What does RAM stand for?",
        options: [
            "Read Access Memory",
            "Random Access Memory",
            "Run All Memory",
            "Ready Application Memory"
        ],
        answer: 1
    },
    {
        question: "Which HTML tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<p>"],
        answer: 1
    },
    {
        question: "Which data type stores true or false?",
        options: ["String", "Number", "Boolean", "Array"],
        answer: 2
    }
];


// ------------------------------
// PAGE NAVIGATION
// ------------------------------

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    document.getElementById(pageId).classList.remove("hidden");
}

function showDashboard() {
    if (!currentUser) return;

    showPage("dashboardPage");
    loadDashboard();
}


// ------------------------------
// STORAGE
// ------------------------------

function getAccounts() {
    return JSON.parse(localStorage.getItem("examAccounts")) || [];
}

function saveAccounts(accounts) {
    localStorage.setItem("examAccounts", JSON.stringify(accounts));
}

function getCurrentAccount() {
    if (!currentUser) return null;

    return getAccounts().find(
        account => account.username === currentUser
    );
}


// ------------------------------
// REGISTRATION
// ------------------------------

document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("email").value.trim() || "Not Provided";
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const message = document.getElementById("registerMessage");
    const accounts = getAccounts();

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }

    const exists = accounts.some(
        account => account.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
        message.textContent = "Username already exists.";
        return;
    }

    const newAccount = {
        fullName,
        username,
        email,
        password,
        createdAt: new Date().toLocaleString(),
        lastLogin: "Not logged in",
        lastLogout: "Not logged out",
        loginCount: 0,
        activityHistory: [],
        testHistory: []
    };

    accounts.push(newAccount);
    saveAccounts(accounts);

    message.style.color = "green";
    message.textContent = "Account created successfully! Please login.";

    document.getElementById("registerForm").reset();
});


// ------------------------------
// LOGIN
// ------------------------------

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    const accounts = getAccounts();

    const account = accounts.find(
        user =>
            user.username.toLowerCase() === username.toLowerCase() &&
            user.password === password
    );

    const message = document.getElementById("loginMessage");

    if (!account) {
        message.textContent = "Invalid username or password.";
        return;
    }

    currentUser = account.username;
    sessionStorage.setItem("currentUser", currentUser);

    account.lastLogin = new Date().toLocaleString();
    account.loginCount++;

    account.activityHistory.push({
        type: "Login",
        time: account.lastLogin
    });

    saveAccounts(accounts);

    message.textContent = "";
    document.getElementById("loginForm").reset();

    showDashboard();
});


// ------------------------------
// FORGOT PASSWORD
// ------------------------------

function showForgotPassword() {
    document.getElementById("forgotMessage").textContent =
        "For account assistance, contact help@onlineexam.com";
}


// ------------------------------
// DASHBOARD
// ------------------------------

function loadDashboard() {
    const account = getCurrentAccount();

    if (!account) return;

    document.getElementById("detailName").textContent = account.fullName;
    document.getElementById("detailUsername").textContent = account.username;
    document.getElementById("detailEmail").textContent =
        account.email || "Not Provided";
    document.getElementById("detailCreated").textContent = account.createdAt;

    document.getElementById("lastLogin").textContent = account.lastLogin;
    document.getElementById("loginCount").textContent = account.loginCount;
    document.getElementById("lastLogout").textContent = account.lastLogout;

    const activityList = document.getElementById("activityHistory");
    activityList.innerHTML = "";

    account.activityHistory.slice().reverse().forEach(activity => {
        const li = document.createElement("li");
        li.textContent = `${activity.type}: ${activity.time}`;
        activityList.appendChild(li);
    });

    const historyList = document.getElementById("testHistory");
    historyList.innerHTML = "";

    account.testHistory.slice().reverse().forEach(test => {
        const li = document.createElement("li");
        li.textContent =
            `${test.date} - Score: ${test.score}/${test.total} (${test.percentage}%)`;
        historyList.appendChild(li);
    });

    const tests = account.testHistory;
    const total = tests.length;

    const average = total
        ? Math.round(tests.reduce((sum, test) => sum + test.percentage, 0) / total)
        : 0;

    const last = total ? tests[tests.length - 1].percentage : 0;

    document.getElementById("totalExams").textContent = total;
    document.getElementById("averageScore").textContent = average + "%";
    document.getElementById("lastScore").textContent = last + "%";
}


// ------------------------------
// LOGOUT
// ------------------------------

function logout() {
    const account = getCurrentAccount();

    if (account) {
        account.lastLogout = new Date().toLocaleString();

        account.activityHistory.push({
            type: "Logout",
            time: account.lastLogout
        });

        saveAccounts(getAccounts());
    }

    currentUser = null;
    sessionStorage.removeItem("currentUser");

    clearInterval(timerInterval);

    showPage("loginPage");
}


// ------------------------------
// EXAMINATION
// ------------------------------

function startExam() {
    currentQuestion = 0;
    answers = new Array(questions.length).fill(null);
    timeLeft = 600;

    showPage("examPage");
    displayQuestion();
    startTimer();
}

function displayQuestion() {
    const question = questions[currentQuestion];

    document.getElementById("questionNumber").textContent =
        `Question ${currentQuestion + 1} of ${questions.length}`;

    document.getElementById("questionText").textContent =
        question.question;

    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";

    question.options.forEach((option, index) => {
        const label = document.createElement("label");
        label.className = "option";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "answer";
        radio.value = index;
        radio.checked = answers[currentQuestion] === index;

        radio.addEventListener("change", function() {
            answers[currentQuestion] = index;
        });

        label.appendChild(radio);
        label.appendChild(document.createTextNode(option));

        optionsContainer.appendChild(label);
    });
}

function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
    } else {
        alert("This is the last question. Please submit your exam.");
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}


// ------------------------------
// EXAM TIMER
// ------------------------------

function startTimer() {
    clearInterval(timerInterval);

    updateTimerDisplay();

    timerInterval = setInterval(function() {
        timeLeft--;

        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time is over. Your exam will be submitted.");
            submitExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    document.getElementById("timer").textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


// ------------------------------
// SUBMIT EXAM AND RESULTS
// ------------------------------

function submitExam() {
    if (!currentUser) return;

    if (timeLeft > 0) {
        const confirmSubmit = confirm("Are you sure you want to submit the examination?");
        if (!confirmSubmit) return;
    }

    clearInterval(timerInterval);

    let correct = 0;
    let wrong = 0;
    let unansweredCount = 0;

    questions.forEach((question, index) => {
        if (answers[index] === null) {
            unansweredCount++;
        } else if (answers[index] === question.answer) {
            correct++;
        } else {
            wrong++;
        }
    });

    const percentage = Math.round((correct / questions.length) * 100);

    document.getElementById("resultScore").textContent =
        `${correct}/${questions.length}`;

    document.getElementById("correctAnswers").textContent = correct;
    document.getElementById("wrongAnswers").textContent = wrong;
    document.getElementById("unanswered").textContent = unansweredCount;
    document.getElementById("percentage").textContent = percentage + "%";

    document.getElementById("resultStatus").textContent =
        percentage >= 40 ? "PASS" : "FAIL";

    const accounts = getAccounts();
    const account = accounts.find(user => user.username === currentUser);

    if (account) {
        account.testHistory.push({
            date: new Date().toLocaleString(),
            score: correct,
            total: questions.length,
            percentage
        });

        saveAccounts(accounts);
    }

    showPage("resultPage");
}


// ------------------------------
// RESTORE SESSION
// ------------------------------

window.addEventListener("load", function() {
    const savedUser = sessionStorage.getItem("currentUser");

    if (savedUser) {
        const account = getAccounts().find(
            user => user.username === savedUser
        );

        if (account) {
            currentUser = savedUser;
            showDashboard();
            return;
        }

        sessionStorage.removeItem("currentUser");
    }

    showPage("loginPage");
});