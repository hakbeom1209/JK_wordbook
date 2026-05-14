const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");

const homeSection = document.getElementById("homeSection");
const createBookSection = document.getElementById("createBookSection");
const bookDetailSection = document.getElementById("bookDetailSection");

const createWordbookButton = document.getElementById("createWordbookButton");
const saveBookButton = document.getElementById("saveBookButton");

const wordbookList = document.getElementById("wordbookList");
const bookNameInput = document.getElementById("bookNameInput");

const backButton = document.getElementById("backButton");
const bookTitle = document.getElementById("bookTitle");

const addWordButton = document.getElementById("addWordButton");
const addWordSection = document.getElementById("addWordSection");
const saveWordButton = document.getElementById("saveWordButton");

const englishInput = document.getElementById("englishInput");
const koreanInput = document.getElementById("koreanInput");
const wordListArea = document.getElementById("wordListArea");

const deletePopup = document.getElementById("deletePopup");
const editPopup = document.getElementById("editPopup");

const cancelDeleteButton = document.getElementById("cancelDeleteButton");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");

const cancelEditButton = document.getElementById("cancelEditButton");
const confirmEditButton = document.getElementById("confirmEditButton");

const editEnglishInput = document.getElementById("editEnglishInput");
const editKoreanInput = document.getElementById("editKoreanInput");

const toggleWordListButton = document.getElementById("toggleWordListButton");

const logoutButton = document.getElementById("logoutButton");

let isWordListOpen = false;

let selectedWordId = null;

let currentBookId = null;

showRegister.addEventListener("click", () => {
    loginSection.classList.add("hidden");
    registerSection.classList.remove("hidden");
});

showLogin.addEventListener("click", () => {
    registerSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});

registerButton.addEventListener("click", async () => {
    const username = document.getElementById("registerId").value.trim();
    const password = document.getElementById("registerPw").value;
    const pwCheck = document.getElementById("registerPwCheck").value;

    if (username === "" || password === "" || pwCheck === "") {
        alert("모든 내용을 입력하세요.");
        return;
    }

    if (password !== pwCheck) {
        alert("비밀번호가 서로 다릅니다.");
        return;
    }

    const res = await fetch("/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
        alert("회원가입 완료");
        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
    } else {
        alert(data.message);
    }
});

loginButton.addEventListener("click", async () => {
    const username = document.getElementById("loginId").value.trim();
    const password = document.getElementById("loginPw").value;

    const res = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
        loginSection.classList.add("hidden");
        registerSection.classList.add("hidden");
        homeSection.classList.remove("hidden");

        logoutButton.classList.remove("hidden");

        loadWordbooks();
    } else {
        alert(data.message);
    }
});

createWordbookButton.addEventListener("click", () => {
    createBookSection.classList.remove("hidden");
});

saveBookButton.addEventListener("click", async () => {
    const title = bookNameInput.value.trim();

    if (title === "") {
        alert("단어장 이름을 입력하세요.");
        return;
    }

    const res = await fetch("/create_wordbook", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
    });

    const data = await res.json();

    if (data.success) {
        bookNameInput.value = "";
        createBookSection.classList.add("hidden");
        loadWordbooks();
    } else {
        alert("단어장 생성 실패");
    }
});

async function loadWordbooks() {
    const res = await fetch("/get_wordbooks");
    const books = await res.json();

    wordbookList.innerHTML = "";

    for (let book of books) {
        const newBook = document.createElement("div");
        newBook.className = "wordbook-card";
        newBook.dataset.id = book.id;

        newBook.innerHTML = `
        <h2>${book.title}</h2>
        <p>단어 0개</p>
    `;

        wordbookList.appendChild(newBook);
    }
}

wordbookList.addEventListener("click", (e) => {
    const card = e.target.closest(".wordbook-card");

    if (!card) return;

    const title = card.querySelector("h2").innerText;

    currentBookId = card.dataset.id;
    bookTitle.innerText = title;

    homeSection.classList.add("hidden");
    createBookSection.classList.add("hidden");
    bookDetailSection.classList.remove("hidden");

    isWordListOpen = false;
    wordListArea.classList.add("hidden");
    toggleWordListButton.innerText = "단어 리스트 펼치기";

    loadWords();
});

addWordButton.addEventListener("click", () => {
    bookDetailSection.classList.add("hidden");
    addWordSection.classList.remove("hidden");
});

