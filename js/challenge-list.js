const API_BASE = "http://localhost:8080";
const API_CHALLENGES = `${API_BASE}/api/challenges`;

let allChallenges = [];

function setupBackButton() {
    const backButton = document.getElementById("challenge-back-button");
    if (!backButton) return;

    backButton.addEventListener("click", () => {
        history.back();
    });
}

function setupHeader() {
    const logoLink = document.querySelector(".main-header__logo a");
    const mypageButton = document.querySelector(".main-header__mypage");
    const dropdown = document.getElementById("mypage-dropdown");
    const profileItem = document.getElementById("mypage-profile");
    const logoutItem = document.getElementById("mypage-logout");

    if (!logoLink || !mypageButton || !dropdown) return;

    logoLink.addEventListener("click", (event) => {
        event.preventDefault();
        location.href = "main.html";
    });

    mypageButton.addEventListener("click", () => {
        dropdown.classList.toggle("main-header__dropdown--open");
    });

    profileItem?.addEventListener("click", () => {
        location.href = "mypage.html";
    });

    logoutItem?.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("accessToken");
        location.href = "login.html";
    });

    document.addEventListener("click", (event) => {
        if (
            mypageButton.contains(event.target) ||
            dropdown.contains(event.target)
        ) {
            return;
        }
        dropdown.classList.remove("main-header__dropdown--open");
    });
}

async function fetchChallenges() {
    const result = await apiClient.get(API_CHALLENGES);
    return result.data || [];
}

function mapCategoryToKorean(category) {
    switch (category) {
        case "STUDY":
            return "공부";
        case "HEALTH":
            return "운동";
        case "READING":
            return "독서";
        case "LIFE":
            return "생활습관";
        case "ETC":
            return "기타";
        default:
            return category ?? "";
    }
}

function formatDueDate(dueDate) {
    if (!dueDate) {
        return "마감일: 기한 없음";
    }

    const date = new Date(dueDate);
    if (Number.isNaN(date.getTime())) {
        return "마감일: 기한 없음";
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `마감일: ${y}.${m}.${d}`;
}

function createChallengeCard(challenge) {
    const li = document.createElement("li");
    li.className = "challenge-card";

    const left = document.createElement("div");
    left.className = "challenge-card__left";

    const categoryEl = document.createElement("div");
    categoryEl.className = "challenge-card__category";
    categoryEl.textContent = `#${mapCategoryToKorean(challenge.category)}`;
    left.appendChild(categoryEl);

    const titleEl = document.createElement("div");
    titleEl.className = "challenge-card__title";
    titleEl.textContent = challenge.title;
    left.appendChild(titleEl);

    const dueEl = document.createElement("div");
    dueEl.className = "challenge-card__meta";
    const endDate = challenge.endDate ?? challenge.dueDate ?? null;
    dueEl.textContent = formatDueDate(endDate);
    left.appendChild(dueEl);

    const participantEl = document.createElement("div");
    participantEl.className = "challenge-card__meta";
    participantEl.textContent = `참여: ${challenge.participantCount ?? 0}명`;
    left.appendChild(participantEl);

    li.appendChild(left);

    const right = document.createElement("div");
    right.className = "challenge-card__right";

    const statusEl = document.createElement("span");
    statusEl.className = "challenge-card__action";
    statusEl.textContent = challenge.joined ? "참여중" : "참여하기";

    right.appendChild(statusEl);
    li.appendChild(right);

    li.addEventListener("click", (event) => {
        event.stopPropagation();

        const params = new URLSearchParams({
            challengeId: String(challenge.id),
            joined: String(challenge.joined ?? false),
            participantCount: String(challenge.participantCount ?? 0),
        });

        location.href = `challenge-apply.html?${params.toString()}`;
    });

    return li;
}

function renderChallengeList(challenges) {
    const listEl = document.getElementById("challenge-list");
    const emptyEl = document.getElementById("challenge-empty");

    if (!listEl || !emptyEl) return;

    if (!challenges || challenges.length === 0) {
        emptyEl.style.display = "block";
        listEl.style.display = "none";
        listEl.innerHTML = "";
        return;
    }

    emptyEl.style.display = "none";
    listEl.style.display = "block";
    listEl.innerHTML = "";

    challenges.forEach((challenge) => {
        const li = createChallengeCard(challenge);
        listEl.appendChild(li);
    });
}

function setupCategoryFilter() {
    let activeCategory = null;
    const chips = document.querySelectorAll(".category-chip");
    if (!chips || chips.length === 0) return;

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            const category = chip.dataset.category;

            if (activeCategory === category) {
                activeCategory = null;
                chips.forEach((c) =>
                    c.classList.remove("category-chip--active")
                );
                renderChallengeList(allChallenges);
                return;
            }

            activeCategory = category;

            chips.forEach((c) =>
                c.classList.remove("category-chip--active")
            );
            chip.classList.add("category-chip--active");

            const filtered = allChallenges.filter(
                (ch) => ch.category === category
            );
            renderChallengeList(filtered);
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        location.href = "login.html";
        return;
    }

    setupBackButton();
    setupHeader();

    try {
        allChallenges = await fetchChallenges();
        renderChallengeList(allChallenges);
        setupCategoryFilter();
    } catch (e) {
        console.error(e);
        alert("챌린지 목록을 불러오는 데 실패했습니다.");
    }
});