saveWordButton.addEventListener("click", async () => {
    const english = englishInput.value.trim();
    const korean = koreanInput.value.trim();

    if (english === "" || korean === "") {
        alert("영어 단어와 뜻을 입력하세요.");
        return;
    }

    const res = await fetch("/add_word", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            wordbook_id: currentBookId,
            english,
            korean
        })
    });

    const data = await res.json();

    if (data.success) {
        englishInput.value = "";
        koreanInput.value = "";

        addWordSection.classList.add("hidden");
        bookDetailSection.classList.remove("hidden");

        loadWords();
    } else {
        alert("단어 추가 실패");
    }
});

async function loadWords() {
    const res = await fetch(`/get_words/${currentBookId}`);
    const words = await res.json();

    wordListArea.innerHTML = "";

    if (words.length === 0) {
        wordListArea.innerHTML = `<p class="empty-word">아직 추가된 단어가 없습니다.</p>`;
        return;
    }

    for (let word of words) {
        const item = document.createElement("div");
        item.className = "word-item";
        item.dataset.id = word.id;

        item.innerHTML = `
            <div class="word-content">
                <div class="word-row">
                    <span class="word-label">단어</span>
                    <strong>${word.english}</strong>
                </div>

                <div class="word-row">
                    <span class="word-label">의미</span>
                    <strong>${word.korean}</strong>
                </div>
            </div>

            <div class="word-actions">
                <button class="edit-word-btn">수정</button>
                <button class="delete-word-btn">삭제</button>
            </div>
        `;

        wordListArea.appendChild(item);
    }
}

backButton.addEventListener("click", () => {
    bookDetailSection.classList.add("hidden");
    homeSection.classList.remove("hidden");
});

wordListArea.addEventListener("click", (e) => {
    const item = e.target.closest(".word-item");
    if (!item) return;

    selectedWordId = item.dataset.id;

    if (e.target.classList.contains("delete-word-btn")) {
        deletePopup.classList.remove("hidden");
    }

    if (e.target.classList.contains("edit-word-btn")) {
        const rows = item.querySelectorAll(".word-row strong");

        editEnglishInput.value = rows[0].innerText;
        editKoreanInput.value = rows[1].innerText;

        editPopup.classList.remove("hidden");
    }
});

cancelDeleteButton.addEventListener("click", () => {
    deletePopup.classList.add("hidden");
    selectedWordId = null;
});

confirmDeleteButton.addEventListener("click", async () => {
    const res = await fetch(`/delete_word/${selectedWordId}`, {
        method: "DELETE"
    });

    const data = await res.json();

    if (data.success) {
        deletePopup.classList.add("hidden");
        selectedWordId = null;
        loadWords();
    }
});

cancelEditButton.addEventListener("click", () => {
    editPopup.classList.add("hidden");
    selectedWordId = null;
});

confirmEditButton.addEventListener("click", async () => {
    const english = editEnglishInput.value.trim();
    const korean = editKoreanInput.value.trim();

    if (english === "" || korean === "") {
        return;
    }

    const res = await fetch(`/update_word/${selectedWordId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            english,
            korean
        })
    });

    const data = await res.json();

    if (data.success) {
        editPopup.classList.add("hidden");
        selectedWordId = null;
        loadWords();
    }
});

toggleWordListButton.addEventListener("click", () => {
    isWordListOpen = !isWordListOpen;

    if (isWordListOpen) {
        wordListArea.classList.remove("hidden");
        toggleWordListButton.innerText = "단어 리스트 접기";
    } else {
        wordListArea.classList.add("hidden");
        toggleWordListButton.innerText = "단어 리스트 펼치기";
    }
});

window.addEventListener("load", async () => {
    const res = await fetch("/check_login");
    const data = await res.json();

    if (data.login) {

        loginSection.classList.add("hidden");
        registerSection.classList.add("hidden");

        homeSection.classList.remove("hidden");

        logoutButton.classList.remove("hidden");

        loadWordbooks();
    }
});

logoutButton.addEventListener("click", async () => {
    const res = await fetch("/logout", {
        method: "POST"
    });

    const data = await res.json();

    if (data.success) {

        // 전부 숨기기
        homeSection.classList.add("hidden");
        registerSection.classList.add("hidden");
        createBookSection.classList.add("hidden");
        bookDetailSection.classList.add("hidden");
        addWordSection.classList.add("hidden");

        // 로그인창 보이기
        loginSection.classList.remove("hidden");

        // 로그아웃 버튼 숨기기
        logoutButton.classList.add("hidden");

        // 입력칸 초기화
        document.getElementById("loginId").value = "";
        document.getElementById("loginPw").value = "";
    }
});